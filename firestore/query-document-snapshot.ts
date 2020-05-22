import * as firebase from "firebase";
import { MockDocumentReference } from "./document-reference";
import { MockDocumentSnapshot } from "./document-snapshot";

export class MockQueryDocumentSnapshot<T = firebase.firestore.DocumentData>
  extends MockDocumentSnapshot<T>
  implements firebase.firestore.QueryDocumentSnapshot<T> {
  get id() {
    return this.ref.id;
  }

  constructor(
    ref: MockDocumentReference<T>,
    public readonly _data: firebase.firestore.DocumentData
  ) {
    super(ref, _data);
  }

  data(options?: firebase.firestore.SnapshotOptions | undefined): T {
    return this.ref.converter.fromFirestore(this, options || {});
  }
}
