import { MockApp } from "../app";
import { CollectionReference, Query } from "./";

let coll: CollectionReference;
beforeEach(() => {
  coll = new MockApp("app").firestore().collection("foo");
});

it("exposes #firestore", () => {
  const query = new Query(coll);
  expect(query.firestore).toBe(coll.firestore);
});

describe("#where()", () => {
  it("adds a == query", async () => {
    const doc1 = await coll.add({ foo: "bar" });
    const doc2 = await coll.add({ foo: "baz" });

    const query = new Query(coll);
    query.where("foo", "==", "bar");

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs).toContainEqual(await doc1.get());
  });

  it("adds a > query", async () => {
    const doc1 = await coll.add({ foo: 100 });
    const doc2 = await coll.add({ foo: 50 });

    const query = new Query(coll);
    query.where("foo", ">", 50);

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs).toContainEqual(await doc1.get());
  });

  it("adds a < query", async () => {
    const doc1 = await coll.add({ foo: 100 });
    const doc2 = await coll.add({ foo: 50 });

    const query = new Query(coll);
    query.where("foo", "<", 100);

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs).toContainEqual(await doc2.get());
  });

  it("adds a >= query", async () => {
    const doc1 = await coll.add({ foo: 100 });
    const doc2 = await coll.add({ foo: 50 });

    const query = new Query(coll);
    query.where("foo", ">=", 50);

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(2);
    expect(snapshot.docs[0]).toEqual(await doc1.get());
    expect(snapshot.docs[1]).toEqual(await doc2.get());
  });

  it("adds a <= query", async () => {
    const doc1 = await coll.add({ foo: 100 });
    const doc2 = await coll.add({ foo: 50 });

    const query = new Query(coll);
    query.where("foo", "<=", 100);

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(2);
    expect(snapshot.docs[0]).toEqual(await doc1.get());
    expect(snapshot.docs[1]).toEqual(await doc2.get());
  });
});
