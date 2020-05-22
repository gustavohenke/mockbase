import * as firebase from "firebase";
import { MockFirestore } from "./firestore";
import { MockDocumentSnapshot } from "./document-snapshot";

export class MockDocumentReference<T = firebase.firestore.DocumentData>
  implements firebase.firestore.DocumentReference<T> {
  get path(): string {
    return this.parent.path + "/" + this.id;
  }

  private get currentData() {
    return this.firestore.documentData.get(this.path);
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
    return this.firestore.collection(this.path + "/" + collectionPath);
  }
  isEqual(other: firebase.firestore.DocumentReference<T>): boolean {
    throw new Error("Method not implemented.");
  }
  set(data: T, options: firebase.firestore.SetOptions | undefined = {}): Promise<void> {
    if (options.mergeFields && options.mergeFields.length) {
      throw new Error("Option mergeFields is not supported");
    }

    const parsedData = this.converter.toFirestore(data);

    this.firestore.documentData.set(
      this.path,
      Object.assign(options.merge ? this.currentData : {}, parsedData)
    );
    return Promise.resolve();
  }

  update(data: firebase.firestore.UpdateData): Promise<void>;
  update(
    field: string | firebase.firestore.FieldPath,
    value: any,
    ...moreFieldsAndValues: any[]
  ): Promise<void>;
  update(data: any, ...rest: any[]): Promise<void> {
    if (typeof data === "string" || data instanceof firebase.firestore.FieldPath) {
      throw new Error("Document updating by field is not supported");
    }

    Object.keys(data).forEach((key) => {
      key.split(".").reduce((obj, part, index, path) => {
        if (path.length === index + 1) {
          obj[part] = data[key];
        } else {
          obj[part] = typeof obj[part] === "object" ? obj[part] : {};
        }

        return obj[part];
      }, this.currentData || {});
    });
    return Promise.resolve();
  }

  delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  get(
    options?: firebase.firestore.GetOptions | undefined
  ): Promise<firebase.firestore.DocumentSnapshot<T>> {
    return Promise.resolve(
      new MockDocumentSnapshot(this, this.currentData ? Object.assign(this.currentData) : undefined)
    );
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
