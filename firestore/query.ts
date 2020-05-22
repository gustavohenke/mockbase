import * as firebase from "firebase";
import { MockFirestore } from "./firestore";
import { MockDocumentSnapshot } from "./document-snapshot";
import { MockQueryDocumentSnapshot } from "./query-document-snapshot";
import { MockQuerySnapshot } from "./query-snapshot";

type QueryFilter = (doc: MockDocumentSnapshot) => boolean;
type Ordering = {
  fieldPath: string;
  direction: "asc" | "desc";
};

export class MockQuery<T = firebase.firestore.DocumentData> implements firebase.firestore.Query<T> {
  private docsLimit = Infinity;
  private filters: Record<string, QueryFilter> = {};
  private ordering?: Ordering;

  constructor(
    public readonly firestore: MockFirestore,
    public readonly path: string,
    public converter: firebase.firestore.FirestoreDataConverter<T>
  ) {}

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
    throw new Error("Method not implemented.");
  }

  private readonly compareFunction = (
    a: MockQueryDocumentSnapshot<T>,
    b: MockQueryDocumentSnapshot<T>
  ) => {
    if (!this.ordering) {
      return -1;
    }

    const aValue = a.get(this.ordering.fieldPath);
    const bValue = b.get(this.ordering.fieldPath);
    const result = aValue <= bValue ? -1 : 1;
    return result * (this.ordering.direction === "asc" ? 1 : -1);
  };

  get(options?: firebase.firestore.GetOptions | undefined): Promise<MockQuerySnapshot<T>> {
    const allDocs = Array.from(this.firestore.collectionDocuments.values());
    const allSnapshots = allDocs.map(
      (doc) =>
        new MockQueryDocumentSnapshot(
          this.firestore.doc(doc).withConverter(this.converter),
          this.firestore.documentData.get(doc)!
        )
    );
    const actualSnapshots = allSnapshots
      .filter((snapshot) => Object.values(this.filters).every((filter) => filter(snapshot)))
      .sort(this.compareFunction)
      .slice(0, this.docsLimit);

    return Promise.resolve(new MockQuerySnapshot(this, actualSnapshots));
  }

  onSnapshot(observer: {
    next?: ((snapshot: firebase.firestore.QuerySnapshot<T>) => void) | undefined;
    error?: ((error: Error) => void) | undefined;
    complete?: (() => void) | undefined;
  }): () => void;
  onSnapshot(
    options: firebase.firestore.SnapshotListenOptions,
    observer: {
      next?: ((snapshot: firebase.firestore.QuerySnapshot<T>) => void) | undefined;
      error?: ((error: Error) => void) | undefined;
      complete?: (() => void) | undefined;
    }
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
    throw new Error("Method not implemented.");
  }

  withConverter<U>(converter: firebase.firestore.FirestoreDataConverter<U>): MockQuery<U> {
    const query = (this.clone() as unknown) as MockQuery<U>;
    query.converter = converter;
    return query;
  }
}
