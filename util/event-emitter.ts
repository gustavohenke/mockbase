export interface Listener {
  (...args: any[]): void;
}

export class EventEmitter {
  private listeners: { [event: string]: Listener[] } = {};

  public hasListeners(event: string) {
    return this.listeners[event] && this.listeners[event].length > 0;
  }

  public off(event: string, listener: Listener) {
    this.listeners[event] = (this.listeners[event] || []).filter((item) => item !== listener);
  }

  public on(event: string, listener: Listener) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(listener);
  }

  public emit(event: string, args: any[] = []) {
    (this.listeners[event] || []).forEach((listener) => {
      listener(...args);
    });
  }
}
