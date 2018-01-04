import * as firebase from "firebase";
import { CollectionReference } from "./collection-reference";
import { DataContainer } from "./data-container";
import { DocumentSnapshot } from "./document-snapshot";
import { MockFirestore } from "./firestore";

export class DocumentReference
  implements firebase.firestore.DocumentReference, DataContainer<CollectionReference> {
  public readonly children: Map<string, CollectionReference>;

  public get data(): {} {
    return this.firestore.data.get(this.path) || {};
  }

  get path(): string {
    return this.parent.path + "/" + this.id;
  }

  constructor(
    public readonly firestore: MockFirestore,
    public readonly id: string,
    public readonly parent: CollectionReference
  ) {
    let ref = parent.children.get(id);

    if (!ref) {
      this.children = new Map();
      ref = this;
      parent.children.set(id, this);
    }

    this.children = ref.children;
  }

  collection(collectionPath: string): CollectionReference {
    return new CollectionReference(this.firestore, this.id, this);
  }

  isEqual(other: firebase.firestore.DocumentReference): boolean {
    throw new Error("Method not implemented.");
  }

  set(
    data: firebase.firestore.DocumentData,
    options: firebase.firestore.SetOptions | undefined = {}
  ): Promise<void> {
    this.firestore.data.set(this.path, Object.assign(options.merge ? this.data : {}, data));
    return Promise.resolve();
  }

  update(data: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  get(): Promise<firebase.firestore.DocumentSnapshot> {
    return Promise.resolve(new DocumentSnapshot(this, Object.assign({}, this.data)));
  }

  onSnapshot(observer: {
    next?: ((snapshot: firebase.firestore.DocumentSnapshot) => void) | undefined;
    error?: ((error: firebase.firestore.FirestoreError) => void) | undefined;
    complete?: (() => void) | undefined;
  }): () => void;

  onSnapshot(
    options: firebase.firestore.DocumentListenOptions,
    observer: {
      next?: ((snapshot: firebase.firestore.DocumentSnapshot) => void) | undefined;
      error?: ((error: Error) => void) | undefined;
      complete?: (() => void) | undefined;
    }
  ): () => void;

  onSnapshot(
    onNext: (snapshot: firebase.firestore.DocumentSnapshot) => void,
    onError?: ((error: Error) => void) | undefined,
    onCompletion?: (() => void) | undefined
  ): () => void;

  onSnapshot(
    options: firebase.firestore.DocumentListenOptions,
    onNext: (snapshot: firebase.firestore.DocumentSnapshot) => void,
    onError?: ((error: Error) => void) | undefined,
    onCompletion?: (() => void) | undefined
  ): () => void;

  onSnapshot(options: any, onNext?: any, onError?: any, onCompletion?: any): () => void {
    throw new Error("Method not implemented.");
  }
}
