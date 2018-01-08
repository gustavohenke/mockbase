export type Errors =
  | "auth/auth-domain-config-required"
  | "auth/cancelled-popup-request"
  | "auth/operation-not-supported-in-this-environment"
  | "auth/popup-blocked"
  | "auth/popup-closed-by-user"
  | "auth/unauthorized-domain";

export class SocialSignInMock {
  public response: Promise<{ displayName: string; email: string }>;

  constructor(public readonly type: string) {}

  respondWithError(error: Errors) {
    this.response = Promise.reject(new Error(error));
  }

  respondWithUser(displayName: string, email: string) {
    this.response = Promise.resolve({ displayName, email });
  }
}
