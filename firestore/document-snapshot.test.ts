import { MockApp } from "../app/app";
import { MockDocumentReference } from "./";
import { MockDocumentSnapshot } from "./document-snapshot";

let ref: MockDocumentReference;
beforeEach(async () => {
  const app = new MockApp("app");
  ref = app.firestore().doc("foo/bar");
});

it("exposes #ref", () => {
  const doc = new MockDocumentSnapshot(ref, {});
  expect(doc).toHaveProperty("ref", ref);
});

it("exposes #id", () => {
  const doc = new MockDocumentSnapshot(ref, {});
  expect(doc.id).toBe("bar");
});

describe("#data()", () => {
  it("returns the whole data", () => {
    const doc = new MockDocumentSnapshot(ref, { foo: "bar" });
    expect(doc.data()).toEqual({ foo: "bar" });
  });

  it("returns converted data from the DocumentReference", () => {
    const converter = {
      fromFirestore: jest.fn().mockReturnValue({ baz: "qux" }),
      toFirestore: jest.fn(),
    };
    const refWithConverter = ref.withConverter(converter);
    const doc = new MockDocumentSnapshot(refWithConverter, { foo: "bar" });
    expect(doc.data()).toEqual({ baz: "qux" });
    expect(converter.fromFirestore).toHaveBeenCalled();
  });
});

describe("#get()", () => {
  it("gets a specific key", () => {
    const doc = new MockDocumentSnapshot(ref, { foo: "bar" });
    expect(doc.get("foo")).toBe("bar");
  });

  it("gets a deep-level key", () => {
    const doc = new MockDocumentSnapshot(ref, { foo: { bar: "baz" } });
    expect(doc.get("foo.bar")).toBe("baz");
  });

  it("gets a deep-level key that doesn't exist as undefined", () => {
    const doc = new MockDocumentSnapshot(ref, { foo: "bar" });
    expect(doc.get("foo.bar")).toBe(undefined);
  });
});

describe("#isEqual()", () => {
  it("returns false if `#ref`s are not equal", () => {
    const ref2 = ref.parent.doc("baz");
    const doc1 = new MockDocumentSnapshot(ref, {});
    const doc2 = new MockDocumentSnapshot(ref2, {});
    expect(doc1.isEqual(doc2)).toBe(false);

    const ref3 = ref.parent.doc("baz");
    const doc3 = new MockDocumentSnapshot(ref3, doc2._data);
    expect(doc2.isEqual(doc3)).toBe(true);
  });

  it("returns whether data is the same", () => {
    const doc1 = new MockDocumentSnapshot(ref, { foo: "baz" });
    const doc2 = new MockDocumentSnapshot(ref, { foo: "bar" });
    expect(doc1.isEqual(doc2)).toBe(false);

    const doc3 = new MockDocumentSnapshot(ref, { foo: "baz" });
    expect(doc1.isEqual(doc3)).toBe(true);

    const doc4 = new MockDocumentSnapshot(ref, doc1._data);
    expect(doc1.isEqual(doc4)).toBe(true);
  });
});
