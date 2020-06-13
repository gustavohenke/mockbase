import * as firebase from "firebase";
import { MockQuery } from "./query";
import { MockQueryDocumentSnapshot } from "./document-snapshot";

export class MockQuerySnapshot<T = firebase.firestore.DocumentData>
  implements firebase.firestore.QuerySnapshot<T> {
  private get previousSnapshot(): MockQuerySnapshot<T> | undefined {
    return this.query.snapshotVersions[this.version - 1];
  }

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
    private readonly version: number = query.snapshotVersions.length
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

    const iterationSize = Math.max(this.previousSnapshot.size, this.size);
    const checkedPaths = new Set<string>();
    const previousDocs = this.previousSnapshot.docs;
    const changes: firebase.firestore.DocumentChange<T>[] = [];
    for (let i = 0; i < iterationSize; i++) {
      const doc = this.docs[i] || previousDocs[i];
      if (checkedPaths.has(doc.ref.path)) {
        // This is a document which has a lower index in the current snapshot.
        // Skip it to avoid adding a modified change twice for it.
        continue;
      }

      const newIndex =
        doc === this.docs[i]
          ? i
          : this.docs.findIndex((another) => another.ref.path === doc.ref.path);
      const oldIndex =
        doc === previousDocs[i]
          ? i
          : previousDocs.findIndex((another) => another.ref.path === doc.ref.path);

      if (oldIndex === -1) {
        // Not in the old snapshot. Added.
        changes.push({
          type: "added",
          oldIndex,
          newIndex,
          doc,
        });
      } else if (newIndex === -1) {
        // Not in the new snapshot. Removed.
        changes.push({
          type: "removed",
          oldIndex,
          newIndex,
          doc,
        });
      } else if (oldIndex !== newIndex || !previousDocs[oldIndex].isEqual(this.docs[newIndex])) {
        // Different index or not the same content anymore? It's a change.
        changes.push({
          type: "modified",
          oldIndex,
          newIndex,
          doc: this.docs[newIndex],
        });
      }

      checkedPaths.add(doc.ref.path);
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
