import * as firebase from "firebase";

export class DataConverter
  implements firebase.firestore.FirestoreDataConverter<firebase.firestore.DocumentData> {
  toFirestore(modelObject: firebase.firestore.DocumentData): firebase.firestore.DocumentData {
    return modelObject;
  }
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>,
    options: firebase.firestore.SnapshotOptions
  ): firebase.firestore.DocumentData {
    return snapshot.data(options);
  }
}
