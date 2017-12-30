import * as firebase from "firebase";
import { MockApp } from "../app";
import { SocialSignInMock } from "./social-signin-mock";
import { User } from "./user";
import { UserStore } from "./user-store";

type AuthStateChangeListener = (user: firebase.User | null) => void;

export class MockAuth implements firebase.auth.Auth {
  public currentUser: User | null = null;
  public languageCode: string | null = null;
  public readonly store = new UserStore();
  private readonly socialSignIns = new Set<SocialSignInMock>();
  private readonly authStateEvents = new Set();

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
    if (this.store.findByEmail(email)) {
      throw new Error("auth/email-already-in-use");
    }

    const user = this.store.add({ email, password });
    return Promise.resolve(user);
  }

  fetchProvidersForEmail(email: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getRedirectResult(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  mockSocialSignIn(provider: firebase.auth.AuthProvider) {
    const mock = new SocialSignInMock(provider.providerId);
    this.socialSignIns.add(mock);
    return mock;
  }

  onAuthStateChanged(
    nextOrObserver: AuthStateChangeListener,
    error?: (a: firebase.auth.Error) => void,
    completed?: firebase.Unsubscribe
  ): firebase.Unsubscribe {
    this.authStateEvents.add(nextOrObserver);
    nextOrObserver(this.currentUser);

    return () => {
      this.authStateEvents.delete(nextOrObserver);
    };
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

  setPersistence(persistence: string): Promise<void> {
    return Promise.resolve();
  }

  private signIn(user: User): Promise<User> {
    this.currentUser = user;
    this.authStateEvents.forEach(listener => {
      listener(user);
    });

    return Promise.resolve(user);
  }

  signInAndRetrieveDataWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInAnonymously(): Promise<User> {
    if (this.currentUser && this.currentUser.isAnonymous) {
      return Promise.resolve(this.currentUser);
    }

    const user = this.store.add({ isAnonymous: true });
    return this.signIn(user);
  }

  signInWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithCustomToken(token: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithEmailAndPassword(email: string, password: string): Promise<User> {
    const user = this.store.findByEmail(email);
    if (!user) {
      return Promise.reject(new Error("auth/user-not-found"));
    } else if (user.password !== password) {
      return Promise.reject(new Error("auth/wrong-password"));
    }

    return this.signIn(user);
  }

  signInWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: firebase.auth.ApplicationVerifier
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async signInWithPopup(provider: firebase.auth.AuthProvider): Promise<User> {
    const mock = Array.from(this.socialSignIns.values()).find(
      mock => mock.type === provider.providerId
    );

    if (!mock) {
      throw new Error("No mock response set.");
    }

    // Mock is used, then it must go
    this.socialSignIns.delete(mock);

    const data = await mock.response;
    let user = this.store.findByEmail(data.email);
    if (user) {
      if (user.providerId !== provider.providerId) {
        throw new Error("auth/account-exists-with-different-credential");
      }

      return this.signIn(user);
    }

    user = this.store.add({ ...data, providerId: provider.providerId });
    return this.signIn(user);
  }

  signInWithRedirect(provider: firebase.auth.AuthProvider): Promise<User> {
    throw new Error("Method not implemented.");
  }

  signOut(): Promise<void> {
    this.currentUser = null;
    this.authStateEvents.forEach(listener => listener(this.currentUser));
    return Promise.resolve();
  }

  useDeviceLanguage() {}

  verifyPasswordResetCode(code: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
