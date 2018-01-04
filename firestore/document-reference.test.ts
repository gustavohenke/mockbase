import { createMockInstance } from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockFirestore } from "./";

let firestore: MockFirestore;
beforeEach(() => {
  firestore = new MockFirestore(createMockInstance(MockApp));
});

it("exposes #firestore", () => {
  const doc = firestore.doc("foo/bar");
  expect(doc).toHaveProperty("firestore", firestore);
});

it("exposes #id", () => {
  const doc = firestore.doc("foo/bar");
  expect(doc).toHaveProperty("id", "bar");
});

it("exposes #path", () => {
  const doc = firestore.doc("foo/bar");
  expect(doc.path).toBe("/foo/bar");
});

it("shares same data as other instances", async () => {
  const doc1 = firestore.doc("foo/bar");
  await doc1.set({ foo: "bar" });

  const doc2 = firestore.doc("foo/bar");
  expect(doc1.data).toEqual(doc2.data);
});

describe("#get()", () => {
  it("instantiates a snapshot with the current data", async () => {
    const ref = firestore.doc("foo/bar");
    ref.set({ foo: "bar" });

    const doc = await ref.get();
    expect(doc).toHaveProperty("ref", ref);
    expect(doc.data()).toEqual({ foo: "bar" });

    ref.set({ bar: "baz" });
    expect(doc.data()).toEqual({ foo: "bar" });
  });
});

describe("#set()", () => {
  it("overwrites current data by default", async () => {
    const doc = firestore.doc("foo/bar");

    await doc.set({ bla: "blabla" });
    await doc.set({ bar: "baz" });

    expect(doc.data).toEqual({ bar: "baz" });
  });

  it("merges into current data if options.merge is true", async () => {
    const doc = firestore.doc("foo/bar");

    await doc.set({ bla: "blabla" });
    await doc.set({ bar: "baz" }, { merge: true });

    expect(doc.data).toEqual({
      bla: "blabla",
      bar: "baz"
    });
  });
});
