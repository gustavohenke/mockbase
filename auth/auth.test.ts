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

    auth.store.add({ email: "foo@bar.com", password: "password" });
    expect(auth.store.add).toHaveBeenCalledWith({
      email: "foo@bar.com",
      password: "password"
    });
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
