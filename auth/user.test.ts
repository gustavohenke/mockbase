import * as firebase from "firebase";
import createMockInstance from "jest-create-mock-instance";
import { User, UserInfo } from "./user";
import { UserStore } from "./user-store";

let store: jest.Mocked<UserStore>;
beforeEach(() => {
  store = createMockInstance(UserStore);
});

describe("#linkWithPopup()", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  const response = { displayName: "foo", email: "foo@baz.com" };
  beforeEach(() => {
    store.consumeSocialMock.mockResolvedValue(response);
  });

  it("doesn't link if provider is already linked", async () => {
    const info = new UserInfo("1", provider.providerId, {});
    const user = new User({ uid: "1", providerData: [info] }, store);
    return expect(user.linkWithPopup(provider)).rejects.toThrowError(
      "auth/provider-already-linked"
    );
  });

  it("links provider if not linked", async () => {
    const user = new User({ uid: "1", email: "foo@bar.com" }, store);
    const credential = await user.linkWithPopup(provider);
    expect(credential.operationType).toBe("link");
    expect(credential.user).toBe(user);
    expect(credential.additionalUserInfo).toEqual({
      providerId: provider.providerId,
      profile: null,
      isNewUser: false,
      username: user.email,
    });
  });

  it("updates providerData", async () => {
    const user = new User({ uid: "1" }, store);
    await user.linkWithPopup(provider);
    expect(user.providerData).toContainEqual(new UserInfo(user.uid, provider.providerId, response));
    expect(store.update).toHaveBeenCalledWith(user.uid, {
      providerData: user.providerData,
    });
  });
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
      photoURL: "http://foo.com",
    });
  });
});

describe("#unlink()", () => {
  const providerId = firebase.auth.GoogleAuthProvider.PROVIDER_ID;

  it("unlinks and updates providerData", async () => {
    const user = new User({ uid: "1", providerData: [new UserInfo("1", providerId, {})] }, store);
    await user.unlink(providerId);
    expect(user.providerData).toHaveLength(0);
    expect(store.update).toHaveBeenCalledWith(user.uid, {
      providerData: user.providerData,
    });
  });

  it("throws if provider isn't linked", () => {
    const user = new User({ uid: "1" }, store);
    return expect(user.unlink(providerId)).rejects.toThrowError("auth/no-such-provider");
  });
});
