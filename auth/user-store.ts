import { User, UserSchema } from "./user";

export class UserStore {
  private nextId = 0;
  private idStore = new Map<string, UserSchema>();
  private emailStore = new Map<string, UserSchema>();

  add(data: Partial<UserSchema>): User {
    const uid = ++this.nextId + "";
    const user = new User({ ...data, uid }, this);

    const schema = user.toJSON() as UserSchema;
    this.idStore.set(schema.uid, schema);
    schema.email && this.emailStore.set(schema.email, schema);
    return user;
  }

  findByEmail(email: string): User | undefined {
    const schema = this.emailStore.get(email);
    return schema ? new User(schema, this) : undefined;
  }

  update(id: string, data: Partial<UserSchema>) {
    const schema = this.idStore.get(id);
    if (!schema) {
      return;
    }

    Object.assign(schema, data);
  }
}
