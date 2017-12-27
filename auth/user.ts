import * as firebase from "firebase";

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
  uid: string;

  constructor(data: Partial<UserSchema>) {
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
      refreshToken: ""
    });
  }

  delete(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getIdToken(forceRefresh?: boolean | undefined): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getToken(forceRefresh?: boolean | undefined): Promise<any> {
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
    actionCodeSettings?: firebase.auth.ActionCodeSettings | null | undefined
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  toJSON(): UserSchema {
    const self: UserSchema = this;
    return { ...self };
  }

  unlink(providerId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  updateEmail(newEmail: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  updatePassword(newPassword: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  updatePhoneNumber(phoneCredential: firebase.auth.AuthCredential): Promise<any> {
    throw new Error("Method not implemented.");
  }

  updateProfile(profile: { displayName: string | null; photoURL: string | null }): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
