import { MockApp } from "./app";
import { MockAuth } from "../auth/auth";

it("exposes name and options", () => {
  const app = new MockApp("foo", { bar: "baz" });
  expect(app.name).toBe("foo");
  expect(app.options).toEqual({ bar: "baz" });
});

describe("#auth()", () => {
  it("builds and caches MockAuth instance", () => {
    const app = new MockApp("app");
    const auth = app.auth();

    expect(auth).toBeInstanceOf(MockAuth);
    expect(auth.app).toBe(app);
    expect(app.auth()).toBe(auth);
  });
});