import createMockInstance from "jest-create-mock-instance";
import { User } from "./user";
import { UserStore } from "./user-store";

let store: jest.Mocked<UserStore>;
beforeEach(() => {
  store = createMockInstance(UserStore);
});

describe("#updateEmail()", () => {
  it("doesn't update anything if email didn't change", async () => {
    const user = new User({ uid: "1", email: "foo@bar.com" }, store);
    await user.updateEmail("foo@bar.com");

    expect(store.update).not.toHaveBeenCalled();
  });

  it("throws auth/email-already-in-use if another account uses the new email", () => {
    const user = new User({ uid: "1", email: "foo@bar.com" }, store);
    store.findByEmail.mockReturnValue(new User({}, store));

    const promise = user.updateEmail("foo@baz.com");
    return expect(promise).rejects.toThrow("auth/email-already-in-use");
  });

  it("changes email", async () => {
    const user = new User({ uid: "1", email: "foo@bar.com" }, store);
    await user.updateEmail("foo@baz.com");

    expect(user).toHaveProperty("email", "foo@baz.com");
    expect(store.update).toHaveBeenCalledWith(user.uid, { email: "foo@baz.com" });
  });
});

describe("#updatePassword()", () => {
  it("changes password", async () => {
    const user = new User({ uid: "1" }, store);
    user.updatePassword("foo");

    expect(user).toHaveProperty("password", "foo");
    expect(store.update).toHaveBeenCalledWith(user.uid, { password: "foo" });
  });
});

describe("#updateProfile()", () => {
  it("changes displayName and photoURL", async () => {
    const user = new User({ uid: "1" }, store);
    await user.updateProfile({ displayName: "foo", photoURL: "http://foo.com" });

    expect(user).toHaveProperty("displayName", "foo");
    expect(user).toHaveProperty("photoURL", "http://foo.com");
    expect(store.update).toHaveBeenCalledWith(user.uid, {
      displayName: "foo",
      photoURL: "http://foo.com"
    });
  });
});
