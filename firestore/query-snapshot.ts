import * as firebase from "firebase";
import { MockQuery } from "./query";
import { MockQueryDocumentSnapshot } from "./document-snapshot";

export class MockQuerySnapshot<T = firebase.firestore.DocumentData>
  implements firebase.firestore.QuerySnapshot<T> {
  metadata: firebase.firestore.SnapshotMetadata;

  get size() {
    return this.docs.length;
  }

  get empty() {
    return this.size === 0;
  }

  constructor(
    public readonly query: MockQuery<T>,
    public readonly docs: MockQueryDocumentSnapshot<T>[]
  ) {}

  docChanges(
    options?: firebase.firestore.SnapshotListenOptions | undefined
  ): firebase.firestore.DocumentChange<T>[] {
    throw new Error("Method not implemented.");
  }

  forEach(
    callback: (result: firebase.firestore.QueryDocumentSnapshot<T>) => void,
    thisArg?: any
  ): void {
    this.docs.forEach(callback, thisArg);
  }

  isEqual(other: firebase.firestore.QuerySnapshot<T>): boolean {
    return (
      other instanceof MockQuerySnapshot &&
      other.size === this.size &&
      other.docs.every((doc, index) => this.docs[index].isEqual(doc))
    );
  }
}
