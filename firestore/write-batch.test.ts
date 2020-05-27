import createMockInstance from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockFirestore } from "./firestore";
import { MockWriteBatch } from "./write-batch";

let firestore: MockFirestore;
let batch: MockWriteBatch;
beforeEach(() => {
  firestore = new MockFirestore(createMockInstance(MockApp));
  batch = firestore.batch();
});

describe("#set()", () => {
  it("batches a set operation", async () => {
    const doc = firestore.doc("foo/bar");
    await batch.set(doc, { something: true }).commit();

    const snapshot = await doc.get();
    expect(snapshot.data()).toEqual({ something: true });
  });
});

describe("#update()", () => {
  it("batches an update operation", async () => {
    const doc = firestore.doc("foo/bar");
    await doc.set({ color: "red" });
    await batch.update(doc, { tool: "hammer" }).commit();

    const snapshot = await doc.get();
    expect(snapshot.data()).toEqual({ color: "red", tool: "hammer" });
  });
});

describe("#delete()", () => {
  it("batches a delete operation", async () => {
    const doc = firestore.doc("foo/bar");
    await batch.delete(doc).commit();

    const snapshot = await doc.get();
    expect(snapshot.exists).toBe(false);
  });
});

describe("#commit()", () => {
  it("emits snapshots only once per document", async () => {
    const doc1 = firestore.doc("foo/bar");
    const listener1 = jest.fn();
    doc1.onSnapshot(listener1);

    const doc2 = firestore.doc("foo/baz");
    const listener2 = jest.fn();
    doc2.onSnapshot(listener2);

    await batch
      .set(doc1, { color: "red" })
      .update(doc1, { tool: "hammer" })
      .set(doc2, { powerful: true })
      .commit();

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
  });

  it("doesn't emit snapshots if document didn't change", async () => {
    const doc = firestore.doc("foo/bar");
    await doc.set({ power: "max" });

    const listener = jest.fn();
    doc.onSnapshot(listener);

    await batch.set(doc, { power: "max" }).commit();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
