import { UserStore } from "./user-store";

describe("#add()", () => {
  it("adds a user and returns it", () => {
    const user = new UserStore().add({ email: "foo@bar.com" });
    expect(user.email).toBe("foo@bar.com");
  });
});

describe("#findByEmail()", () => {
  it("returns undefined when the user doesn't exist", () => {
    const user = new UserStore().findByEmail("foo@bar.com");
    expect(user).toBeUndefined();
  });

  it("returns the user with a given email", () => {
    const store = new UserStore();
    store.add({ email: "foo@bar.com" });

    const user = store.findByEmail("foo@bar.com");
    expect(user!.email).toBe("foo@bar.com");
  });
});

describe("#update()", () => {
  it("changes data of schema", () => {
    const store = new UserStore();
    const { uid } = store.add({ email: "foo@bar.com" });

    store.update(uid, { displayName: "foo bar", photoURL: "foo.bar/baz.jpg" });

    const user = store.findByEmail("foo@bar.com");
    expect(user).toHaveProperty("displayName", "foo bar");
    expect(user).toHaveProperty("photoURL", "foo.bar/baz.jpg");
  });
});
