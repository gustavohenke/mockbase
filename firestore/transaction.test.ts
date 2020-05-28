import createMockInstance from "jest-create-mock-instance";
import { MockApp } from "../app";
import { MockDocumentReference } from "./document-reference";
import { MockFirestore } from "./firestore";
import { MockTransaction } from "./transaction";

let firestore: MockFirestore;
let banana: MockDocumentReference;
let apple: MockDocumentReference;
let transaction: MockTransaction;
beforeEach(async () => {
  firestore = new MockFirestore(createMockInstance(MockApp));
  banana = firestore.doc("fruits/banana");
  apple = firestore.doc("fruits/apple");
  await banana.set({ weight: 150 });
  await apple.set({ color: "red" });
  transaction = new MockTransaction(firestore);
});

describe("#set()", () => {
  it("sets document value within the transaction", async () => {
    const innerSnapshot = await transaction.set(banana, { family: "berries" }).get(banana);
    const outerSnapshot = await banana.get();
    expect(innerSnapshot.data()).toEqual({ family: "berries" });
    expect(outerSnapshot.data()).toEqual({ weight: 150 });
  });
});

describe("#update()", () => {
  it("updates document within the transaction", () => {
    return firestore.runTransaction(async (transaction) => {
      const innerSnapshot = await transaction.update(banana, { family: "berries" }).get(banana);
      const outerSnapshot = await banana.get();
      expect(innerSnapshot.data()).toEqual({ weight: 150, family: "berries" });
      expect(outerSnapshot.data()).toEqual({ weight: 150 });
    });
  });
});

describe("#delete()", () => {
  it("deletes document within the transaction", () => {
    return firestore.runTransaction(async (transaction) => {
      const innerSnapshot = await transaction.delete(banana).get(banana);
      const outerSnapshot = await banana.get();
      expect(innerSnapshot.exists).toBe(false);
      expect(outerSnapshot.exists).toBe(true);
    });
  });
});

describe("#get()", () => {
  it("gets initial document copy from parent Firestore", async () => {
    const snapshot = await transaction.get(banana);
    expect(snapshot.data()).toEqual({ weight: 150 });
  });

  it("reads from transaction state", async () => {
    const snapshot = await transaction.update(banana, { family: "berries" }).get(banana);
    expect(snapshot.data()).toEqual({ family: "berries", weight: 150 });
  });
});

describe("#commit()", () => {
  it("relays changes to parent Firestore", async () => {
    transaction
      .set(banana, { family: "berries" })
      .update(banana, { color: "yellow" })
      .delete(apple);
    await transaction.commit();

    const bananaSnapshot = await banana.get();
    expect(bananaSnapshot.data()).toEqual({ family: "berries", color: "yellow" });

    const appleSnapshot = await apple.get();
    expect(appleSnapshot.exists).toBe(false);
  });

  it("emits one snapshot event per changed document", async () => {
    const bananaListener = jest.fn();
    banana.onSnapshot(bananaListener);

    const appleListener = jest.fn();
    apple.onSnapshot(appleListener);

    transaction
      .set(banana, { color: "yellow" })
      .update(banana, { family: "berries" })
      .set(apple, { color: "red" });
    await transaction.commit();

    // First on listen, then on commit
    expect(bananaListener).toHaveBeenCalledTimes(2);
    // Only on listen. Apple didn't change.
    expect(appleListener).toHaveBeenCalledTimes(1);
  });
});
