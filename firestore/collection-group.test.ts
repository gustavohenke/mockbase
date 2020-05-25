import createMockInstance from "jest-create-mock-instance";
import { MockDocumentReference, MockFirestore, MockQuery } from ".";
import { MockApp } from "../app";
import { flushPromises } from "../util";

let firestore: MockFirestore;
let docs: MockDocumentReference[];
beforeEach(async () => {
  firestore = new MockFirestore(createMockInstance(MockApp));
  docs = [
    await firestore.collection("foo").add({ baz: 1 }),
    await firestore.collection("some/delicious/foo").add({ baz: 2 }),
    await firestore.collection("some/delicious/foo/in_another/foo").add({ baz: 3 }),
  ];
});

it("extends Query", () => {
  const coll = firestore.collectionGroup("foo");
  expect(coll).toBeInstanceOf(MockQuery);
});

describe("#get()", () => {
  it("snapshots all collections ending with the ID", async () => {
    const snapshot = await firestore.collectionGroup("foo").get();
    expect(snapshot.docs).toHaveLength(3);
    expect(snapshot.docs[0].ref.path).toBe(docs[0].path);
    expect(snapshot.docs[1].ref.path).toBe(docs[1].path);
  });
});

describe("#onSnapshot()", () => {
  it("adds listeners to next snapshot of all matching collections", async () => {
    const onNext = jest.fn();
    firestore.collectionGroup("foo").onSnapshot(onNext);

    await flushPromises();
    expect(onNext).toHaveBeenCalledTimes(1);

    docs[1].set({ baz: 4 });
    await flushPromises();
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it("adds listeners to next snapshot of new matching collections", async () => {
    const onNext = jest.fn();
    firestore.collectionGroup("foo").onSnapshot(onNext);

    await flushPromises();
    expect(onNext).toHaveBeenCalledTimes(1);

    firestore.collection("yet/another/foo").add({ baz: 4 });
    await flushPromises();
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it("doesn't add listeners to new collections that don't match", async () => {
    const onNext = jest.fn();
    firestore.collectionGroup("foo").onSnapshot(onNext);
    await flushPromises();

    firestore.collection("woohoo").add({ baz: 4 });
    await flushPromises();
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("disposes of subscribed collections", async () => {
    const onNext = jest.fn();
    const dispose = firestore.collectionGroup("foo").onSnapshot(onNext);

    await flushPromises();
    dispose();
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
