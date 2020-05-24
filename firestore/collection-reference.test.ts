import { createMockInstance } from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockFirestore } from "./";
import { MockQuery } from "./query";

let firestore: MockFirestore;
beforeEach(() => {
  firestore = new MockFirestore(createMockInstance(MockApp));
});

it("extends Query", () => {
  const coll = firestore.collection("foo");
  expect(coll).toBeInstanceOf(MockQuery);
});

it("exposes #id", () => {
  const coll = firestore.collection("foo");
  expect(coll).toHaveProperty("id", "foo");
});

it("exposes #path", () => {
  const coll = firestore.collection("foo");
  expect(coll.path).toBe("/foo");
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

    expect((await doc.get()).data()).toEqual({ foo: "bar" });
  });
});

describe("#doc()", () => {
  it("builds with right firestore instance and parent", () => {
    const coll = firestore.collection("foo");
    const doc = coll.doc("bar");

    expect(doc).toHaveProperty("parent.path", coll.path);
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

describe("#isEqual()", () => {
  it("returns false if Firestore instances are not the same", () => {
    const firestore2 = new MockFirestore(createMockInstance(MockApp));
    const isEqual = firestore.collection("foo").isEqual(firestore2.collection("foo"));
    expect(isEqual).toBe(false);
  });

  it("returns false if paths are not the same", () => {
    const isEqual = firestore.collection("foo").isEqual(firestore.collection("bar"));
    expect(isEqual).toBe(false);
  });

  it("returns false if converters are not the same", () => {
    const isEqual = firestore.collection("foo").isEqual(
      firestore.collection("foo").withConverter({
        fromFirestore: jest.fn(),
        toFirestore: jest.fn(),
      })
    );
    expect(isEqual).toBe(false);
  });

  it("returns true otherwise", () => {
    const isEqual = firestore.collection("foo").isEqual(firestore.collection("foo"));
    expect(isEqual).toBe(true);
  });
});
