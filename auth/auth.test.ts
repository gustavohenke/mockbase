import * as firebase from "firebase";
import { MockApp } from "../app";
import { MockAuth } from "./";

let app: MockApp;
beforeEach(() => {
  app = new MockApp("foo");
});

it("exposes #app", () => {
  const auth = new MockAuth(app);
  expect(auth.app).toBe(app);
});

describe("#createUserWithEmailAndPassword()", () => {
  it("adds user with given email and password", () => {
    const auth = new MockAuth(app);
    jest.spyOn(auth.store, "add");

    auth.createUserWithEmailAndPassword("foo@bar.com", "password");
    expect(auth.store.add).toHaveBeenCalledWith({
      email: "foo@bar.com",
      password: "password"
    });
  });

  it("throws auth/email-already-in-use if another account uses that email", () => {
    const auth = new MockAuth(app);
    auth.store.add({ email: "foo@bar.com" });

    const create = () => auth.createUserWithEmailAndPassword("foo@bar.com", "baz");
    expect(create).toThrow("auth/email-already-in-use");
  });
});

describe("#onAuthStateChange()", () => {
  it("invokes listener right away with current status", async () => {
    const auth = new MockAuth(app);
    const listener = jest.fn();

    const user = await auth.signInAnonymously();
    auth.onAuthStateChanged(listener);

    expect(listener).toHaveBeenCalledWith(user);
  });

  it("adds a listener to auth state changes", async () => {
    const auth = new MockAuth(app);
    const listener = jest.fn();
    auth.onAuthStateChanged(listener);

    const user = await auth.signInAnonymously();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith(user);
  });

  it("doesn't invokes the listener after it's disposed", async () => {
    const auth = new MockAuth(app);
    const listener = jest.fn();
    const disposer = auth.onAuthStateChanged(listener);
    disposer();

    await auth.signInAnonymously();

    // Just the initial call and that's it
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("#signInAnonymously()", () => {
  it("signs in and returns user", async () => {
    const auth = new MockAuth(app);
    const user = await auth.signInAnonymously();

    expect(user.isAnonymous).toBe(true);
    expect(auth.currentUser).toBe(user);
  });

  it("keeps same user signed in if it's anonymous", async () => {
    const auth = new MockAuth(app);
    const user1 = await auth.signInAnonymously();
    const user2 = await auth.signInAnonymously();

    expect(user1).toBe(user2);
    expect(auth.currentUser).toBe(user1);
  });
});

describe("#signInWithEmailAndPassword", () => {
  it("errors with auth/user-not-found if user doesn't exist", () => {
    const auth = new MockAuth(app);
    const promise = auth.signInWithEmailAndPassword("foo@bar.com", "123");
    return expect(promise).rejects.toThrow("auth/user-not-found");
  });

  it("errors with auth/wrong-password if password doesn't match", () => {
    const auth = new MockAuth(app);
    auth.store.add({ email: "foo@bar.com", password: "baz" });

    const promise = auth.signInWithEmailAndPassword("foo@bar.com", "123");
    return expect(promise).rejects.toThrow("auth/wrong-password");
  });

  it("signs in with the given e-mail and password", async () => {
    const auth = new MockAuth(app);
    const user1 = auth.store.add({ email: "foo@bar.com", password: "baz" });

    const user2 = await auth.signInWithEmailAndPassword("foo@bar.com", "baz");
    expect(user2).toEqual(user1);
    expect(auth.currentUser).toEqual(user2);
  });
});

describe("#signInWithPopup()", () => {
  it("responds with user mock", async () => {
    const provider = new firebase.auth.FacebookAuthProvider();

    const auth = new MockAuth(app);
    auth.mockSocialSignIn(provider).respondWithUser("Foo", "foo@bar.com");

    const user = await auth.signInWithPopup(provider);
    expect(auth.currentUser).toBe(user);
    expect(user).toHaveProperty("displayName", "Foo");
    expect(user).toHaveProperty("email", "foo@bar.com");
    expect(user).toHaveProperty("providerId", provider.providerId);
  });

  it("responds with error mock", () => {
    const provider = new firebase.auth.FacebookAuthProvider();

    const auth = new MockAuth(app);
    auth.mockSocialSignIn(provider).respondWithError("auth/unauthorized-domain");

    const promise = auth.signInWithPopup(provider);
    return expect(promise).rejects.toThrow("auth/unauthorized-domain");
  });

  it("signs in again using same provider", async () => {
    const provider = new firebase.auth.FacebookAuthProvider();

    const auth = new MockAuth(app);
    auth.mockSocialSignIn(provider).respondWithUser("Foo", "foo@bar.com");
    auth.mockSocialSignIn(provider).respondWithUser("Foo", "foo@bar.com");

    const user1 = await auth.signInWithPopup(provider);
    const user2 = await auth.signInWithPopup(provider);
    expect(user1).toEqual(user2);
    expect(auth.currentUser).toBe(user2);
  });

  it("throws if email already exists for another account", () => {
    const provider = new firebase.auth.FacebookAuthProvider();

    const auth = new MockAuth(app);
    auth.createUserWithEmailAndPassword("foo@bar.com", "baz");
    auth.mockSocialSignIn(provider).respondWithUser("Foo", "foo@bar.com");

    const promise = auth.signInWithPopup(provider);
    return expect(promise).rejects.toThrow("auth/account-exists-with-different-credential");
  });
});

describe("#signOut()", () => {
  it("signs the user out", async () => {
    const auth = new MockAuth(app);
    await auth.signInAnonymously();
    await auth.signOut();
    expect(auth.currentUser).toBeNull();
  });

  it("invokes authStateChange listeners", async () => {
    const auth = new MockAuth(app);
    await auth.signInAnonymously();

    const listener = jest.fn();
    auth.onAuthStateChanged(listener);

    await auth.signOut();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith(null);
  });
});
