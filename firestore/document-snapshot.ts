import * as firebase from "firebase";
import { DocumentReference } from "./document-reference";
import { MockFirestore } from "./firestore";
import { QueryDocumentSnapshot } from "./query-document-snapshot";
import { DataConverter } from "./data-converter";

export class DocumentSnapshot<T = firebase.firestore.DocumentData>
  implements firebase.firestore.DocumentSnapshot<T> {
  metadata: firebase.firestore.SnapshotMetadata;

  get firestore(): MockFirestore {
    return this.ref.firestore;
  }

  get id() {
    return this.ref.id;
  }

  get exists() {
    return this._data !== undefined;
  }

  constructor(
    public readonly ref: DocumentReference,
    private readonly _data: firebase.firestore.DocumentData | undefined,
    private readonly converter: firebase.firestore.FirestoreDataConverter<T>
  ) {}

  data(options?: firebase.firestore.SnapshotOptions): T | undefined {
    if (this._data === undefined) {
      return undefined;
    }

    const snapshot = new QueryDocumentSnapshot(this.ref, this._data, new DataConverter());
    return this.converter.fromFirestore(snapshot, options || {});
  }

  get(fieldPath: string) {
    return fieldPath
      .split(".")
      .reduce((obj, path) => (obj !== undefined ? obj[path] : obj), this._data);
  }

  isEqual(other: firebase.firestore.DocumentSnapshot<any>): boolean {
    const otherData = other.data();
    const thisData = this.data();
    if (!otherData || !thisData) {
      return otherData === thisData;
    }

    return Object.keys(otherData).every((key) => {
      return otherData[key] === thisData[key];
    });
  }
}
