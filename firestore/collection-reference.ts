import * as firebase from "firebase";
import { MockFirestore } from "./firestore";
import { DEFAULT_DATA_CONVERTER } from "./data-converter";
import { MockQuery } from "./query";

export class MockCollectionReference<T = firebase.firestore.DocumentData> extends MockQuery<T>
  implements firebase.firestore.CollectionReference<T> {
  constructor(
    firestore: MockFirestore,
    public readonly id: string,
    public readonly parent: firebase.firestore.DocumentReference | null,
    public readonly converter: firebase.firestore.FirestoreDataConverter<T>
  ) {
    super(firestore, (parent ? parent.path : "") + "/" + id, converter);
  }

  doc(documentPath?: string | undefined): firebase.firestore.DocumentReference<T> {
    documentPath = documentPath || this.firestore.nextId();
    return this.firestore.doc(this.path + "/" + documentPath).withConverter(this.converter);
  }

  add(data: T): Promise<firebase.firestore.DocumentReference<T>> {
    const doc = this.doc();
    return doc.set(data).then(() => doc);
  }

  isEqual(other: firebase.firestore.CollectionReference<T>): boolean {
    throw new Error("Method not implemented.");
  }

  withConverter<U>(
    converter: firebase.firestore.FirestoreDataConverter<U>
  ): MockCollectionReference<U> {
    return new MockCollectionReference(
      this.firestore,
      this.id,
      this.parent && this.parent.withConverter(DEFAULT_DATA_CONVERTER),
      converter
    );
  }
}
