import * as firebase from "firebase";
import { MockFirestore } from "./firestore";

export class MockDocumentReference<T = firebase.firestore.DocumentData>
  implements firebase.firestore.DocumentReference<T> {
  get path(): string {
    return this.parent.path + "/" + this.id;
  }

  constructor(
    public readonly firestore: MockFirestore,
    public readonly id: string,
    public readonly parent: firebase.firestore.CollectionReference<T>,
    public readonly converter: firebase.firestore.FirestoreDataConverter<T>
  ) {}

  collection(
    collectionPath: string
  ): firebase.firestore.CollectionReference<firebase.firestore.DocumentData> {
    throw new Error("Method not implemented.");
  }
  isEqual(other: firebase.firestore.DocumentReference<T>): boolean {
    throw new Error("Method not implemented.");
  }
  set(data: T, options?: firebase.firestore.SetOptions | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  update(data: firebase.firestore.UpdateData): Promise<void>;
  update(
    field: string | firebase.firestore.FieldPath,
    value: any,
    ...moreFieldsAndValues: any[]
  ): Promise<void>;
  update(data: any, ...rest: any[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  get(
    options?: firebase.firestore.GetOptions | undefined
  ): Promise<firebase.firestore.DocumentSnapshot<T>> {
    throw new Error("Method not implemented.");
  }

  onSnapshot(observer: {
    next?: ((snapshot: firebase.firestore.DocumentSnapshot<T>) => void) | undefined;
    error?: ((error: firebase.firestore.FirestoreError) => void) | undefined;
    complete?: (() => void) | undefined;
  }): () => void;
  onSnapshot(
    options: firebase.firestore.SnapshotListenOptions,
    observer: {
      next?: ((snapshot: firebase.firestore.DocumentSnapshot<T>) => void) | undefined;
      error?: ((error: Error) => void) | undefined;
      complete?: (() => void) | undefined;
    }
  ): () => void;
  onSnapshot(
    onNext: (snapshot: firebase.firestore.DocumentSnapshot<T>) => void,
    onError?: ((error: Error) => void) | undefined,
    onCompletion?: (() => void) | undefined
  ): () => void;
  onSnapshot(
    options: firebase.firestore.SnapshotListenOptions,
    onNext: (snapshot: firebase.firestore.DocumentSnapshot<T>) => void,
    onError?: ((error: Error) => void) | undefined,
    onCompletion?: (() => void) | undefined
  ): () => void;
  onSnapshot(options: any, onNext?: any, onError?: any, onCompletion?: any): () => void {
    throw new Error("Method not implemented.");
  }

  withConverter<U>(
    converter: firebase.firestore.FirestoreDataConverter<U>
  ): firebase.firestore.DocumentReference<U> {
    return new MockDocumentReference(
      this.firestore,
      this.id,
      this.parent.withConverter(converter),
      converter
    );
  }
}
