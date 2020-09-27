import * as firebase from "firebase";
import { UserCredential } from "./user-credential";
import { UserStore } from "./user-store";

export interface UserSchema {
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: firebase.auth.UserMetadata;
  password?: string;
  phoneNumber: string | null;
  providerData: UserInfo[];
  refreshToken: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId: string;
  uid: string;
  tenantId: string | null;
}

export class UserInfo implements firebase.UserInfo {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly phoneNumber: string | null;
  readonly photoURL: string | null;

  constructor(
    readonly uid: string,
    readonly providerId: string,
    rest: Partial<Omit<firebase.UserInfo, "uid" | "providerId">>
  ) {
    this.displayName = rest.displayName ?? null;
    this.email = rest.email ?? null;
    this.phoneNumber = rest.phoneNumber ?? null;
    this.photoURL = rest.photoURL ?? null;
  }
}

export class User implements firebase.User, UserSchema {
  readonly uid: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: firebase.auth.UserMetadata;
  password?: string;
  phoneNumber: string | null;
  photoURL: string | null;
  providerData: UserInfo[];
  providerId: string;
  refreshToken: string;
  tenantId: string | null;
  multiFactor: firebase.User.MultiFactorUser;

  constructor(data: Partial<UserSchema>, private readonly store: UserStore) {
    Object.assign(this, data, {
      displayName: data.displayName || null,
      email: data.email || null,
      emailVerified: data.emailVerified || false,
      metadata: {
        creationTime: (data.metadata && data.metadata.creationTime) || new Date().toISOString(),
        lastSignInTime: data.metadata && data.metadata.lastSignInTime,
      },
      phoneNumber: data.phoneNumber || null,
      photoURL: data.photoURL || null,
      providerData: data.providerData || [],
      refreshToken: "",
      tenantId: data.tenantId || null,
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

  private async linkWithSocial(provider: firebase.auth.AuthProvider) {
    if (this.providerData.some((info) => info.providerId === provider.providerId)) {
      throw new Error("auth/provider-already-linked");
    }

    const data = await this.store.consumeSocialMock(provider);
    this.providerData = [...this.providerData, new UserInfo(this.uid, provider.providerId, data)];
    this.store.update(this.uid, {
      providerData: this.providerData,
    });
    this.providerId = provider.providerId;
    return new UserCredential(this, "link", { isNewUser: false });
  }

  linkWithPopup(provider: firebase.auth.AuthProvider): Promise<UserCredential> {
    return this.linkWithSocial(provider);
  }

  async linkWithRedirect(provider: firebase.auth.AuthProvider): Promise<void> {
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

  async unlink(providerId: string): Promise<User> {
    const index = this.providerData.findIndex((info) => info.providerId === providerId);
    if (index === -1) {
      throw new Error("auth/no-such-provider");
    }

    this.providerData.splice(index, 1);
    this.store.update(this.uid, {
      providerData: this.providerData,
    });
    return this;
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
    photoURL,
  }: {
    displayName?: string | null;
    photoURL?: string | null;
  }): Promise<void> {
    this.displayName = displayName || null;
    this.photoURL = photoURL || null;
    this.store.update(this.uid, { displayName, photoURL });

    return Promise.resolve();
  }

  verifyBeforeUpdateEmail(
    newEmail: string,
    actionCodeSettings?: firebase.auth.ActionCodeSettings | null | undefined
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
