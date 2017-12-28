import * as firebase from "firebase";
import { MockApp } from "../app";
import { User } from "./user";
import { UserStore } from "./user-store";

export class MockAuth implements firebase.auth.Auth {
  public currentUser: firebase.User | null = null;
  public languageCode: string | null = null;
  public readonly store = new UserStore();

  constructor(public readonly app: MockApp) {}

  applyActionCode(code: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  checkActionCode(code: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  confirmPasswordReset(code: string, newPassword: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  createUserWithEmailAndPassword(email: string, password: string): Promise<User> {
    const user = this.store.add(new User({ email, password }));
    return Promise.resolve(user);
  }

  fetchProvidersForEmail(email: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getRedirectResult(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  onAuthStateChanged(
    nextOrObserver: firebase.Observer<any, any> | ((a: firebase.User | null) => void),
    error?: (a: firebase.auth.Error) => void,
    completed?: firebase.Unsubscribe
  ): firebase.Unsubscribe {
    throw new Error("Method not implemented.");
  }

  onIdTokenChanged(
    nextOrObserver: firebase.Observer<any, any> | ((a: firebase.User | null) => void),
    error?: (a: firebase.auth.Error) => void,
    completed?: firebase.Unsubscribe
  ): firebase.Unsubscribe {
    throw new Error("Method not implemented.");
  }

  sendPasswordResetEmail(
    email: string,
    actionCodeSettings?: firebase.auth.ActionCodeSettings | null
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  setPersistence(persistence: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInAndRetrieveDataWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInAnonymously(): Promise<User> {
    if (this.currentUser && this.currentUser.isAnonymous) {
      return Promise.resolve(this.currentUser);
    }

    const user = this.store.add({ isAnonymous: true });
    this.currentUser = user;
    return Promise.resolve(user);
  }

  signInWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithCustomToken(token: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithEmailAndPassword(email: string, password: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: firebase.auth.ApplicationVerifier
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithPopup(provider: firebase.auth.AuthProvider): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithRedirect(provider: firebase.auth.AuthProvider): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signOut(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  useDeviceLanguage() {
    throw new Error("Method not implemented.");
  }

  verifyPasswordResetCode(code: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
