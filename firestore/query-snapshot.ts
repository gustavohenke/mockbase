import * as firebase from "firebase";
import { MockQuery } from "./query";
import { MockQueryDocumentSnapshot } from "./document-snapshot";

export class MockQuerySnapshot<T = firebase.firestore.DocumentData>
  implements firebase.firestore.QuerySnapshot<T> {
  readonly metadata: firebase.firestore.SnapshotMetadata = {
    fromCache: true,
    hasPendingWrites: false,
    isEqual: () => true,
  };

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
    if (this === this.query.lastSnapshot || !this.query.lastSnapshot) {
      // Short circuit: this is the first snapshot, so all items were added.
      return this.docs.map((doc, newIndex) => ({
        type: "added",
        oldIndex: -1,
        newIndex,
        doc,
      }));
    }

    const lastDocs = this.query.lastSnapshot.docs;
    const changes: firebase.firestore.DocumentChange<T>[] = [];
    for (let thisDocIndex = 0; thisDocIndex < this.size; thisDocIndex++) {
      const doc = this.docs[thisDocIndex];
      const otherDocIndex = lastDocs.findIndex((oldDoc) => oldDoc.ref.path === doc.ref.path);
      if (otherDocIndex === -1) {
        // Not in the new snapshot. Removed.
        changes.push({
          type: "removed",
          oldIndex: thisDocIndex,
          newIndex: -1,
          doc,
        });
        continue;
      } else if (otherDocIndex !== thisDocIndex || !lastDocs[otherDocIndex].isEqual(doc)) {
        // Different index or not the same content anymore? It's a change.
        changes.push({
          type: "modified",
          oldIndex: thisDocIndex,
          newIndex: otherDocIndex,
          doc,
        });
      }
    }

    return changes;
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
