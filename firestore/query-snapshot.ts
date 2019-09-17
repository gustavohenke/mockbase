import * as firebase from "firebase";
import { DocumentSnapshot } from "./document-snapshot";

export class QuerySnapshot implements firebase.firestore.QuerySnapshot {
  query: firebase.firestore.Query;
  metadata: firebase.firestore.SnapshotMetadata;

  get size() {
    return this.docs.length;
  }

  get empty() {
    return this.size === 0;
  }

  constructor(public readonly docs: DocumentSnapshot[]) {}

  docChanges(
    options?: firebase.firestore.SnapshotListenOptions
  ): firebase.firestore.DocumentChange[] {
    return [];
  }

  forEach(
    callback: (result: firebase.firestore.QueryDocumentSnapshot) => void,
    thisArg?: any
  ): void {
    this.docs.forEach(callback, thisArg);
  }

  isEqual(other: firebase.firestore.QuerySnapshot): boolean {
    // TODO: Actually make a comparison here
    return other === this;
  }
}
