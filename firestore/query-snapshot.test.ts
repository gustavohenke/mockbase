import { QuerySnapshot, DocumentSnapshot } from "./";
import { createMockInstance } from "jest-create-mock-instance";

it("exposes lists of docs in #docs", () => {
  const docs = [createMockInstance(DocumentSnapshot), createMockInstance(DocumentSnapshot)];

  const query = new QuerySnapshot(docs);
  expect(query).toHaveProperty("docs", docs);
});

it("exposes #size as the length of #docs", () => {
  const docs = [createMockInstance(DocumentSnapshot), createMockInstance(DocumentSnapshot)];

  const query = new QuerySnapshot(docs);
  expect(query.size).toBe(docs.length);
});

it("exposes #empty as the true when #docs.length = 0", () => {
  const docs = [createMockInstance(DocumentSnapshot)];

  const query1 = new QuerySnapshot(docs);
  expect(query1.empty).toBe(false);

  const query2 = new QuerySnapshot([]);
  expect(query2.empty).toBe(true);
});

describe("#forEach()", () => {
  it("iterates thru #docs", () => {
    const callback = jest.fn();

    const docs = [createMockInstance(DocumentSnapshot), createMockInstance(DocumentSnapshot)];
    const query = new QuerySnapshot(docs);

    query.forEach(callback);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(docs[0], 0, docs);
    expect(callback).toHaveBeenCalledWith(docs[1], 1, docs);
  });
});
