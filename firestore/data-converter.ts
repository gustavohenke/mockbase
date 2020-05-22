import * as firebase from "firebase";
import { MockQueryDocumentSnapshot } from "./query-document-snapshot";

export const DEFAULT_DATA_CONVERTER: firebase.firestore.FirestoreDataConverter<firebase.firestore.DocumentData> = {
  fromFirestore(snapshot) {
    if (!(snapshot instanceof MockQueryDocumentSnapshot)) {
      throw new Error("Can't convert from non-mocked Firestore");
    }
    return snapshot._data;
  },
  toFirestore(modelObject) {
    return modelObject;
  },
};
