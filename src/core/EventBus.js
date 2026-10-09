/**
 * Namespaced pub/sub. Systems communicate through this; they must not
 * import each other to trigger side effects.
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  on(eventName, handler) {
    if (typeof eventName !== "string" || typeof handler !== "function") {
      throw new TypeError("EventBus.on requires (string, function).");
    }
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    const set = this._listeners.get(eventName);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this._listeners.delete(eventName);
  }

  once(eventName, handler) {
    const wrapper = (payload) => {
      this.off(eventName, wrapper);
      handler(payload);
    };
    return this.on(eventName, wrapper);
  }

  emit(eventName, payload) {
    const set = this._listeners.get(eventName);
    if (!set) return;
    // Copy to allow handlers to unsubscribe during dispatch.
    for (const handler of Array.from(set)) {
      try {
        handler(payload);
      } catch (err) {
        // Never let one bad listener break the game loop.
        console.error(`[EventBus] handler error on "${eventName}":`, err);
      }
    }
  }

  clear() {
    this._listeners.clear();
  }
}
