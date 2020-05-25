import * as firebase from "firebase";
import { MockApp } from "../app";
import { EventEmitter } from "../util";
import { MockCollectionReference } from "./collection-reference";
import { DEFAULT_DATA_CONVERTER } from "./data-converter";
import { MockDocumentReference } from "./document-reference";
import { MockCollectionGroup } from "./collection-group";

const NEW_COLLECTION_EVENT = "collection:new";

export class MockFirestore implements firebase.firestore.Firestore {
  // ?
  INTERNAL: { delete: () => Promise<void> };

  private state: "running" | "terminated" | "not-started" = "not-started";
  private id = 0;
  public readonly documentData = new Map<string, firebase.firestore.DocumentData>();
  public readonly documentEvents = new Map<string, EventEmitter>();
  public readonly collectionDocuments = new Map<string, Set<string>>();
  public readonly collectionEvents = new Map<string, EventEmitter>();
  private readonly emitter = new EventEmitter();

  constructor(public readonly app: MockApp) {}

  private setStateRunning() {
    if (this.state === "terminated") {
      throw new Error("Firestore is terminated already");
    }
    this.state = "running";
  }

  nextId() {
    return "__id" + this.id++;
  }

  writeDocument(doc: MockDocumentReference, data: firebase.firestore.DocumentData) {
    this.documentData.set(doc.path, data);
    let collectionDocs = this.collectionDocuments.get(doc.parent.path);
    if (!collectionDocs) {
      collectionDocs = new Set();
      this.collectionDocuments.set(doc.parent.path, collectionDocs);
      this.emitter.emit(NEW_COLLECTION_EVENT, [doc.parent.path]);
    }
    collectionDocs.add(doc.path);
  }

  onNewCollection(listener: (path: string) => void) {
    this.emitter.on(NEW_COLLECTION_EVENT, listener);
  }

  batch(): firebase.firestore.WriteBatch {
    throw new Error("Method not implemented.");
  }

  clearPersistence(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  enablePersistence(settings?: firebase.firestore.PersistenceSettings): Promise<void> {
    return this.state === "not-started"
      ? Promise.resolve()
      : Promise.reject(new Error("precondition-failed"));
  }

  enableNetwork(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  disableNetwork(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  collection(collectionPath: string): MockCollectionReference<firebase.firestore.DocumentData> {
    this.setStateRunning();

    const parts = collectionPath.replace(/^\//, "").split("/");
    if (parts.length % 2 === 0) {
      throw new Error("Not a collection path: " + collectionPath);
    }

    return new MockCollectionReference(
      this,
      parts.pop()!,
      parts.length ? this.doc(parts.join("/")) : null,
      DEFAULT_DATA_CONVERTER
    );
  }

  collectionGroup(collectionId: string): MockCollectionGroup<firebase.firestore.DocumentData> {
    return new MockCollectionGroup(this, collectionId, DEFAULT_DATA_CONVERTER);
  }

  doc(documentPath: string): MockDocumentReference<firebase.firestore.DocumentData> {
    this.setStateRunning();

    const parts = documentPath.replace(/^\//, "").split("/");
    if (parts.length % 2 !== 0) {
      throw new Error("Not a document path: " + documentPath);
    }
    return new MockDocumentReference(
      this,
      parts.pop()!,
      this.collection(parts.join("/")),
      DEFAULT_DATA_CONVERTER
    );
  }

  runTransaction<T>(
    updateFunction: (transaction: firebase.firestore.Transaction) => Promise<T>
  ): Promise<T> {
    throw new Error("Method not implemented.");
  }

  onSnapshotsInSync(observer: {
    next?: (value: void) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }): () => void;
  onSnapshotsInSync(onSync: () => void): () => void;
  onSnapshotsInSync(onSync: any): () => void {
    throw new Error("Method not implemented.");
  }

  settings(settings: firebase.firestore.Settings): void {}

  terminate(): Promise<void> {
    this.state = "terminated";
    return Promise.resolve();
  }

  waitForPendingWrites(): Promise<void> {
    return Promise.resolve();
  }
}
