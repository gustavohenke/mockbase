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
    public readonly docs: MockQueryDocumentSnapshot<T>[],
    private readonly previousSnapshot?: MockQuerySnapshot<T> | undefined
  ) {}

  docChanges(
    options?: firebase.firestore.SnapshotListenOptions | undefined
  ): firebase.firestore.DocumentChange<T>[] {
    if (!this.previousSnapshot) {
      // Short circuit: this is the first snapshot, so all items were added.
      return this.docs.map((doc, newIndex) => ({
        type: "added",
        oldIndex: -1,
        newIndex,
        doc,
      }));
    }

    const checkedPaths = new Set<string>();
    const previousDocs = this.previousSnapshot.docs;
    const changes: firebase.firestore.DocumentChange<T>[] = [];

    for (const [newIndex, doc] of this.docs.entries()) {
      const oldIndex = previousDocs.findIndex(({ ref }) => ref.path === doc.ref.path);
      const previousDoc = oldIndex > -1 ? previousDocs[oldIndex] : null;
      if (!previousDoc) {
        changes.push({
          type: "added",
          oldIndex: -1,
          newIndex,
          doc,
        });
      } else if (!previousDoc.isEqual(doc) || newIndex !== oldIndex) {
        changes.push({
          type: "modified",
          oldIndex,
          newIndex,
          doc,
        });
      }

      if (previousDoc) checkedPaths.add(previousDoc.ref.path);
    }

    for (const [oldIndex, doc] of previousDocs.entries()) {
      if (!checkedPaths.has(doc.ref.path)) {
        changes.push({
          type: "removed",
          oldIndex,
          newIndex: -1,
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
