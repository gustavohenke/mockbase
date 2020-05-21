import * as firebase from "firebase";
import { DocumentReference } from "./document-reference";
import { DocumentSnapshot } from "./document-snapshot";

export class QueryDocumentSnapshot<T = firebase.firestore.DocumentData> extends DocumentSnapshot<T>
  implements firebase.firestore.QueryDocumentSnapshot<T> {
  constructor(
    ref: DocumentReference,
    data: firebase.firestore.DocumentData,
    converter: firebase.firestore.FirestoreDataConverter<T>
  ) {
    super(ref, data, converter);
  }

  data(options?: firebase.firestore.SnapshotOptions): T {
    return super.data(options)!;
  }
}
