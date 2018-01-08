export function flushPromises() {
  return new Promise(setImmediate);
}
