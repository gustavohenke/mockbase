import { MockApp } from "./app";
import { MockAuth } from "../auth";
import { MockFirestore } from "../firestore";

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

describe("#firestore()", () => {
  it("builds and caches MockFirestore instance", () => {
    const app = new MockApp("app");
    const firestore = app.firestore();

    expect(firestore).toBeInstanceOf(MockFirestore);
    expect(firestore.app).toBe(app);
    expect(app.firestore()).toBe(firestore);
  });
});
