import { User } from "./user";

export interface UserCredentialOptions {
  isNewUser: boolean;
}

export class UserCredential implements firebase.auth.UserCredential {
  readonly additionalUserInfo: firebase.auth.AdditionalUserInfo | null = null;
  readonly credential = null;

  constructor(
    readonly user: User,
    readonly operationType: "signIn" | "link" | "reauthenticate",
    { isNewUser }: UserCredentialOptions
  ) {
    if (!user.isAnonymous) {
      this.additionalUserInfo = {
        isNewUser,
        profile: null,
        // providerId should be at the right value in the user object already.
        providerId: user.providerId,
        username: user.email,
      };
    }
  }
}
