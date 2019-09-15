import * as firebase from "firebase";
import { UserStore } from "./user-store";

export interface UserSchema {
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: firebase.auth.UserMetadata;
  password?: string;
  phoneNumber: string | null;
  providerData: (firebase.UserInfo | null)[];
  refreshToken: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId: string;
  uid: string;
  tenantId: string | null;
}

export class User implements firebase.User, UserSchema {
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: firebase.auth.UserMetadata;
  password?: string;
  phoneNumber: string | null;
  photoURL: string | null;
  providerData: (firebase.UserInfo | null)[];
  providerId: string;
  refreshToken: string;
  tenantId: string | null;
  uid: string;

  constructor(data: Partial<UserSchema>, private readonly store: UserStore) {
    Object.assign(this, data, {
      displayName: data.displayName || null,
      email: data.email || null,
      emailVerified: data.emailVerified || false,
      metadata: {
        creationTime: (data.metadata && data.metadata.creationTime) || new Date().toISOString(),
        lastSignInTime: data.metadata && data.metadata.lastSignInTime
      },
      phoneNumber: data.phoneNumber || null,
      photoURL: data.photoURL || null,
      providerData: data.providerData || [],
      refreshToken: "",
      tenantId: data.tenantId || null
    });
  }

  delete(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getIdToken(forceRefresh?: boolean): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getIdTokenResult(forceRefresh?: boolean): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getToken(forceRefresh?: boolean): Promise<any> {
    throw new Error("Method not implemented.");
  }

  linkAndRetrieveDataWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  linkWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  linkWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: firebase.auth.ApplicationVerifier
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  linkWithPopup(provider: firebase.auth.AuthProvider): Promise<any> {
    throw new Error("Method not implemented.");
  }

  linkWithRedirect(provider: firebase.auth.AuthProvider): Promise<any> {
    throw new Error("Method not implemented.");
  }

  reauthenticateAndRetrieveDataWithCredential(
    credential: firebase.auth.AuthCredential
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  reauthenticateWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  reauthenticateWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: firebase.auth.ApplicationVerifier
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  reauthenticateWithPopup(provider: firebase.auth.AuthProvider): Promise<any> {
    throw new Error("Method not implemented.");
  }

  reauthenticateWithRedirect(provider: firebase.auth.AuthProvider): Promise<any> {
    throw new Error("Method not implemented.");
  }

  reload(): Promise<any> {
    return Promise.resolve();
  }

  sendEmailVerification(
    actionCodeSettings?: firebase.auth.ActionCodeSettings | null
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  toJSON(): Object {
    const self: UserSchema = this;
    return { ...self };
  }

  unlink(providerId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  updateEmail(newEmail: string): Promise<void> {
    if (this.email === newEmail) {
      return Promise.resolve();
    }

    const anotherUser = this.store.findByEmail(newEmail);
    if (anotherUser) {
      return Promise.reject(new Error("auth/email-already-in-use"));
    }

    this.email = newEmail;
    this.store.update(this.uid, { email: newEmail });

    return Promise.resolve();
  }

  updatePassword(newPassword: string): Promise<void> {
    this.password = newPassword;
    this.store.update(this.uid, { password: newPassword });

    return Promise.resolve();
  }

  updatePhoneNumber(phoneCredential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  updateProfile({
    displayName,
    photoURL
  }: {
    displayName?: string | null;
    photoURL?: string | null;
  }): Promise<void> {
    this.displayName = displayName || null;
    this.photoURL = photoURL || null;
    this.store.update(this.uid, { displayName, photoURL });

    return Promise.resolve();
  }
}
