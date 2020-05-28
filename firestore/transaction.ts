import * as firebase from "firebase";
import { MockFirestore } from "./firestore";
import { MockDocumentReference } from "./document-reference";
import { MockDocumentSnapshot } from "./document-snapshot";

export class MockTransaction implements firebase.firestore.Transaction {
  private readonly operations: Promise<void>[] = [];
  private readonly affectedDocs = new Set<string>();
  private readonly surrogateFirestore: MockFirestore;

  constructor(private readonly firestore: MockFirestore) {
    this.surrogateFirestore = firestore.clone();
  }

  get<T>(documentRef: MockDocumentReference<T>): Promise<MockDocumentSnapshot<T>> {
    return this.surrogateFirestore.doc(documentRef.path).withConverter(documentRef.converter).get();
  }

  set<T>(
    documentRef: firebase.firestore.DocumentReference<T>,
    data: T,
    options?: firebase.firestore.SetOptions | undefined
  ): firebase.firestore.Transaction {
    const doc = this.surrogateFirestore.doc(documentRef.path);
    this.operations.push(doc.set(data, options));
    this.affectedDocs.add(doc.path);
    return this;
  }

  update(
    documentRef: firebase.firestore.DocumentReference<any>,
    data: firebase.firestore.UpdateData
  ): firebase.firestore.Transaction;
  update(
    documentRef: firebase.firestore.DocumentReference<any>,
    field: string | firebase.firestore.FieldPath,
    value: any,
    ...moreFieldsAndValues: any[]
  ): firebase.firestore.Transaction;
  update(documentRef: any, data: any, value?: any, ...rest: any[]) {
    const doc = this.surrogateFirestore.doc(documentRef.path);
    this.operations.push(doc.update(data, value, ...rest));
    this.affectedDocs.add(doc.path);
    return this;
  }

  delete(documentRef: firebase.firestore.DocumentReference<any>): firebase.firestore.Transaction {
    const doc = this.surrogateFirestore.doc(documentRef.path);
    this.operations.push(doc.delete());
    this.affectedDocs.add(doc.path);
    return this;
  }

  async commit() {
    await Promise.all(this.operations);
    const changedDocs = new Set<string>();

    for (const path of this.affectedDocs) {
      const beforeWrite = await this.firestore.doc(path).get();

      this.firestore.writeDocument(
        this.surrogateFirestore.doc(path),
        this.surrogateFirestore.documentData.get(path)
      );

      const afterWrite = await this.firestore.doc(path).get();
      // If state before and after changed, then it's a path which should have events emitted
      // after all operations are completed
      if (!beforeWrite.isEqual(afterWrite)) {
        changedDocs.add(path);
      }
    }

    for (const path of changedDocs) {
      this.firestore.doc(path).emitChange();
    }
  }
}
