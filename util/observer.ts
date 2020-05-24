export type Observer<T> = {
  next(arg: T): void;
  error?(error: Error): void;
  complete?(): void;
};
