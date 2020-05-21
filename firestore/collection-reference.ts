import * as firebase from "firebase";
import { EventEmitter } from "../util";
import { MockFirestore, Query } from "./";
import { DataContainer } from "./data-container";
import { DocumentReference } from "./document-reference";

export const COLLECTION_CHANGE_EVENT = "change";

export class CollectionReference<T = firebase.firestore.DocumentData>
  implements firebase.firestore.CollectionReference<T>, DataContainer<DocumentReference> {
  public readonly children: Map<string, DocumentReference<any>>;

  get emitter() {
    return this.firestore.collectionEvents.get(this.path)!;
  }

  get path(): string {
    const parent = this.parent ? this.parent.path : "";
    return parent + "/" + this.id;
  }

  constructor(
    public readonly firestore: MockFirestore,
    public readonly id: string,
    public readonly parent: DocumentReference<any> | null = null,
    public readonly converter: firebase.firestore.FirestoreDataConverter<T>
  ) {
    const dataContainer: DataContainer<CollectionReference> = parent || firestore;

    let ref = dataContainer.children.get(id);

    if (!ref) {
      this.children = new Map();
      ref = this;
      dataContainer.children.set(id, this);
    }

    this.children = ref.children;

    if (!this.firestore.collectionEvents.has(this.path)) {
      this.firestore.collectionEvents.set(this.path, new EventEmitter());
    }
  }

  doc(documentPath?: string | undefined): DocumentReference<T> {
    return new DocumentReference(
      this.firestore,
      documentPath || this.firestore.nextId(),
      this,
      this.converter
    );
  }

  add(data: T): Promise<DocumentReference<T>> {
    const doc = this.doc();
    return doc.set(data).then(() => doc);
  }

  where(
    fieldPath: string | firebase.firestore.FieldPath,
    opStr: firebase.firestore.WhereFilterOp,
    value: any
  ): firebase.firestore.Query<T> {
    return new Query(this).where(fieldPath, opStr, value);
  }

  orderBy(
    fieldPath: string | firebase.firestore.FieldPath,
    directionStr?: "desc" | "asc" | undefined
  ): firebase.firestore.Query<T> {
    return new Query(this).orderBy(fieldPath, directionStr);
  }

  limit(limit: number): firebase.firestore.Query<T> {
    return new Query(this).limit(limit);
  }

  limitToLast(limit: number): firebase.firestore.Query<T> {
    throw new Error("Method not implemented.");
  }

  startAt(snapshot: firebase.firestore.DocumentSnapshot<T>): firebase.firestore.Query<T>;
  startAt(...fieldValues: any[]): firebase.firestore.Query<T>;
  startAt(snapshot?: any, ...rest: any[]): firebase.firestore.Query<T> {
    return new Query(this).startAt(snapshot, ...rest);
  }

  startAfter(snapshot: firebase.firestore.DocumentSnapshot<T>): firebase.firestore.Query<T>;
  startAfter(...fieldValues: any[]): firebase.firestore.Query<T>;
  startAfter(snapshot?: any, ...rest: any[]): firebase.firestore.Query<T> {
    return new Query(this).startAfter(snapshot, ...rest);
  }

  endBefore(snapshot: firebase.firestore.DocumentSnapshot<T>): firebase.firestore.Query<T>;
  endBefore(...fieldValues: any[]): firebase.firestore.Query<T>;
  endBefore(snapshot?: any, ...rest: any[]): firebase.firestore.Query<T> {
    return new Query(this).endBefore(snapshot, ...rest);
  }

  endAt(snapshot: firebase.firestore.DocumentSnapshot<T>): firebase.firestore.Query<T>;
  endAt(...fieldValues: any[]): firebase.firestore.Query<T>;
  endAt(snapshot?: any, ...rest: any[]): firebase.firestore.Query<T> {
    return new Query(this).endAt(snapshot, ...rest);
  }

  isEqual(other: firebase.firestore.Query<any>): boolean {
    throw new Error("Method not implemented.");
  }

  get(): Promise<firebase.firestore.QuerySnapshot<T>> {
    return new Query(this).get();
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
    return new Query(this).onSnapshot(options, onNext, onError, onCompletion);
  }

  withConverter<U>(
    converter: firebase.firestore.FirestoreDataConverter<U>
  ): CollectionReference<U> {
    return new CollectionReference(this.firestore, this.id, this.parent, converter);
  }
}
