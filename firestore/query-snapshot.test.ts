import { createMockInstance } from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockFirestore, MockQuerySnapshot } from "./";
import { MockQueryDocumentSnapshot } from "./document-snapshot";
import { MockQuery } from "./query";

let query: MockQuery;
beforeEach(() => {
  query = new MockFirestore(createMockInstance(MockApp)).collection("foo");
});

const createSnapshot = (docs: MockQueryDocumentSnapshot<any>[]) =>
  new MockQuerySnapshot(query, docs);

it("exposes lists of docs in #docs", () => {
  const docs = [
    createMockInstance(MockQueryDocumentSnapshot),
    createMockInstance(MockQueryDocumentSnapshot),
  ];

  const query = createSnapshot(docs);
  expect(query).toHaveProperty("docs", docs);
});

it("exposes #size as the length of #docs", () => {
  const docs = [
    createMockInstance(MockQueryDocumentSnapshot),
    createMockInstance(MockQueryDocumentSnapshot),
  ];

  const query = createSnapshot(docs);
  expect(query.size).toBe(docs.length);
});

it("exposes #empty as the true when #docs.length = 0", () => {
  const docs = [createMockInstance(MockQueryDocumentSnapshot)];

  const query1 = createSnapshot(docs);
  expect(query1.empty).toBe(false);

  const query2 = createSnapshot([]);
  expect(query2.empty).toBe(true);
});

describe("#forEach()", () => {
  it("iterates thru #docs", () => {
    const callback = jest.fn();

    const docs = [
      createMockInstance(MockQueryDocumentSnapshot),
      createMockInstance(MockQueryDocumentSnapshot),
    ];
    const query = createSnapshot(docs);

    query.forEach(callback);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(docs[0], 0, docs);
    expect(callback).toHaveBeenCalledWith(docs[1], 1, docs);
  });
});

describe("#isEqual()", () => {
  it("returns false if snapshot sizes are not the same", () => {
    const snapshot1 = createSnapshot([]);
    const snapshot2 = createSnapshot([createMockInstance(MockQueryDocumentSnapshot)]);
    expect(snapshot1.isEqual(snapshot2)).toBe(false);
  });

  it("returns false if documents are not equal", () => {
    const doc = query.firestore.doc("foo/bar");
    const snapshot1 = createSnapshot([new MockQueryDocumentSnapshot(doc, {})]);
    const snapshot2 = createSnapshot([new MockQueryDocumentSnapshot(doc, { foo: "bar" })]);
    expect(snapshot1.isEqual(snapshot2)).toBe(false);
  });

  it("returns true otherwise", async () => {
    const doc = query.firestore.doc("foo/bar");
    await doc.set({ foo: "bar" });
    const snapshot1 = await query.get();
    const snapshot2 = await query.get();
    expect(snapshot1.isEqual(snapshot2)).toBe(true);
  });
});
