import * as firebase from "firebase";
import { MockApp } from "../app";
import { EventEmitter } from "../util";
import { CollectionReference } from "./collection-reference";
import { DataContainer } from "./data-container";
import { DocumentReference } from "./document-reference";
import { Query } from "./query";
import { DataConverter } from "./data-converter";

export class MockFirestore
  implements firebase.firestore.Firestore, DataContainer<CollectionReference> {
  // ?
  INTERNAL: { delete: () => Promise<void> };

  private id = 0;
  public readonly children = new Map<string, CollectionReference>();
  public readonly data = new Map<string, firebase.firestore.DocumentData>();
  public readonly collectionEvents = new Map<string, EventEmitter>();

  constructor(public readonly app: MockApp) {}

  batch(): firebase.firestore.WriteBatch {
    throw new Error("Method not implemented.");
  }

  clearPersistence(): Promise<void> {
    return Promise.resolve();
  }

  enablePersistence(settings?: firebase.firestore.PersistenceSettings): Promise<void> {
    return Promise.resolve();
  }

  enableNetwork(): Promise<void> {
    return Promise.resolve();
  }

  disableNetwork(): Promise<void> {
    return Promise.resolve();
  }

  private child(path: string[]) {
    const converter = new DataConverter();
    return path.reduce(
      (container, part, i) =>
        i % 2 === 0
          ? new CollectionReference(this, part, i === 0 ? null : container, converter)
          : new DocumentReference(this, part, container, converter),
      this as any
    );
  }

  collection(collectionPath: string): CollectionReference {
    const path = collectionPath.split("/").filter(Boolean);
    if (path.length % 2 === 0) {
      throw new Error("Not a collection");
    }

    return this.child(path);
  }

  collectionGroup(collectionId: string): Query {
    throw new Error("Method not implemented.");
  }

  doc(documentPath: string): DocumentReference {
    const path = documentPath.split("/").filter(Boolean);
    if (path.length % 2 === 1) {
      throw new Error("Not a document");
    }

    return this.child(path);
  }

  nextId() {
    return "__id" + this.id++;
  }

  onSnapshotsInSync(observer: {
    next?: (value: void) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }): () => void;
  onSnapshotsInSync(onSync: () => void): () => void;
  onSnapshotsInSync(observerOrOnSync: any): () => void {
    throw new Error("Method not implemented.");
  }

  runTransaction<T>(
    updateFunction: (transaction: firebase.firestore.Transaction) => Promise<T>
  ): Promise<T> {
    throw new Error("Method not implemented.");
  }

  settings(settings: firebase.firestore.Settings): void {}

  terminate(): Promise<void> {
    return Promise.resolve();
  }

  waitForPendingWrites(): Promise<void> {
    return Promise.resolve();
  }
}
