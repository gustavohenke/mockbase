import { createMockInstance } from "jest-create-mock-instance";
import { MockFirestore, QuerySnapshot } from "./";
import { MockApp } from "../app";
import { flushPromises } from "../util/index";

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

it("shares event listeners with other collections", async () => {
  const foo1 = firestore.collection("foo");
  const foo2 = firestore.collection("foo");

  const listener = jest.fn();
  foo1.onSnapshot(listener);

  await foo2.add({ x: 100 });
  await flushPromises();

  expect(listener).toHaveBeenCalledTimes(2);
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

describe("#get()", () => {
  it("gets a query snapshot", async () => {
    const coll = firestore.collection("foo");
    await coll.add({ x: 5 });
    await coll.add({ x: 1 });

    const snapshot = await coll.get();
    expect(snapshot.docs).toHaveLength(2);
  });
});

describe("#onSnapshot()", () => {
  it("listens to snapshot events", async () => {
    const coll = firestore.collection("foo");
    const onNext = jest.fn();
    coll.onSnapshot(onNext);

    await flushPromises();
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledWith(expect.any(QuerySnapshot));
  });

  it("returns snapshot event disposer", async () => {
    const coll = firestore.collection("foo");

    const onNext = jest.fn();
    const disposer = coll.onSnapshot(onNext);
    disposer();

    await coll.add({});
    await flushPromises();
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

describe("#where()", () => {
  it("creates new query with given filter", async () => {
    const coll = firestore.collection("foo");
    await coll.add({ x: 5 });

    const query = coll.where("x", "==", 1);
    const snapshot = await query.get();

    expect(snapshot.docs).toHaveLength(0);
  });
});

describe("#orderBy()", () => {
  it("creates new query with given ordering", async () => {
    const coll = firestore.collection("foo");
    const doc1 = await coll.add({ x: 5 });
    const doc2 = await coll.add({ x: 1 });

    const query = coll.orderBy("x");
    const snapshot = await query.get();

    expect(snapshot.docs).toEqual([await doc2.get(), await doc1.get()]);
  });
});

describe("#limit()", () => {
  it("creates new query with given limit", async () => {
    const coll = firestore.collection("foo");
    await coll.add({ x: 5 });
    await coll.add({ x: 1 });

    const query = coll.limit(1);
    const snapshot = await query.get();

    expect(snapshot.docs).toHaveLength(1);
  });
});
