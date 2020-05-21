import * as firebase from "firebase";
import { EventEmitter } from "../util";
import { COLLECTION_CHANGE_EVENT, CollectionReference } from "./collection-reference";
import { DataContainer } from "./data-container";
import { DocumentSnapshot } from "./document-snapshot";
import { MockFirestore } from "./firestore";
import { DataConverter } from "./data-converter";

export const SNAPSHOT_NEXT_EVENT = "snapshot:next";
export const SNAPSHOT_ERROR_EVENT = "snapshot:error";
export const SNAPSHOT_COMPLETE_EVENT = "snapshot:complete";

export class DocumentReference<T = firebase.firestore.DocumentData>
  implements firebase.firestore.DocumentReference<T>, DataContainer<CollectionReference> {
  public readonly children: Map<string, CollectionReference<any>>;

  private readonly emitter = new EventEmitter();

  public get data(): firebase.firestore.DocumentData | undefined {
    return this.firestore.data.get(this.path);
  }

  get path(): string {
    return this.parent.path + "/" + this.id;
  }

  constructor(
    public readonly firestore: MockFirestore,
    public readonly id: string,
    public readonly parent: CollectionReference<any>,
    private readonly converter: firebase.firestore.FirestoreDataConverter<T>
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
    return new CollectionReference(this.firestore, collectionPath, this, new DataConverter());
  }

  isEqual(other: firebase.firestore.DocumentReference<any>): boolean {
    throw new Error("Method not implemented.");
  }

  set(data: T, options: firebase.firestore.SetOptions | undefined = {}): Promise<void> {
    const parsedData = this.converter.toFirestore(data);
    this.firestore.data.set(this.path, Object.assign(options.merge ? this.data : {}, parsedData));
    return this.get().then((snapshot) => {
      this.parent.emitter.emit(COLLECTION_CHANGE_EVENT);
      this.emitter.emit(SNAPSHOT_NEXT_EVENT, [snapshot]);
    });
  }

  update(data: firebase.firestore.UpdateData): Promise<void>;
  update(
    field: string | firebase.firestore.FieldPath,
    value: any,
    ...moreFieldsAndValues: any[]
  ): Promise<void>;

  update(
    data: firebase.firestore.UpdateData | string | firebase.firestore.FieldPath
  ): Promise<void> {
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
      }, this.data || {});
    });
    return this.get().then((snapshot) => {
      this.parent.emitter.emit(COLLECTION_CHANGE_EVENT);
      this.emitter.emit(SNAPSHOT_NEXT_EVENT, [snapshot]);
    });
  }
  delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  get(options?: firebase.firestore.GetOptions): Promise<DocumentSnapshot<T>> {
    return Promise.resolve(
      new DocumentSnapshot(this, Object.assign({}, this.data), this.converter)
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

    this.emitter.on(SNAPSHOT_NEXT_EVENT, actualListeners.next);
    this.emitter.on(SNAPSHOT_ERROR_EVENT, actualListeners.error);

    this.get().then((snapshot) => this.emitter.emit(SNAPSHOT_NEXT_EVENT, [snapshot]));

    return () => {
      this.emitter.off(SNAPSHOT_NEXT_EVENT, actualListeners.next);
      this.emitter.off(SNAPSHOT_ERROR_EVENT, actualListeners.error);
    };
  }

  withConverter<U>(converter: firebase.firestore.FirestoreDataConverter<U>): DocumentReference<U> {
    return new DocumentReference(this.firestore, this.id, this.parent, converter);
  }
}
