import { MockApp } from "../app";
import { flushPromises } from "../util";
import { MockCollectionReference, MockQuery, MockQuerySnapshot, MockFirestore } from ".";
import { DEFAULT_DATA_CONVERTER } from "./data-converter";

let coll: MockCollectionReference;
let firestore: MockFirestore;
beforeEach(() => {
  firestore = new MockApp("app").firestore();
  coll = firestore.collection("foo");
});

it("exposes #firestore", () => {
  expect(coll.firestore).toBe(firestore);
});

describe("#isEqual()", () => {
  it("returns false if Firestore instances are not the same", () => {
    const firestore2 = new MockApp("app2").firestore();
    const query1 = new MockQuery(firestore, "/foo", DEFAULT_DATA_CONVERTER);
    const query2 = new MockQuery(firestore2, "/foo", DEFAULT_DATA_CONVERTER);
    expect(query1.isEqual(query2)).toBe(false);
  });

  it("returns false if the queries are not for the same collection", () => {
    const query1 = new MockQuery(firestore, "/foo", DEFAULT_DATA_CONVERTER);
    const query2 = new MockQuery(firestore, "/bar", DEFAULT_DATA_CONVERTER);
    expect(query1.isEqual(query2)).toBe(false);
  });

  it("returns false if the converter is not the same", () => {
    const query1 = new MockQuery(firestore, "/foo", DEFAULT_DATA_CONVERTER);
    const query2 = query1.withConverter({ fromFirestore: jest.fn(), toFirestore: jest.fn() });
    expect(query1.isEqual(query2)).toBe(false);
  });

  it("returns false if the filters are not the same", () => {
    const query1 = new MockQuery(firestore, "/foo", DEFAULT_DATA_CONVERTER);
    const query2 = query1.where("foo", ">", 5);
    expect(query1.isEqual(query2)).toBe(false);

    const query3 = query1.where("foo", ">", 5);
    expect(query2.isEqual(query3)).toBe(true);
  });

  it("returns false if #limit() is not the same", () => {
    const query1 = new MockQuery(firestore, "/foo", DEFAULT_DATA_CONVERTER);
    const query2 = query1.limit(10);
    expect(query1.isEqual(query2)).toBe(false);

    const query3 = query1.limit(10);
    expect(query2.isEqual(query3)).toBe(true);
  });

  it("returns false if #limitToLast() is not the same", () => {
    const query1 = new MockQuery(firestore, "/foo", DEFAULT_DATA_CONVERTER);
    const query2 = query1.limitToLast(10);
    expect(query1.isEqual(query2)).toBe(false);

    const query3 = query1.limitToLast(10);
    expect(query2.isEqual(query3)).toBe(true);
  });

  it("returns false if the ordering is not the same", () => {
    const query1 = new MockQuery(firestore, "/foo", DEFAULT_DATA_CONVERTER);
    const query2 = query1.orderBy("foo");
    expect(query1.isEqual(query2)).toBe(false);

    const query3 = query1.orderBy("foo", "desc");
    expect(query2.isEqual(query3)).toBe(false);

    const query4 = query1.orderBy("foo");
    expect(query2.isEqual(query4)).toBe(true);
  });
});

describe("#limit()", () => {
  it("doesn't limit by default", async () => {
    await coll.add({ foo: "bar" });
    await coll.add({ bar: "baz" });

    const snapshot = await coll.get();
    expect(snapshot.docs).toHaveLength(2);
  });

  it("limits to first matching docs", async () => {
    const doc1 = await coll.add({ foo: "bar" });
    await coll.add({ bar: "baz" });

    const snapshot = await coll.limit(1).get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs[0].id).toBe(doc1.id);
  });

  it("overrides #limitToLast()", async () => {
    const doc1 = await coll.add({ foo: "bar" });
    await coll.add({ bar: "baz" });

    const snapshot = await coll.limitToLast(1).limit(1).get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs[0].id).toBe(doc1.id);
  });
});

describe("#limitToLast()", () => {
  it("doesn't limit by default", async () => {
    await coll.add({ foo: "bar" });
    await coll.add({ bar: "baz" });

    const snapshot = await coll.get();
    expect(snapshot.docs).toHaveLength(2);
  });

  it("fails without ordering", async () => {
    await coll.add({ foo: "bar" });
    const snapshot = coll.limitToLast(1).get();
    await expect(snapshot).rejects.toThrowError();
  });

  it("limits to last matching docs", async () => {
    await coll.add({ foo: "bar" });
    const doc2 = await coll.add({ bar: "baz" });

    const snapshot = await coll.orderBy("bar").limitToLast(1).get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs[0].id).toBe(doc2.id);
  });

  it("overrides #limit()", async () => {
    await coll.add({ foo: "bar" });
    const doc2 = await coll.add({ bar: "baz" });

    const snapshot = await coll.orderBy("bar").limit(1).limitToLast(1).get();
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs[0].id).toBe(doc2.id);
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

describe("#startAt()", () => {
  it("doesn't filter without ordering", async () => {
    await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const snapshot = await coll.startAt(100).get();
    expect(snapshot.size).toBe(2);
  });

  it("filters by field value, inclusive", async () => {
    const doc1 = await coll.add({ foo: 60 });
    const doc2 = await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const snapshot = await coll.orderBy("foo").startAt(60).get();
    expect(snapshot.size).toBe(2);
    expect(snapshot.docs[0].id).toBe(doc1.id);
    expect(snapshot.docs[1].id).toBe(doc2.id);
  });

  it("filters by snapshot, inclusive", async () => {
    const doc1 = await coll.add({ foo: 60 });
    const doc2 = await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const docSnapshot = await doc1.get();
    const snapshot = await coll.orderBy("foo").startAt(docSnapshot).get();
    expect(snapshot.size).toBe(2);
    expect(snapshot.docs[0].id).toBe(doc1.id);
    expect(snapshot.docs[1].id).toBe(doc2.id);
  });
});

describe("#startAfter()", () => {
  it("doesn't filter without ordering", async () => {
    await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const snapshot = await coll.startAfter(100).get();
    expect(snapshot.size).toBe(2);
  });

  it("filters by field value, exclusive", async () => {
    await coll.add({ foo: 60 });
    const doc2 = await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const snapshot = await coll.orderBy("foo").startAfter(60).get();
    expect(snapshot.size).toBe(1);
    expect(snapshot.docs[0].id).toBe(doc2.id);
  });

  it("filters by snapshot, exclusive", async () => {
    const doc1 = await coll.add({ foo: 60 });
    const doc2 = await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const docSnapshot = await doc1.get();
    const snapshot = await coll.orderBy("foo").startAfter(docSnapshot).get();
    expect(snapshot.size).toBe(1);
    expect(snapshot.docs[0].id).toBe(doc2.id);
  });
});

describe("#endAt()", () => {
  it("doesn't filter without ordering", async () => {
    await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const snapshot = await coll.endAt(100).get();
    expect(snapshot.size).toBe(2);
  });

  it("filters by field value, inclusive", async () => {
    const doc1 = await coll.add({ foo: 60 });
    await coll.add({ foo: 100 });
    const doc3 = await coll.add({ foo: 50 });

    const snapshot = await coll.orderBy("foo").endAt(60).get();
    expect(snapshot.size).toBe(2);
    expect(snapshot.docs[0].id).toBe(doc3.id);
    expect(snapshot.docs[1].id).toBe(doc1.id);
  });

  it("filters by snapshot, inclusive", async () => {
    const doc1 = await coll.add({ foo: 60 });
    await coll.add({ foo: 100 });
    const doc3 = await coll.add({ foo: 50 });

    const docSnapshot = await doc1.get();
    const snapshot = await coll.orderBy("foo").endAt(docSnapshot).get();
    expect(snapshot.size).toBe(2);
    expect(snapshot.docs[0].id).toBe(doc3.id);
    expect(snapshot.docs[1].id).toBe(doc1.id);
  });
});

describe("#endBefore()", () => {
  it("doesn't filter without ordering", async () => {
    await coll.add({ foo: 100 });
    await coll.add({ foo: 50 });

    const snapshot = await coll.endBefore(100).get();
    expect(snapshot.size).toBe(2);
  });

  it("filters by field value, exclusive", async () => {
    await coll.add({ foo: 60 });
    await coll.add({ foo: 100 });
    const doc3 = await coll.add({ foo: 50 });

    const snapshot = await coll.orderBy("foo").endBefore(60).get();
    expect(snapshot.size).toBe(1);
    expect(snapshot.docs[0].id).toBe(doc3.id);
  });

  it("filters by snapshot, exclusive", async () => {
    const doc1 = await coll.add({ foo: 60 });
    await coll.add({ foo: 100 });
    const doc3 = await coll.add({ foo: 50 });

    const docSnapshot = await doc1.get();
    const snapshot = await coll.orderBy("foo").endBefore(docSnapshot).get();
    expect(snapshot.size).toBe(1);
    expect(snapshot.docs[0].id).toBe(doc3.id);
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

describe("#withConverter()", () => {
  it("sets the converter that will be used in snapshots", async () => {
    await coll.add({ foo: "bar" });
    const snapshot = await coll
      .withConverter({
        fromFirestore: jest.fn().mockReturnValue({ not: "bar" }),
        toFirestore: jest.fn(),
      })
      .get();

    expect(snapshot.docs[0].data()).toEqual({ not: "bar" });
  });
});
