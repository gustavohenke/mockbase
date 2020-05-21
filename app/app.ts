import * as firebase from "firebase";
import { MockAuth } from "../auth";
import { MockFirestore } from "../firestore";

export class MockApp implements firebase.app.App {
  private authInstance: MockAuth;
  private firestoreInstance: MockFirestore;

  constructor(public readonly name: string, public readonly options: {} = {}) {}

  analytics(): firebase.analytics.Analytics {
    throw new Error("Not implemented");
  }

  auth() {
    this.authInstance = this.authInstance || new MockAuth(this);
    return this.authInstance;
  }

  database(): firebase.database.Database {
    throw new Error("Not implemented");
  }

  delete(): Promise<any> {
    throw new Error("Not implemented");
  }

  firestore() {
    this.firestoreInstance = this.firestoreInstance || new MockFirestore(this);
    return this.firestoreInstance;
  }

  functions(): firebase.functions.Functions {
    throw new Error("Not implemented");
  }

  installations(): firebase.installations.Installations {
    throw new Error("Not implemented");
  }

  messaging(): firebase.messaging.Messaging {
    throw new Error("Not implemented");
  }

  performance(): firebase.performance.Performance {
    throw new Error("Not implemented");
  }

  remoteConfig(): firebase.remoteConfig.RemoteConfig {
    throw new Error("Not implemented");
  }

  storage(): firebase.storage.Storage {
    throw new Error("Not implemented");
  }
}
