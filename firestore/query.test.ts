import { MockApp } from "../app";
import { flushPromises } from "../util";
import { COLLECTION_CHANGE_EVENT, CollectionReference, Query, QuerySnapshot } from "./";

let coll: CollectionReference;
beforeEach(() => {
  coll = new MockApp("app").firestore().collection("foo");
});

it("exposes #firestore", () => {
  const query = new Query(coll);
  expect(query.firestore).toBe(coll.firestore);
});

it("listens to changes to parent collection and emits snapshot events", async () => {
  const onNext = jest.fn();

  const query = new Query(coll);
  query.onSnapshot(onNext);

  coll.emitter.emit(COLLECTION_CHANGE_EVENT);
  await flushPromises();

  expect(onNext).toHaveBeenCalledWith(expect.any(QuerySnapshot));
});

describe("#limit()", () => {
  it("doesn't limit by default", async () => {
    await coll.add({ foo: "bar" });
    await coll.add({ bar: "baz" });

    const snapshot = await new Query(coll).get();
    expect(snapshot.docs).toHaveLength(2);
  });

  it("limits by set value", async () => {
    await coll.add({ foo: "bar" });
    await coll.add({ bar: "baz" });

    const snapshot = await new Query(coll).limit(1).get();
    expect(snapshot.docs).toHaveLength(1);
  });
});

describe("#orderBy()", () => {
  it("orders by insertion order by default", async () => {
    const doc1 = await coll.add({ foo: "bar" });
    const doc2 = await coll.add({ bar: "baz" });

    const snapshot = await new Query(coll).get();
    expect(snapshot.docs).toEqual([await doc1.get(), await doc2.get()]);
  });

  it("orders by a given field by asc", async () => {
    const doc1 = await coll.add({ foo: 100 });
    const doc2 = await coll.add({ foo: 50 });

    const snapshot = await new Query(coll).orderBy("foo", "asc").get();
    expect(snapshot.docs).toEqual([await doc2.get(), await doc1.get()]);
  });

  it("orders by a given field by desc", async () => {
    const doc1 = await coll.add({ foo: 50 });
    const doc2 = await coll.add({ foo: 100 });

    const snapshot = await new Query(coll).orderBy("foo", "desc").get();
    expect(snapshot.docs).toEqual([await doc2.get(), await doc1.get()]);
  });
});

describe("#where()", () => {
  it("adds a == query", async () => {
    const doc1 = await coll.add({ foo: "bar" });
    await coll.add({ foo: "baz" });

    const query = new Query(coll);
    query.where("foo", "==", "bar");

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs).toContainEqual(await doc1.get());
  });

  it("adds a > query", async () => {
    const doc1 = await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const query = new Query(coll);
    query.where("foo", ">", 50);

    const snapshot = await query.get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs).toContainEqual(await doc1.get());
  });

  it("adds a < query", async () => {
    await coll.add({ foo: 100 });
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

describe("#onSnapshot()", () => {
  const createTests = (executor: (query: Query, onNext: any) => () => void) => () => {
    it("sets onNext and emits it right away", async () => {
      const query = new Query(coll);

      const onNext = jest.fn();
      executor(query, onNext);

      await flushPromises();
      expect(onNext).toHaveBeenCalledWith(expect.any(QuerySnapshot));
    });

    it("unsets the onNext listener on disposal", async () => {
      const query = new Query(coll);

      const onNext = jest.fn();
      const disposer = executor(query, onNext);
      disposer();

      await flushPromises();
      expect(onNext).toHaveBeenCalledTimes(1);
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
