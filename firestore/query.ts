import * as firebase from "firebase";
import { EventEmitter } from "../util";
import {
  COLLECTION_CHANGE_EVENT,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
  MockFirestore
} from "./";

interface QueryFilter {
  (doc: DocumentSnapshot): boolean;
}

interface Ordering {
  fieldPath: string;
  direction: "asc" | "desc";
}

export const QUERY_SNAPSHOT_NEXT_EVENT = "snapshot:next";
export const QUERY_SNAPSHOT_ERROR_EVENT = "snapshot:error";
export const QUERY_SNAPSHOT_COMPLETE_EVENT = "snapshot:complete";

export class Query implements firebase.firestore.Query {
  get firestore(): MockFirestore {
    return this.collection.firestore;
  }

  private readonly emitter = new EventEmitter();
  private readonly filters = new Map<string, QueryFilter>();
  private ordering: Ordering;
  private docsLimit = Infinity;

  constructor(private readonly collection: CollectionReference) {
    this.collection.emitter.on(COLLECTION_CHANGE_EVENT, async () => {
      const snapshot = await this.get();
      this.emitter.emit(QUERY_SNAPSHOT_NEXT_EVENT, [snapshot]);
    });
  }

  where(
    fieldPath: string | firebase.firestore.FieldPath,
    opStr: firebase.firestore.WhereFilterOp,
    value: any
  ): firebase.firestore.Query {
    this.filters.set(`where:${fieldPath}:${opStr}:${value}`, doc => {
      const fieldValue = doc.get(fieldPath.toString());

      switch (opStr) {
        case "==":
          return fieldValue == value;

        case ">":
          return fieldValue > value;

        case "<":
          return fieldValue < value;

        case ">=":
          return fieldValue >= value;

        case "<=":
          return fieldValue <= value;

        default:
          return true;
      }
    });

    return this;
  }

  orderBy(
    fieldPath: string | firebase.firestore.FieldPath,
    directionStr: "desc" | "asc" = "asc"
  ): firebase.firestore.Query {
    this.ordering = {
      fieldPath: fieldPath.toString(),
      direction: directionStr
    };

    return this;
  }

  limit(limit: number): firebase.firestore.Query {
    this.docsLimit = limit;
    return this;
  }

  startAt(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
  startAt(...fieldValues: any[]): firebase.firestore.Query;
  startAt(snapshot?: any, ...rest: any[]): firebase.firestore.Query {
    throw new Error("Method not implemented.");
  }

  startAfter(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
  startAfter(...fieldValues: any[]): firebase.firestore.Query;
  startAfter(snapshot?: any, ...rest: any[]): firebase.firestore.Query {
    throw new Error("Method not implemented.");
  }

  endBefore(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
  endBefore(...fieldValues: any[]): firebase.firestore.Query;
  endBefore(snapshot?: any, ...rest: any[]): firebase.firestore.Query {
    throw new Error("Method not implemented.");
  }

  endAt(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
  endAt(...fieldValues: any[]): firebase.firestore.Query;
  endAt(snapshot?: any, ...rest: any[]): firebase.firestore.Query {
    throw new Error("Method not implemented.");
  }

  isEqual(other: firebase.firestore.Query): boolean {
    throw new Error("Method not implemented.");
  }

  private compareFunction(a: DocumentSnapshot, b: DocumentSnapshot): number {
    if (!this.ordering) {
      return -1;
    }

    const aValue = a.get(this.ordering.fieldPath);
    const bValue = b.get(this.ordering.fieldPath);
    const result = aValue <= bValue ? -1 : 1;
    return result * (this.ordering.direction === "asc" ? 1 : -1);
  }

  async get(): Promise<firebase.firestore.QuerySnapshot> {
    const allDocs = Array.from(this.collection.children.values());
    const allSnapshots = await Promise.all(allDocs.map(doc => doc.get()));
    const actualSnapshots = allSnapshots
      .filter(snapshot => Array.from(this.filters.values()).every(filter => filter(snapshot)))
      .sort(this.compareFunction.bind(this))
      .slice(0, this.docsLimit);

    return new QuerySnapshot(actualSnapshots);
  }

  onSnapshot(observer: {
    next?: ((snapshot: firebase.firestore.QuerySnapshot) => void) | undefined;
    error?: ((error: Error) => void) | undefined;
    complete?: (() => void) | undefined;
  }): () => void;

  onSnapshot(
    options: firebase.firestore.QueryListenOptions,
    observer: {
      next?: ((snapshot: firebase.firestore.QuerySnapshot) => void) | undefined;
      error?: ((error: Error) => void) | undefined;
      complete?: (() => void) | undefined;
    }
  ): () => void;

  onSnapshot(
    onNext: (snapshot: firebase.firestore.QuerySnapshot) => void,
    onError?: ((error: Error) => void) | undefined,
    onCompletion?: (() => void) | undefined
  ): () => void;

  onSnapshot(
    options: firebase.firestore.QueryListenOptions,
    onNext: (snapshot: firebase.firestore.QuerySnapshot) => void,
    onError?: ((error: Error) => void) | undefined,
    onCompletion?: (() => void) | undefined
  ): () => void;

  onSnapshot(options: any, onNext?: any, onError?: any, onCompletion?: any): () => void {
    let actualListeners: any = {};

    if (typeof options === "object") {
      if (typeof onNext === "object") {
        actualListeners = onNext;
      } else if (typeof onNext === "function") {
        actualListeners.next = onNext;
        actualListeners.error = onError;
      } else {
        actualListeners = options;
      }
    } else {
      actualListeners.next = options;
      actualListeners.error = onNext;
    }

    this.emitter.on(QUERY_SNAPSHOT_NEXT_EVENT, actualListeners.next);
    this.emitter.on(QUERY_SNAPSHOT_ERROR_EVENT, actualListeners.error);

    this.get().then(snapshot => actualListeners.next(snapshot));

    return () => {
      this.emitter.off(QUERY_SNAPSHOT_NEXT_EVENT, actualListeners.next);
      this.emitter.off(QUERY_SNAPSHOT_ERROR_EVENT, actualListeners.error);
    };
  }
}
