import * as firebase from "firebase";
import { Observer } from "../util";
import { MockFirestore } from "./firestore";
import { MockQuery } from "./query";

export class MockCollectionGroup<T = firebase.firestore.DocumentData> extends MockQuery<T> {
  // A list of onSnapshot calls that have been proxied to other collections and the disposers.
  private activeListeners: {
    listener: Observer<firebase.firestore.QuerySnapshot<T>>;
    disposers: (() => void)[];
  }[] = [];

  constructor(
    firestore: MockFirestore,
    id: string,
    converter: firebase.firestore.FirestoreDataConverter<T>
  ) {
    super(firestore, id, converter);
    firestore.onNewCollection(this.maybeHookNewCollection.bind(this));
  }

  async emitChange() {
    // No-op
  }

  clone(): MockCollectionGroup<T> {
    const group = new MockCollectionGroup(this.firestore, this.path, this.converter);
    Object.assign(group, this);
    group.filters = Object.assign({}, this.filters);
    return group;
  }

  private maybeHookNewCollection(path: string) {
    if (!path.endsWith("/" + this.path)) {
      return;
    }

    const collection = this.firestore.collection(path).setNoInitialSnapshot();
    this.activeListeners.forEach((listener) => {
      listener.disposers.push(collection.onSnapshot(listener.listener));
    });
  }

  private getCandidateCollections() {
    return Array.from(this.firestore.collectionDocuments.keys()).filter((path) =>
      path.endsWith("/" + this.path)
    );
  }

  getCandidateDocKeys() {
    return new Set(
      this.getCandidateCollections().reduce<string[]>((docs, path) => {
        return docs.concat(Array.from(this.firestore.collectionDocuments.get(path)!));
      }, [])
    );
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

    const { next, error } = actualListeners;

    const listenerIndex = this.activeListeners.length;
    this.activeListeners.push({
      listener: actualListeners,
      disposers: this.getCandidateCollections().map((path) => {
        return this.firestore
          .collection(path)
          .setNoInitialSnapshot()
          .onSnapshot(
            () =>
              this.get().then((snapshot) => {
                next(snapshot);
              }),
            error
          );
      }),
    });

    this.get().then((snapshot) => next(snapshot));

    return () => {
      this.activeListeners[listenerIndex].disposers.forEach((disposer) => disposer());
      this.activeListeners.splice(listenerIndex, 1);
    };
  }
}
