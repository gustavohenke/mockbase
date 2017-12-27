import * as firebase from "firebase";
import { MockAuth } from "../auth";

export class MockApp implements firebase.app.App {
  private authInstance: MockAuth;

  constructor (
    public readonly name: string,
    public readonly options: {} = {},
  ) {}

  auth () {
    this.authInstance = this.authInstance || new MockAuth(this);
    return this.authInstance;
  }

  database (): firebase.database.Database {
    throw new Error("Not implemented");
  }

  delete (): Promise<any> {
    throw new Error("Not implemented");
  }

  firestore (): firebase.firestore.Firestore {
    throw new Error("Not implemented");
  }

  messaging (): firebase.messaging.Messaging {
    throw new Error("Not implemented");
  }

  storage (): firebase.storage.Storage {
    throw new Error("Not implemented");
  }
}