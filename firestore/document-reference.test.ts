import { createMockInstance } from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockFirestore, DocumentReference, COLLECTION_CHANGE_EVENT } from "./";

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
    await ref.set({ foo: "bar" });

    const doc = await ref.get();
    expect(doc).toHaveProperty("ref", ref);
    expect(doc.data()).toEqual({ foo: "bar" });

    await ref.set({ bar: "baz" });
    expect(doc.data()).toEqual({ foo: "bar" });
  });
});

describe("#onSnapshot()", () => {
  const createTests = (executor: (doc: DocumentReference, onNext: any) => () => void) => () => {
    it("sets onNext and emits it right away", () => {
      const doc = firestore.doc("foo/bar");

      const onNext = jest.fn();
      executor(doc, onNext);

      return doc.get().then(snapshot => {
        expect(onNext).toHaveBeenCalledWith(snapshot);
      });
    });

    it("unsets the onNext listener on disposal", () => {
      const doc = firestore.doc("foo/bar");

      const onNext = jest.fn();
      const disposer = executor(doc, onNext);
      disposer();

      return doc.get().then(snapshot => {
        expect(onNext).not.toHaveBeenCalled();
      });
    });
  };

  describe("with listener args", createTests((doc, onNext) => doc.onSnapshot(onNext)));

  describe(
    "with options + listener args",
    createTests((doc, onNext) => doc.onSnapshot({}, onNext))
  );

  describe("with observer arg", createTests((doc, onNext) => doc.onSnapshot({ next: onNext })));

  describe(
    "with options + observer args",
    createTests((doc, onNext) => doc.onSnapshot({}, { next: onNext }))
  );
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

  it("emits snapshot events", async () => {
    const doc = firestore.doc("foo/bar");

    const onNext = jest.fn();
    doc.onSnapshot(onNext);

    await doc.set({ bla: "blabla" });

    // 1 for the snapshot setting, 1 for the set value
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it("emits change events on the parent collection", async () => {
    const coll = firestore.collection("foo");

    const listener = jest.fn();
    coll.emitter.on(COLLECTION_CHANGE_EVENT, listener);

    const doc = coll.doc("bar");
    await doc.set({ bla: "blabla" });

    expect(listener).toHaveBeenCalled();
  });
});
