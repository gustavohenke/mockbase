import * as firebase from "firebase";
import { DocumentSnapshot } from "./document-snapshot";

export class QuerySnapshot implements firebase.firestore.QuerySnapshot {
  query: firebase.firestore.Query;
  metadata: firebase.firestore.SnapshotMetadata;
  docChanges: firebase.firestore.DocumentChange[];

  get size() {
    return this.docs.length;
  }

  get empty() {
    return this.size === 0;
  }

  constructor(public readonly docs: DocumentSnapshot[]) {}

  forEach(callback: (result: firebase.firestore.DocumentSnapshot) => void, thisArg?: any): void {
    this.docs.forEach(callback, thisArg);
  }
}
