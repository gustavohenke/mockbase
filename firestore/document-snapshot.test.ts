import { MockApp } from "../app/app";
import { DocumentReference, DocumentSnapshot } from "./";
import { DataConverter } from "./data-converter";

let ref: DocumentReference;
beforeEach(() => {
  const app = new MockApp("app");
  ref = app.firestore().doc("foo/bar");
});

it("exposes #firestore", () => {
  const doc = new DocumentSnapshot(ref, {}, new DataConverter());
  expect(doc.firestore).toBe(ref.firestore);
});

it("exposes #ref", () => {
  const doc = new DocumentSnapshot(ref, {}, new DataConverter());
  expect(doc).toHaveProperty("ref", ref);
});

it("exposes #id", () => {
  const doc = new DocumentSnapshot(ref, {}, new DataConverter());
  expect(doc.id).toBe("bar");
});

describe("#data()", () => {
  it("returns the whole data", () => {
    const doc = new DocumentSnapshot(ref, { foo: "bar" }, new DataConverter());
    expect(doc.data()).toEqual({ foo: "bar" });
  });
});

describe("#get()", () => {
  it("gets a specific key", () => {
    const doc = new DocumentSnapshot(ref, { foo: "bar" }, new DataConverter());
    expect(doc.get("foo")).toBe("bar");
  });

  it("gets a deep-level key", () => {
    const doc = new DocumentSnapshot(ref, { foo: { bar: "baz" } }, new DataConverter());
    expect(doc.get("foo.bar")).toBe("baz");
  });

  it("gets a deep-level key that doesn't exist as undefined", () => {
    const doc = new DocumentSnapshot(ref, { foo: "bar" }, new DataConverter());
    expect(doc.get("foo.bar")).toBe(undefined);
  });
});
