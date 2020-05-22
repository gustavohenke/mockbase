import * as firebase from "firebase";
import { MockFirestore } from "./firestore";

export class MockCollectionReference<T = firebase.firestore.DocumentData>
  implements firebase.firestore.CollectionReference<T> {
  get path(): string {
    const parent = this.parent ? this.parent.path : "";
    return parent + "/" + this.id;
  }

  constructor(
    public readonly firestore: MockFirestore,
    public readonly id: string,
    public readonly parent: firebase.firestore.DocumentReference | null
  ) {}

  doc(documentPath?: string | undefined): firebase.firestore.DocumentReference<T> {
    throw new Error("Method not implemented.");
  }
  add(data: T): Promise<firebase.firestore.DocumentReference<T>> {
    throw new Error("Method not implemented.");
  }
  isEqual(other: firebase.firestore.CollectionReference<T>): boolean {
    throw new Error("Method not implemented.");
  }
  where(
    fieldPath: string | firebase.firestore.FieldPath,
    opStr: firebase.firestore.WhereFilterOp,
    value: any
  ): firebase.firestore.Query<T> {
    throw new Error("Method not implemented.");
  }
  orderBy(
    fieldPath: string | firebase.firestore.FieldPath,
    directionStr?: "desc" | "asc" | undefined
  ): firebase.firestore.Query<T> {
    throw new Error("Method not implemented.");
  }
  limit(limit: number): firebase.firestore.Query<T> {
    throw new Error("Method not implemented.");
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

  get(
    options?: firebase.firestore.GetOptions | undefined
  ): Promise<firebase.firestore.QuerySnapshot<T>> {
    throw new Error("Method not implemented.");
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

  withConverter<U>(
    converter: firebase.firestore.FirestoreDataConverter<U>
  ): firebase.firestore.CollectionReference<U> {
    throw new Error("Method not implemented.");
  }
}
