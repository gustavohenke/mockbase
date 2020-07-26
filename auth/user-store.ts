import { User, UserSchema, UserInfo } from "./user";
import { SocialSignInMock } from "./social-signin-mock";

export class UserStore {
  private nextId = 0;
  private store = new Map<string, UserSchema>();
  private readonly socialMocks: SocialSignInMock[] = [];

  /**
   * Adds a user to this store with the given data.
   * The new user is assigned a new ID and is returned.
   */
  add(data: Partial<UserSchema>): User {
    const uid = ++this.nextId + "";
    const user = new User(
      {
        ...data,
        // If the user is being created with a provider ID, then its data is coming from that provider.
        providerData: data.providerId ? [new UserInfo(uid, data.providerId, data)] : [],
        uid,
      },
      this
    );

    const schema = user.toJSON() as UserSchema;
    this.store.set(schema.uid, schema);
    return user;
  }

  addSocialMock(mock: SocialSignInMock) {
    this.socialMocks.push(mock);
  }

  /**
   * Finds the mock response for a given AuthProvider, removes it from the list of mocks
   * and returns its response.
   *
   * If a mock for that AuthProvider is not set, then this method throws.
   */
  consumeSocialMock(provider: firebase.auth.AuthProvider) {
    const index = this.socialMocks.findIndex((mock) => mock.type === provider.providerId);
    if (index === -1) {
      throw new Error("No mock response set.");
    }

    // Mock is used, then it must go
    const mock = this.socialMocks[index];
    this.socialMocks.splice(index, 1);

    return mock.response;
  }

  findByEmail(email: string): User | undefined {
    const schema = [...this.store.values()].find((user) => user.email === email);
    return schema && new User(schema, this);
  }

  findByProviderAndEmail(email: string, providerId: string): User | undefined {
    const user = this.findByEmail(email);
    if (!user) {
      return undefined;
    }

    if (user.providerData.some((info) => info.providerId === providerId)) {
      return new User({ ...user.toJSON(), providerId }, this);
    }

    throw new Error("auth/account-exists-with-different-credential");
  }

  update(id: string, data: Partial<UserSchema>) {
    const schema = this.store.get(id);
    if (!schema) {
      return;
    }

    Object.assign(schema, data);
  }
}
