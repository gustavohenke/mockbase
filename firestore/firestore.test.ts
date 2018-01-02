import { createMockInstance } from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockFirestore } from "./";

let app: MockApp;
beforeEach(() => {
  app = createMockInstance(MockApp);
});

it("exposes #app", () => {
  const firestore = new MockFirestore(app);
  expect(firestore).toHaveProperty("app", app);
});

describe("#collection()", () => {
  it("throws if a doc path is provided", () => {
    const firestore = new MockFirestore(app);
    const bomb = () => firestore.collection("foo/bar");

    expect(bomb).toThrowError();
  });

  it("builds thru the collection path", () => {
    const coll = new MockFirestore(app).collection("foo/bar/baz");
    expect(coll.id).toBe("baz");
    expect(coll.parent!.id).toBe("bar");
    expect(coll.parent!.parent.id).toBe("foo");
    expect(coll.parent!.parent.parent).toBeNull();
  });

  it("returns first-level collection with null parent", () => {
    const coll = new MockFirestore(app).collection("foo");
    expect(coll.parent).toBeNull();
  });
});

describe("#doc()", () => {
  it("throws if a collection path is provided", () => {
    const firestore = new MockFirestore(app);
    const bomb = () => firestore.doc("foo");

    expect(bomb).toThrowError();
  });

  it("builds thru the collection path", () => {
    const doc = new MockFirestore(app).doc("foo/bar/baz/qux");
    expect(doc.id).toBe("qux");
    expect(doc.parent.id).toBe("baz");
    expect(doc.parent.parent!.id).toBe("bar");
    expect(doc.parent.parent!.parent.id).toBe("foo");
    expect(doc.parent.parent!.parent.parent).toBeNull();
  });
});

describe("#enablePersistence()", () => {
  it("can be called", () => {
    return new MockFirestore(app).enablePersistence();
  });
});

describe("#nextId()", () => {
  it("increases the ID every call", () => {
    const firestore = new MockFirestore(app);
    expect(firestore.nextId()).toBe("__id0");
    expect(firestore.nextId()).toBe("__id1");
  });
});
