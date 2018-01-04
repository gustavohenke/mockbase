import { EventEmitter } from "./";

describe("#emit()", () => {
  it("calls each of the event's listeners with specified args", () => {
    const foo1 = jest.fn();
    const foo2 = jest.fn();
    const bar = jest.fn();

    const emitter = new EventEmitter();
    emitter.on("foo", foo1);
    emitter.on("foo", foo2);
    emitter.on("bar", bar);

    emitter.emit("foo", [1, "bar", true]);
    expect(foo1).toHaveBeenCalledWith(1, "bar", true);
    expect(foo2).toHaveBeenCalledWith(1, "bar", true);
    expect(bar).not.toHaveBeenCalled();
  });

  it("doesn't fail if no listeners exist for a given event", () => {
    const emitter = new EventEmitter();
    const notABomb = () => emitter.emit("foo");

    expect(notABomb).not.toThrow();
  });
});

describe("#off()", () => {
  it("removes the given listener from an event's listener list", () => {
    const listener = jest.fn();

    const emitter = new EventEmitter();
    emitter.on("foo", listener);
    emitter.off("foo", listener);
    emitter.emit("foo");

    expect(listener).not.toHaveBeenCalled();
  });
});
