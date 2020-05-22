import * as firebase from "firebase";
import { MockDocumentReference } from "./document-reference";
import { DEFAULT_DATA_CONVERTER } from "./data-converter";
import { MockCollectionReference } from "./collection-reference";

export class MockFirestore implements firebase.firestore.Firestore {
  private id = 0;
  public readonly documentData = new Map<string, firebase.firestore.DocumentData>();
  public readonly collectionDocuments = new Map<string, string>();

  constructor(public readonly app: firebase.app.App) {}

  nextId() {
    return "__id" + this.id++;
  }

  settings(settings: firebase.firestore.Settings): void {
    throw new Error("Method not implemented.");
  }
  enablePersistence(settings?: firebase.firestore.PersistenceSettings | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }
  collection(collectionPath: string): MockCollectionReference<firebase.firestore.DocumentData> {
    const parts = collectionPath.split("/");
    if (parts.length % 2 === 0) {
      throw new Error("Not a collection path");
    }

    return new MockCollectionReference(
      this,
      parts.pop()!,
      parts.length ? this.doc(parts.join("/")) : null,
      DEFAULT_DATA_CONVERTER
    );
  }
  collectionGroup(collectionId: string): firebase.firestore.Query<firebase.firestore.DocumentData> {
    throw new Error("Method not implemented.");
  }
  doc(documentPath: string): MockDocumentReference<firebase.firestore.DocumentData> {
    const parts = documentPath.split("/");
    if (parts.length % 2 !== 0) {
      throw new Error("Not a document path");
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
  batch(): firebase.firestore.WriteBatch {
    throw new Error("Method not implemented.");
  }
  clearPersistence(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  enableNetwork(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  disableNetwork(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  waitForPendingWrites(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  onSnapshotsInSync(observer: {
    next?: ((value: void) => void) | undefined;
    error?: ((error: Error) => void) | undefined;
    complete?: (() => void) | undefined;
  }): () => void;
  onSnapshotsInSync(onSync: () => void): () => void;
  onSnapshotsInSync(onSync: any): () => void {
    throw new Error("Method not implemented.");
  }
  terminate(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  INTERNAL: { delete: () => Promise<void> };
}
