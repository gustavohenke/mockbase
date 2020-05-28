import { createMockInstance } from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockFirestore } from "./";
import { MockCollectionGroup } from "./collection-group";

let app: MockApp;
let firestore: MockFirestore;
beforeEach(() => {
  app = createMockInstance(MockApp);
  firestore = new MockFirestore(app);
});

it("exposes #app", () => {
  expect(firestore).toHaveProperty("app", app);
});

describe("#collection()", () => {
  it("throws if a doc path is provided", () => {
    const bomb = () => firestore.collection("foo/bar");

    expect(bomb).toThrowError();
  });

  it("builds thru the collection path", () => {
    const coll = firestore.collection("foo/bar/baz");
    expect(coll.id).toBe("baz");
    expect(coll.parent!.id).toBe("bar");
    expect(coll.parent!.parent.id).toBe("foo");
    expect(coll.parent!.parent.parent).toBeNull();
  });

  it("returns first-level collection with null parent", () => {
    const coll = firestore.collection("foo");
    expect(coll.parent).toBeNull();
  });

  it("throws if instance is terminated", () => {
    firestore.terminate();
    const bomb = () => firestore.collection("foo");
    expect(bomb).toThrowError();
  });
});

describe("#collectionGroup()", () => {
  it("returns a collection group", () => {
    const group = firestore.collectionGroup("foo");
    expect(group).toBeInstanceOf(MockCollectionGroup);
  });
});

describe("#doc()", () => {
  it("throws if a collection path is provided", () => {
    const bomb = () => firestore.doc("foo");

    expect(bomb).toThrowError();
  });

  it("builds thru the collection path", () => {
    const doc = firestore.doc("foo/bar/baz/qux");
    expect(doc.id).toBe("qux");
    expect(doc.parent.id).toBe("baz");
    expect(doc.parent.parent!.id).toBe("bar");
    expect(doc.parent.parent!.parent.id).toBe("foo");
    expect(doc.parent.parent!.parent.parent).toBeNull();
  });

  it("throws if instance is terminated", () => {
    firestore.terminate();
    const bomb = () => firestore.doc("foo/bar");
    expect(bomb).toThrowError();
  });
});

describe("#runTransaction()", () => {
  it("awaits commit to complete", async () => {
    const banana = firestore.doc("fruits/banana");
    await firestore.runTransaction(async (transaction) => {
      transaction.set(banana, { color: "yellow" });
    });
    expect(firestore.documentData.get(banana.path)).toEqual({ color: "yellow" });
  });

  it("returns returned value from transaction function", async () => {
    const banana = firestore.doc("fruits/banana");
    const result = await firestore.runTransaction(async (transaction) => {
      transaction.set(banana, { color: "brown" });
      return "banana is now rotten";
    });
    expect(result).toBe("banana is now rotten");
  });
});

describe("#clearPersistence()", () => {
  it("succeeds if Firestore instance is not running", async () => {
    await expect(firestore.clearPersistence()).resolves.toBe(undefined);
    await firestore.terminate();
    await expect(firestore.clearPersistence()).resolves.toBe(undefined);
  });

  it("fails if Firestore instance is running", async () => {
    firestore.collection("foo");
    await expect(firestore.clearPersistence()).rejects.toThrowError("precondition-failed");
  });
});

describe("#enablePersistence()", () => {
  it("succeeds if Firestore instance is not started", async () => {
    await expect(new MockFirestore(app).enablePersistence()).resolves.toBe(undefined);
  });

  it("fails if Firestore instance is running", async () => {
    firestore.collection("foo");
    await expect(firestore.enablePersistence()).rejects.toThrowError("precondition-failed");
  });
});

describe("#nextId()", () => {
  it("increases the ID every call", () => {
    const firestore = new MockFirestore(app);
    expect(firestore.nextId()).toBe("__id0");
    expect(firestore.nextId()).toBe("__id1");
  });
});
