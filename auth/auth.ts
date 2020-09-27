import * as firebase from "firebase";
import { MockApp } from "../app";
import { SocialSignInMock } from "./social-signin-mock";
import { User } from "./user";
import { UserStore } from "./user-store";
import { AuthSettings } from "./auth-settings";
import { UserCredential, UserCredentialOptions } from "./user-credential";

export type AuthStateChangeListener = (user: firebase.User | null) => void;

export class MockAuth implements firebase.auth.Auth {
  public currentUser: User | null = null;
  public languageCode: string | null = null;
  public settings: firebase.auth.AuthSettings = new AuthSettings();
  public tenantId: string | null;
  public readonly store = new UserStore();
  private readonly authStateEvents = new Set<AuthStateChangeListener>();

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

  createUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    if (this.store.findByEmail(email)) {
      throw new Error("auth/email-already-in-use");
    }

    const { providerId } = new firebase.auth.EmailAuthProvider();
    const user = this.store.add({ email, password, providerId });
    return this.signIn(user, { isNewUser: true });
  }

  fetchSignInMethodsForEmail(email: string): Promise<string[]> {
    const user = this.store.findByEmail(email);
    const providers = user ? user.providerData : [];
    return Promise.resolve(providers.map((info) => info.providerId));
  }

  getRedirectResult(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  isSignInWithEmailLink(emailLink: string): boolean {
    throw new Error("Method not implemented.");
  }

  mockSocialSignIn(provider: firebase.auth.AuthProvider) {
    const mock = new SocialSignInMock(provider.providerId);
    this.store.addSocialMock(mock);
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

  sendSignInLinkToEmail(
    email: string,
    actionCodeSettings: firebase.auth.ActionCodeSettings
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setPersistence(persistence: string): Promise<void> {
    return Promise.resolve();
  }

  private signIn(
    user: User,
    options: UserCredentialOptions
  ): Promise<firebase.auth.UserCredential> {
    this.currentUser = user;
    this.authStateEvents.forEach((listener) => {
      listener(user);
    });

    return Promise.resolve(new UserCredential(user, "signIn", options));
  }

  private async signInWithSocial(provider: firebase.auth.AuthProvider) {
    const mockResponse = await this.store.consumeSocialMock(provider);
    let user = this.store.findByProviderAndEmail(mockResponse.email, provider.providerId);
    if (user) {
      return this.signIn(user, { isNewUser: false });
    }

    // user didn't exist, so it's created and then signed in
    user = this.store.add({ ...mockResponse, providerId: provider.providerId });
    return this.signIn(user, { isNewUser: true });
  }

  signInAndRetrieveDataWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInAnonymously(): Promise<firebase.auth.UserCredential> {
    if (this.currentUser && this.currentUser.isAnonymous) {
      return this.signIn(this.currentUser, { isNewUser: false });
    }

    const user = this.store.add({ isAnonymous: true });
    return this.signIn(user, { isNewUser: true });
  }

  signInWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithCustomToken(token: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    const user = this.store.findByEmail(email);
    if (!user) {
      return Promise.reject(new Error("auth/user-not-found"));
    } else if (user.password !== password) {
      return Promise.reject(new Error("auth/wrong-password"));
    }

    return this.signIn(user, { isNewUser: false });
  }

  signInWithEmailLink(
    email: string,
    emailLink?: string | undefined
  ): Promise<firebase.auth.UserCredential> {
    throw new Error("Method not implemented.");
  }

  signInWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: firebase.auth.ApplicationVerifier
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  signInWithPopup(provider: firebase.auth.AuthProvider): Promise<firebase.auth.UserCredential> {
    return this.signInWithSocial(provider);
  }

  signInWithRedirect(provider: firebase.auth.AuthProvider): Promise<void> {
    throw new Error("Method not implemented.");
  }

  signOut(): Promise<void> {
    this.currentUser = null;
    this.authStateEvents.forEach((listener) => listener(this.currentUser));
    return Promise.resolve();
  }

  updateCurrentUser(user: firebase.User | null): Promise<void> {
    throw new Error("Method not implemented.");
  }

  useDeviceLanguage() {}

  verifyPasswordResetCode(code: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
