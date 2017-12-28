import { User, UserSchema } from "./user";

export class UserStore {
  private nextId = 0;
  private emailStore = new Map<string, UserSchema>();

  add(data: Partial<UserSchema>): User {
    this.nextId++;
    const user = new User({
      ...data,
      uid: this.nextId + ""
    });

    data.email && this.emailStore.set(data.email, user.toJSON() as UserSchema);
    return user;
  }

  findByEmail(email: string): User | undefined {
    const schema = this.emailStore.get(email);
    return schema ? new User(schema) : undefined;
  }
}
