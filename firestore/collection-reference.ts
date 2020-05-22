import * as firebase from "firebase";
import { MockFirestore } from "./firestore";
import { DEFAULT_DATA_CONVERTER } from "./data-converter";
import { MockQuery } from "./query";

export class MockCollectionReference<T = firebase.firestore.DocumentData> extends MockQuery<T>
  implements firebase.firestore.CollectionReference<T> {
  get path(): string {
    const parent = this.parent ? this.parent.path : "";
    return parent + "/" + this.id;
  }

  constructor(
    firestore: MockFirestore,
    public readonly id: string,
    public readonly parent: firebase.firestore.DocumentReference | null,
    public readonly converter: firebase.firestore.FirestoreDataConverter<T>
  ) {
    super(firestore);
  }

  doc(documentPath?: string | undefined): firebase.firestore.DocumentReference<T> {
    throw new Error("Method not implemented.");
  }
  add(data: T): Promise<firebase.firestore.DocumentReference<T>> {
    throw new Error("Method not implemented.");
  }
  isEqual(other: firebase.firestore.CollectionReference<T>): boolean {
    throw new Error("Method not implemented.");
  }

  withConverter<U>(
    converter: firebase.firestore.FirestoreDataConverter<U>
  ): firebase.firestore.CollectionReference<U> {
    return new MockCollectionReference(
      this.firestore,
      this.id,
      this.parent && this.parent.withConverter(DEFAULT_DATA_CONVERTER),
      converter
    );
  }
}
