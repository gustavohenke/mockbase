import { User, UserSchema, UserInfo } from "./user";

export class UserStore {
  private nextId = 0;
  private store = new Map<string, UserSchema>();

  add(data: Partial<UserSchema>): User {
    const uid = ++this.nextId + "";
    const user = new User(
      {
        ...data,
        providerData: data.providerId ? [new UserInfo(uid, data.providerId, data)] : [],
        uid,
      },
      this
    );

    const schema = user.toJSON() as UserSchema;
    this.store.set(schema.uid, schema);
    return user;
  }

  findByEmail(email: string): User | undefined {
    for (const user of this.store.values()) {
      if (user.email === email) {
        return new User(user, this);
      }
    }

    return undefined;
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
