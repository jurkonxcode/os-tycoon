/**
 * Single source of truth. Holds one plain, serializable object.
 * Emits events through the EventBus on update so UI can re-render.
 */
import { isPlainObject } from "../utils/validators.js";

export class StateManager {
  /**
   * @param {EventBus} eventBus
   * @param {object} initialState
   */
  constructor(eventBus, initialState) {
    if (!eventBus) throw new Error("StateManager requires an EventBus.");
    if (!isPlainObject(initialState)) {
      throw new Error("StateManager requires a plain object as initialState.");
    }
    this._bus = eventBus;
    this._state = initialState;
    /** @type {Set<{path: string, cb: Function}>} */
    this._subscribers = new Set();
  }

  getState() {
    return this._state;
  }

  /** Shallow read of a top-level key. */
  get(key) {
    return this._state[key];
  }

  /**
   * Direct mutation of a top-level key. Emits "state:changed".
   * Prefer using this from systems only.
   */
  set(key, value) {
    if (typeof key !== "string") throw new Error("StateManager.set: key must be a string.");
    this._state[key] = value;
    this._notify(key);
    this._bus.emit("state:changed", { key });
  }

  /**
   * Shallow-merge into an object key. Emits "state:changed".
   */
  patch(key, partial) {
    if (!isPlainObject(partial)) {
      throw new Error("StateManager.patch: partial must be a plain object.");
    }
    const current = this._state[key];
    if (!isPlainObject(current)) {
      throw new Error(`StateManager.patch: state["${key}"] is not an object.`);
    }
    Object.assign(current, partial);
    this._notify(key);
    this._bus.emit("state:changed", { key });
  }

  /**
   * Subscribe to changes for a specific top-level key, or "*" for all.
   * Returns an unsubscribe function.
   */
  subscribe(key, cb) {
    if (typeof cb !== "function") throw new TypeError("subscribe requires a function.");
    const sub = { path: key, cb };
    this._subscribers.add(sub);
    return () => this._subscribers.delete(sub);
  }

  _notify(key) {
    for (const sub of this._subscribers) {
      if (sub.path === key || sub.path === "*") {
        try {
          sub.cb(this._state[key], key);
        } catch (err) {
          console.error("[StateManager] subscriber error:", err);
        }
      }
    }
  }

  /** Deep clone via JSON. Only use on serializable state. */
  snapshot() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /**
   * Replace the entire state. Emits "state:reloaded".
   * Callers must have validated the incoming object beforehand.
   */
  replace(nextState) {
    if (!isPlainObject(nextState)) {
      throw new Error("StateManager.replace: state must be a plain object.");
    }
    this._state = nextState;
    this._bus.emit("state:reloaded", { state: this._state });
  }
}
