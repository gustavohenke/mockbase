import * as firebase from "firebase";

export class MockFirestore implements firebase.firestore.Firestore {
  public readonly documentData = new Map<string, firebase.firestore.DocumentData>();

  constructor(public readonly app: firebase.app.App) {}

  settings(settings: firebase.firestore.Settings): void {
    throw new Error("Method not implemented.");
  }
  enablePersistence(settings?: firebase.firestore.PersistenceSettings | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }
  collection(
    collectionPath: string
  ): firebase.firestore.CollectionReference<firebase.firestore.DocumentData> {
    throw new Error("Method not implemented.");
  }
  doc(documentPath: string): firebase.firestore.DocumentReference<firebase.firestore.DocumentData> {
    throw new Error("Method not implemented.");
  }
  collectionGroup(collectionId: string): firebase.firestore.Query<firebase.firestore.DocumentData> {
    throw new Error("Method not implemented.");
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
