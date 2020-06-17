import * as firebase from "firebase";
import { EventEmitter, Observer } from "../util";
import { MockCollectionReference } from "./collection-reference";
import { MockDocumentSnapshot } from "./document-snapshot";
import { MockFirestore } from "./firestore";

export const SNAPSHOT_NEXT_EVENT = "snapshot:next";
export const SNAPSHOT_ERROR_EVENT = "snapshot:error";

export class MockDocumentReference<T = firebase.firestore.DocumentData>
  implements firebase.firestore.DocumentReference<T> {
  get path(): string {
    return this.parent.path + "/" + this.id;
  }

  private get emitter() {
    const emitter = this.firestore.documentEvents.get(this.path) || new EventEmitter();
    this.firestore.documentEvents.set(this.path, emitter);
    return emitter;
  }

  private get currentData() {
    return this.firestore.documentData.get(this.path);
  }

  constructor(
    public readonly firestore: MockFirestore,
    public readonly id: string,
    public readonly parent: MockCollectionReference<T>,
    public readonly converter: firebase.firestore.FirestoreDataConverter<T>,
    private readonly emitEvents = true
  ) {}

  async emitChange() {
    if (!this.emitEvents) {
      return;
    }

    const snapshot = await this.get();
    this.emitter.emit(SNAPSHOT_NEXT_EVENT, [snapshot]);
    this.parent.emitChange();
  }

  collection(
    collectionPath: string
  ): firebase.firestore.CollectionReference<firebase.firestore.DocumentData> {
    return this.firestore.collection(this.path + "/" + collectionPath);
  }

  isEqual(other: firebase.firestore.DocumentReference<T>): boolean {
    return (
      other.firestore === this.firestore &&
      other.path === this.path &&
      other instanceof MockDocumentReference &&
      other.converter === this.converter
    );
  }

  set(data: T, options: firebase.firestore.SetOptions | undefined = {}): Promise<void> {
    if (options.mergeFields && options.mergeFields.length) {
      throw new Error("Option mergeFields is not supported");
    }

    const parsedData = this.converter.toFirestore(data);

    this.firestore.writeDocument(
      this,
      Object.assign(options.merge ? this.currentData : {}, parsedData)
    );
    return this.emitChange();
  }

  update(data: firebase.firestore.UpdateData): Promise<void>;
  update(
    field: string | firebase.firestore.FieldPath,
    value: any,
    ...moreFieldsAndValues: any[]
  ): Promise<void>;
  async update(data: any, ...rest: any[]): Promise<void> {
    if (typeof data === "string" || data instanceof firebase.firestore.FieldPath) {
      throw new Error("Document updating by field is not supported");
    }

    if (this.currentData === undefined) {
      throw new Error(`Document doesn't exist: ${this.path}`);
    }

    const currentData = { ...this.currentData };

    let changed = false;
    Object.keys(data).forEach((key) => {
      key.split(".").reduce((obj, part, index, path) => {
        if (path.length === index + 1) {
          changed = changed || data[key] !== obj[part] || obj[part] === undefined;
          obj[part] = data[key];
        } else {
          changed = changed || obj[part] === undefined;
          obj[part] = typeof obj[part] === "object" ? obj[part] : {};
        }

        return obj[part];
      }, currentData);
    });

    if (changed) {
      this.firestore.writeDocument(this, currentData);
      await this.emitChange();
    }
  }

  async delete(): Promise<void> {
    const existed = !!this.currentData;

    if (existed) {
      this.firestore.writeDocument(this, undefined);
      await this.emitChange();
    }
  }

  get(options?: firebase.firestore.GetOptions): Promise<MockDocumentSnapshot<T>> {
    return Promise.resolve(
      new MockDocumentSnapshot(this, this.currentData ? Object.assign(this.currentData) : undefined)
    );
  }

  onSnapshot(observer: Observer<firebase.firestore.DocumentSnapshot<T>>): () => void;
  onSnapshot(
    options: firebase.firestore.SnapshotListenOptions,
    observer: Observer<firebase.firestore.DocumentSnapshot<T>>
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
    let actualListeners: Observer<firebase.firestore.DocumentSnapshot<T>>;

    if (typeof options === "object") {
      if (typeof onNext === "object") {
        actualListeners = onNext;
      } else if (typeof onNext === "function") {
        actualListeners = {
          next: onNext,
          error: onError,
        };
      } else {
        actualListeners = options;
      }
    } else {
      actualListeners = {
        next: options,
        error: onNext,
      };
    }

    this.emitter.on(SNAPSHOT_NEXT_EVENT, actualListeners.next);
    actualListeners.error && this.emitter.on(SNAPSHOT_ERROR_EVENT, actualListeners.error);

    // Don't emit SNAPSHOT_NEXT_EVENT otherwise every listener will get it
    this.get().then((snapshot) => actualListeners.next(snapshot));

    return () => {
      this.emitter.off(SNAPSHOT_NEXT_EVENT, actualListeners.next);
      actualListeners.error && this.emitter.off(SNAPSHOT_ERROR_EVENT, actualListeners.error);
    };
  }

  withConverter<U>(
    converter: firebase.firestore.FirestoreDataConverter<U>
  ): MockDocumentReference<U> {
    return new MockDocumentReference(
      this.firestore,
      this.id,
      this.parent.withConverter(converter),
      converter
    );
  }
}
