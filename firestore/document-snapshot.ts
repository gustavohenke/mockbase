import * as firebase from "firebase";
import { MockDocumentReference } from "./document-reference";

export class MockDocumentSnapshot<T = firebase.firestore.DocumentData>
  implements firebase.firestore.DocumentSnapshot<T> {
  metadata: firebase.firestore.SnapshotMetadata;

  get id() {
    return this.ref.id;
  }

  get exists() {
    return this._data !== undefined;
  }

  constructor(
    public readonly ref: MockDocumentReference<T>,
    public readonly _data: firebase.firestore.DocumentData | undefined
  ) {}

  data(options?: firebase.firestore.SnapshotOptions | undefined): T | undefined {
    if (this._data === undefined) {
      return undefined;
    }
    const querySnapshot = new MockQueryDocumentSnapshot(this.ref, this._data);
    return querySnapshot.data(options);
  }
  get(
    fieldPath: string | firebase.firestore.FieldPath,
    options?: firebase.firestore.SnapshotOptions | undefined
  ) {
    throw new Error("Method not implemented.");
  }
  isEqual(other: firebase.firestore.DocumentSnapshot<T>): boolean {
    throw new Error("Method not implemented.");
  }
}

export class MockQueryDocumentSnapshot<T = firebase.firestore.DocumentData>
  extends MockDocumentSnapshot<T>
  implements firebase.firestore.QueryDocumentSnapshot<T> {
  constructor(
    ref: MockDocumentReference<T>,
    public readonly _data: firebase.firestore.DocumentData
  ) {
    super(ref, _data);
  }

  data(options?: firebase.firestore.SnapshotOptions): T {
    return this.ref.converter.fromFirestore(this, options || {});
  }
}
