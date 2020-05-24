import { MockApp } from "../app";
import { flushPromises } from "../util";
import { MockCollectionReference, MockQuery, MockQuerySnapshot, MockFirestore } from ".";

let coll: MockCollectionReference;
let firestore: MockFirestore;
beforeEach(() => {
  firestore = new MockApp("app").firestore();
  coll = firestore.collection("foo");
});

it("exposes #firestore", () => {
  expect(coll.firestore).toBe(firestore);
});

describe("#limit()", () => {
  it("doesn't limit by default", async () => {
    await coll.add({ foo: "bar" });
    await coll.add({ bar: "baz" });

    const snapshot = await coll.get();
    expect(snapshot.docs).toHaveLength(2);
  });

  it("limits by set value", async () => {
    await coll.add({ foo: "bar" });
    await coll.add({ bar: "baz" });

    const snapshot = await coll.limit(1).get();
    expect(snapshot.docs).toHaveLength(1);
  });
});

describe("#orderBy()", () => {
  it("orders by insertion order by default", async () => {
    const doc1 = await coll.add({ foo: "bar" });
    const doc2 = await coll.add({ bar: "baz" });

    const snapshot = await coll.get();
    expect(snapshot.docs[0].id).toBe(doc1.id);
    expect(snapshot.docs[1].id).toBe(doc2.id);
  });

  it("orders by a given field by asc", async () => {
    const doc1 = await coll.add({ foo: 100 });
    const doc2 = await coll.add({ foo: 50 });

    const snapshot = await coll.orderBy("foo", "asc").get();
    expect(snapshot.docs[0].id).toBe(doc2.id);
    expect(snapshot.docs[1].id).toBe(doc1.id);
  });

  it("orders by a given field by desc", async () => {
    const doc1 = await coll.add({ foo: 50 });
    const doc2 = await coll.add({ foo: 100 });

    const snapshot = await coll.orderBy("foo", "desc").get();
    expect(snapshot.docs[0].id).toBe(doc2.id);
    expect(snapshot.docs[1].id).toBe(doc1.id);
  });
});

describe("#where()", () => {
  it("adds a == query", async () => {
    const doc1 = await coll.add({ foo: "bar" });
    await coll.add({ foo: "baz" });

    const query = coll.where("foo", "==", "bar");

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs).toContainEqual(await doc1.get());
  });

  it("adds a > query", async () => {
    const doc1 = await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const query = coll.where("foo", ">", 50);

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs).toContainEqual(await doc1.get());
  });

  it("adds a < query", async () => {
    await coll.add({ foo: 100 });
    const doc2 = await coll.add({ foo: 50 });

    const query = coll.where("foo", "<", 100);

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs).toContainEqual(await doc2.get());
  });

  it("adds a >= query", async () => {
    const doc1 = await coll.add({ foo: 100 });
    const doc2 = await coll.add({ foo: 50 });

    const query = coll.where("foo", ">=", 50);

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(2);
    expect(snapshot.docs[0]).toEqual(await doc1.get());
    expect(snapshot.docs[1]).toEqual(await doc2.get());
  });

  it("adds a <= query", async () => {
    const doc1 = await coll.add({ foo: 100 });
    const doc2 = await coll.add({ foo: 50 });

    const query = coll.where("foo", "<=", 100);

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(2);
    expect(snapshot.docs[0]).toEqual(await doc1.get());
    expect(snapshot.docs[1]).toEqual(await doc2.get());
  });
});

describe("#onSnapshot()", () => {
  const createTests = (executor: (query: MockQuery, onNext: any) => () => void) => () => {
    it("sets onNext and emits it right away", async () => {
      const onNext = jest.fn();
      executor(coll, onNext);

      await flushPromises();
      expect(onNext).toHaveBeenCalledWith(expect.any(MockQuerySnapshot));
    });

    it("unsets the onNext listener on disposal", async () => {
      const onNext = jest.fn();
      const disposer = executor(coll, onNext);
      disposer();

      await flushPromises();
      expect(onNext).toHaveBeenCalledTimes(1);
    });
  };

  describe(
    "with listener args",
    createTests((doc, onNext) => doc.onSnapshot(onNext))
  );

  describe(
    "with options + listener args",
    createTests((doc, onNext) => doc.onSnapshot({}, onNext))
  );

  describe(
    "with observer arg",
    createTests((doc, onNext) => doc.onSnapshot({ next: onNext }))
  );

  describe(
    "with options + observer args",
    createTests((doc, onNext) => doc.onSnapshot({}, { next: onNext }))
  );
});
