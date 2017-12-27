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

describe("#createUserWithEmailAndPassword", () => {
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
