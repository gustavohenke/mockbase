import { createMockInstance } from "jest-create-mock-instance";
import { MockFirestore } from "./";
import { MockApp } from "../app";

let firestore: MockFirestore;
beforeEach(() => {
  firestore = new MockFirestore(createMockInstance(MockApp));
});

it("exposes #firestore", () => {
  const coll = firestore.collection("foo");
  expect(coll).toHaveProperty("firestore", firestore);
});

it("exposes #id", () => {
  const coll = firestore.collection("foo");
  expect(coll).toHaveProperty("id", "foo");
});

it("exposes #path", () => {
  const coll = firestore.collection("foo");
  expect(coll.path).toBe("/foo");
});

it("sets data into root if it has no parent", () => {
  const coll = firestore.collection("foo");
  expect(firestore.children.get("foo")).toBe(coll);
});

it("sets data into parent", () => {
  const bar = firestore.doc("foo/bar");
  const baz = firestore.collection("foo/bar/baz");
  expect(bar.children.get("baz")).toBe(baz);
});

describe("#add()", () => {
  it("creates a doc with a random ID", async () => {
    const coll = firestore.collection("foo");
    const doc = await coll.add({});
    expect(doc).toHaveProperty("id", "__id0");
  });

  it("creates a doc with given data", async () => {
    const coll = firestore.collection("foo");
    const doc = await coll.add({ foo: "bar" });

    expect(doc.data).toEqual({ foo: "bar" });
  });
});

describe("#doc()", () => {
  it("builds with right firestore instance and parent", () => {
    const coll = firestore.collection("foo");
    const doc = coll.doc("bar");

    expect(doc).toHaveProperty("parent", coll);
    expect(doc).toHaveProperty("firestore", coll.firestore);
  });

  it("gets a doc with the given ID", () => {
    const coll = firestore.collection("foo");

    const doc = coll.doc("bar");
    expect(doc).toHaveProperty("id", "bar");
  });

  it("gets a doc with a random ID", () => {
    const coll = firestore.collection("foo");

    const doc = coll.doc();
    expect(doc).toHaveProperty("id", "__id0");
  });
});
