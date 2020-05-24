import { createMockInstance } from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockFirestore, MockQuerySnapshot } from "./";
import { MockQueryDocumentSnapshot } from "./document-snapshot";
import { MockQuery } from "./query";

let query: MockQuery;
beforeEach(() => {
  query = new MockFirestore(createMockInstance(MockApp)).collection("foo");
});

const createQuery = (docs: MockQueryDocumentSnapshot<any>[]) => new MockQuerySnapshot(query, docs);

it("exposes lists of docs in #docs", () => {
  const docs = [
    createMockInstance(MockQueryDocumentSnapshot),
    createMockInstance(MockQueryDocumentSnapshot),
  ];

  const query = createQuery(docs);
  expect(query).toHaveProperty("docs", docs);
});

it("exposes #size as the length of #docs", () => {
  const docs = [
    createMockInstance(MockQueryDocumentSnapshot),
    createMockInstance(MockQueryDocumentSnapshot),
  ];

  const query = createQuery(docs);
  expect(query.size).toBe(docs.length);
});

it("exposes #empty as the true when #docs.length = 0", () => {
  const docs = [createMockInstance(MockQueryDocumentSnapshot)];

  const query1 = createQuery(docs);
  expect(query1.empty).toBe(false);

  const query2 = createQuery([]);
  expect(query2.empty).toBe(true);
});

describe("#forEach()", () => {
  it("iterates thru #docs", () => {
    const callback = jest.fn();

    const docs = [
      createMockInstance(MockQueryDocumentSnapshot),
      createMockInstance(MockQueryDocumentSnapshot),
    ];
    const query = createQuery(docs);

    query.forEach(callback);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(docs[0], 0, docs);
    expect(callback).toHaveBeenCalledWith(docs[1], 1, docs);
  });
});
