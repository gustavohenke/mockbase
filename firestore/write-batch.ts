import * as firebase from "firebase";
import { MockDocumentReference } from "./document-reference";
import { MockFirestore } from "./firestore";

type OperationDocPair = {
  doc: MockDocumentReference<any>;
  execute(doc: MockDocumentReference): Promise<void>;
};

export class MockWriteBatch implements firebase.firestore.WriteBatch {
  private readonly operations: OperationDocPair[] = [];

  constructor(private readonly firestore: MockFirestore) {}

  set<T>(
    doc: MockDocumentReference<T>,
    data: T,
    options?: firebase.firestore.SetOptions | undefined
  ): firebase.firestore.WriteBatch {
    this.operations.push({ doc, execute: (doc) => doc.set(data, options) });
    return this;
  }

  update(
    documentRef: firebase.firestore.DocumentReference<any>,
    data: firebase.firestore.UpdateData
  ): firebase.firestore.WriteBatch;

  update(
    documentRef: firebase.firestore.DocumentReference<any>,
    field: string | firebase.firestore.FieldPath,
    value: any,
    ...moreFieldsAndValues: any[]
  ): firebase.firestore.WriteBatch;

  update(doc: MockDocumentReference<any>, data: any, value?: any, ...rest: any[]) {
    this.operations.push({ doc, execute: (doc) => doc.update(data, value, ...rest) });
    return this;
  }

  delete(doc: MockDocumentReference<any>): firebase.firestore.WriteBatch {
    this.operations.push({ doc, execute: (doc) => doc.delete() });
    return this;
  }

  async commit() {
    const affectedDocs = new Set<string>();
    while (this.operations.length) {
      const { doc, execute } = this.operations.shift()!;
      const beforeOperation = await doc.get();

      const surrogate = new MockDocumentReference(
        doc.firestore,
        doc.id,
        doc.parent,
        doc.converter,
        false
      );
      await execute(surrogate);

      const afterOperation = await doc.get();
      // If state before and after changed, then it's a path which should have events emitted
      // after all operations are completed
      if (!afterOperation.isEqual(beforeOperation)) {
        affectedDocs.add(doc.path);
      }
    }

    for (const path of affectedDocs) {
      this.firestore.doc(path).emitChange();
    }
  }
}
