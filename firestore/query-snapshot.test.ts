import { createMockInstance } from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockFirestore, MockQuerySnapshot } from "./";
import { MockQueryDocumentSnapshot } from "./document-snapshot";
import { MockQuery } from "./query";

let query: MockQuery;
beforeEach(() => {
  query = new MockFirestore(createMockInstance(MockApp)).collection("foo");
});

const createSnapshot = (docs: MockQueryDocumentSnapshot<any>[]) => {
  const snapshot = new MockQuerySnapshot(query, docs);
  query.snapshotVersions.push(snapshot);
  return snapshot;
};

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

describe("#docChanges()", () => {
  // this emulates doing a query.get().
  it("lists all docs as added if there's no previous snapshot", () => {
    const docs = [
      createMockInstance(MockQueryDocumentSnapshot),
      createMockInstance(MockQueryDocumentSnapshot),
    ];

    const changes = createSnapshot(docs).docChanges();
    expect(changes).toHaveLength(2);
    expect(changes).toContainEqual({
      type: "added",
      oldIndex: -1,
      newIndex: 0,
      doc: docs[0],
    });
    expect(changes).toContainEqual({
      type: "added",
      oldIndex: -1,
      newIndex: 1,
      doc: docs[1],
    });
  });

  it("lists docs as modified when they have moved in the last snapshot", async () => {
    const docs = [
      new MockQueryDocumentSnapshot(query.firestore.doc("foo/bar"), {}),
      new MockQueryDocumentSnapshot(query.firestore.doc("foo/baz"), {}),
    ];

    createSnapshot(docs);
    const snapshot2 = createSnapshot([docs[1], docs[0]]);

    const changes = snapshot2.docChanges();
    expect(changes).toHaveLength(2);
    expect(changes).toContainEqual({
      type: "modified",
      oldIndex: 1,
      newIndex: 0,
      doc: docs[1],
    });
    expect(changes).toContainEqual({
      type: "modified",
      oldIndex: 0,
      newIndex: 1,
      doc: docs[0],
    });
  });

  it("lists docs as modified when they are not equal", async () => {
    const doc1 = new MockQueryDocumentSnapshot(query.firestore.doc("foo/bar"), {});
    const doc2 = new MockQueryDocumentSnapshot(query.firestore.doc("foo/bar"), { some: "foo" });

    createSnapshot([doc1]);
    const snapshot2 = createSnapshot([doc2]);

    const changes = snapshot2.docChanges();
    expect(changes).toHaveLength(1);
    expect(changes).toContainEqual({
      type: "modified",
      oldIndex: 0,
      newIndex: 0,
      doc: doc2,
    });
  });

  it("lists docs as removed when they are not in the current snapshot", async () => {
    const docs = [
      new MockQueryDocumentSnapshot(query.firestore.doc("foo/bar"), {}),
      new MockQueryDocumentSnapshot(query.firestore.doc("foo/baz"), {}),
    ];

    createSnapshot(docs);
    const snapshot2 = createSnapshot([docs[0]]);

    const changes = snapshot2.docChanges();
    expect(changes).toHaveLength(1);
    expect(changes).toContainEqual({
      type: "removed",
      oldIndex: 1,
      newIndex: -1,
      doc: docs[1],
    });
  });

  it("lists docs as added when they are not in the previous snapshot", async () => {
    const docs = [
      new MockQueryDocumentSnapshot(query.firestore.doc("foo/bar"), {}),
      new MockQueryDocumentSnapshot(query.firestore.doc("foo/baz"), {}),
    ];

    createSnapshot([docs[0]]);
    const snapshot2 = createSnapshot(docs);

    const changes = snapshot2.docChanges();
    expect(changes).toHaveLength(1);
    expect(changes).toContainEqual({
      type: "added",
      oldIndex: -1,
      newIndex: 1,
      doc: docs[1],
    });
  });
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
