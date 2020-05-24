import * as firebase from "firebase";
import { EventEmitter, Observer } from "../util";
import { MockQueryDocumentSnapshot } from "./document-snapshot";
import { MockFirestore } from "./firestore";
import { MockQuerySnapshot } from "./query-snapshot";

type QueryFilter = (doc: MockQueryDocumentSnapshot) => boolean;
type Ordering = {
  fieldPath: string;
  direction: "asc" | "desc";
};

export const QUERY_SNAPSHOT_NEXT_EVENT = "snapshot:next";
export const QUERY_SNAPSHOT_ERROR_EVENT = "snapshot:error";
export const QUERY_SNAPSHOT_COMPLETE_EVENT = "snapshot:complete";

export class MockQuery<T = firebase.firestore.DocumentData> implements firebase.firestore.Query<T> {
  private docsLimit = Infinity;
  private filters: Record<string, QueryFilter> = {};
  private ordering?: Ordering;

  protected get emitter() {
    const emitter = this.firestore.collectionEvents.get(this.path) || new EventEmitter();
    this.firestore.collectionEvents.set(this.path, emitter);
    return emitter;
  }

  constructor(
    public readonly firestore: MockFirestore,
    public readonly path: string,
    public converter: firebase.firestore.FirestoreDataConverter<T>
  ) {}

  public async emitChange() {
    if (!this.emitter.hasListeners(QUERY_SNAPSHOT_NEXT_EVENT)) {
      return;
    }

    // TODO: this emits even if there wasn't an actual change with the current filters
    const snapshot = await this.get();
    this.emitter.emit(QUERY_SNAPSHOT_NEXT_EVENT, [snapshot]);
  }

  private clone(): MockQuery<T> {
    const query = new MockQuery(this.firestore, this.path, this.converter);
    Object.assign(query, this);
    query.filters = Object.assign({}, this.filters);
    return query;
  }

  where(
    fieldPath: string | firebase.firestore.FieldPath,
    opStr: firebase.firestore.WhereFilterOp,
    value: any
  ): firebase.firestore.Query<T> {
    const key = `where:${fieldPath}:${opStr}:${value}`;
    const query = this.clone();
    query.filters[key] = (doc) => {
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
    };
    return query;
  }

  orderBy(
    fieldPath: string | firebase.firestore.FieldPath,
    direction: "desc" | "asc" = "asc"
  ): firebase.firestore.Query<T> {
    if (fieldPath instanceof firebase.firestore.FieldPath) {
      throw new Error("Ordering a query by FieldPath is not supported");
    }

    const query = this.clone();
    query.ordering = { fieldPath, direction };
    return query;
  }

  limit(limit: number): firebase.firestore.Query<T> {
    const query = this.clone();
    query.docsLimit = limit;
    return query;
  }

  limitToLast(limit: number): firebase.firestore.Query<T> {
    throw new Error("Method not implemented.");
  }

  startAt(snapshot: firebase.firestore.DocumentSnapshot<any>): firebase.firestore.Query<T>;
  startAt(...fieldValues: any[]): firebase.firestore.Query<T>;
  startAt(snapshot?: any, ...rest: any[]): firebase.firestore.Query<T> {
    throw new Error("Method not implemented.");
  }

  startAfter(snapshot: firebase.firestore.DocumentSnapshot<any>): firebase.firestore.Query<T>;
  startAfter(...fieldValues: any[]): firebase.firestore.Query<T>;
  startAfter(snapshot?: any, ...rest: any[]): firebase.firestore.Query<T> {
    throw new Error("Method not implemented.");
  }

  endBefore(snapshot: firebase.firestore.DocumentSnapshot<any>): firebase.firestore.Query<T>;
  endBefore(...fieldValues: any[]): firebase.firestore.Query<T>;
  endBefore(snapshot?: any, ...rest: any[]): firebase.firestore.Query<T> {
    throw new Error("Method not implemented.");
  }

  endAt(snapshot: firebase.firestore.DocumentSnapshot<any>): firebase.firestore.Query<T>;
  endAt(...fieldValues: any[]): firebase.firestore.Query<T>;
  endAt(snapshot?: any, ...rest: any[]): firebase.firestore.Query<T> {
    throw new Error("Method not implemented.");
  }

  isEqual(other: firebase.firestore.Query<T>): boolean {
    if (
      other.firestore !== this.firestore ||
      !(other instanceof MockQuery) ||
      other.path !== this.path ||
      other.converter !== this.converter
    ) {
      return false;
    }

    const filtersMatch =
      Object.keys(other.filters).join(",") === Object.keys(this.filters).join(",");
    const limitMatches = other.docsLimit === this.docsLimit;
    if (!filtersMatch || !limitMatches) {
      return false;
    }

    if ((!other.ordering && this.ordering) || (other.ordering && !this.ordering)) {
      return false;
    }

    const orderingMatches =
      other.ordering?.direction === this.ordering?.direction &&
      other.ordering?.fieldPath === this.ordering?.fieldPath;
    if (!orderingMatches) {
      return false;
    }

    return true;
  }

  private compareFunction(a: MockQueryDocumentSnapshot<T>, b: MockQueryDocumentSnapshot<T>) {
    if (!this.ordering) {
      return 0;
    }

    const aValue = a.get(this.ordering.fieldPath);
    const bValue = b.get(this.ordering.fieldPath);
    const result = aValue <= bValue ? -1 : 1;
    return result * (this.ordering.direction === "asc" ? 1 : -1);
  }

  get(options?: firebase.firestore.GetOptions): Promise<MockQuerySnapshot<T>> {
    const collDocs = this.firestore.collectionDocuments.get(this.path) || new Set();
    const allDocs = Array.from(collDocs.values());
    const allSnapshots = allDocs.map(
      (doc) =>
        new MockQueryDocumentSnapshot(
          this.firestore.doc(doc).withConverter(this.converter),
          this.firestore.documentData.get(doc)!
        )
    );

    const actualSnapshots = allSnapshots
      .filter((snapshot) => Object.values(this.filters).every((filter) => filter(snapshot)))
      .sort(this.compareFunction.bind(this))
      .slice(0, this.docsLimit);

    return Promise.resolve(new MockQuerySnapshot(this, actualSnapshots));
  }

  onSnapshot(observer: Observer<firebase.firestore.QuerySnapshot<T>>): () => void;
  onSnapshot(
    options: firebase.firestore.SnapshotListenOptions,
    observer: Observer<firebase.firestore.QuerySnapshot<T>>
  ): () => void;
  onSnapshot(
    onNext: (snapshot: firebase.firestore.QuerySnapshot<T>) => void,
    onError?: ((error: Error) => void) | undefined,
    onCompletion?: (() => void) | undefined
  ): () => void;
  onSnapshot(
    options: firebase.firestore.SnapshotListenOptions,
    onNext: (snapshot: firebase.firestore.QuerySnapshot<T>) => void,
    onError?: ((error: Error) => void) | undefined,
    onCompletion?: (() => void) | undefined
  ): () => void;
  onSnapshot(options: any, onNext?: any, onError?: any, onCompletion?: any): () => void {
    let actualListeners: Observer<firebase.firestore.QuerySnapshot<T>>;

    if (typeof options === "object") {
      if (typeof onNext === "object") {
        actualListeners = onNext;
      } else if (typeof onNext === "function") {
        actualListeners = {
          next: onNext,
          error: onError,
          complete: onCompletion,
        };
      } else {
        actualListeners = options;
      }
    } else {
      actualListeners = {
        next: options,
        error: onNext,
        complete: onError,
      };
    }

    const { next, complete, error } = actualListeners;
    this.emitter.on(QUERY_SNAPSHOT_NEXT_EVENT, next);
    error && this.emitter.on(QUERY_SNAPSHOT_ERROR_EVENT, error);
    complete && this.emitter.on(QUERY_SNAPSHOT_COMPLETE_EVENT, complete);

    this.get().then((snapshot) => next(snapshot));

    return () => {
      this.emitter.off(QUERY_SNAPSHOT_NEXT_EVENT, next);
      error && this.emitter.off(QUERY_SNAPSHOT_ERROR_EVENT, error);
      complete && this.emitter.off(QUERY_SNAPSHOT_COMPLETE_EVENT, complete);
    };
  }

  withConverter<U>(converter: firebase.firestore.FirestoreDataConverter<U>): MockQuery<U> {
    const query = (this.clone() as unknown) as MockQuery<U>;
    query.converter = converter;
    return query;
  }
}
