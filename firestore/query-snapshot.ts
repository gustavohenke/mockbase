import * as firebase from "firebase";
import { QueryDocumentSnapshot } from "./query-document-snapshot";

export class QuerySnapshot<T = firebase.firestore.DocumentData>
  implements firebase.firestore.QuerySnapshot<T> {
  query: firebase.firestore.Query<T>;
  metadata: firebase.firestore.SnapshotMetadata;

  get size() {
    return this.docs.length;
  }

  get empty() {
    return this.size === 0;
  }

  constructor(public readonly docs: QueryDocumentSnapshot<T>[]) {}

  docChanges(
    options?: firebase.firestore.SnapshotListenOptions
  ): firebase.firestore.DocumentChange<T>[] {
    return [];
  }

  forEach(
    callback: (result: firebase.firestore.QueryDocumentSnapshot<T>) => void,
    thisArg?: any
  ): void {
    this.docs.forEach(callback, thisArg);
  }

  isEqual(other: firebase.firestore.QuerySnapshot<any>): boolean {
    // TODO: Actually make a comparison here
    return other === this;
  }
}
