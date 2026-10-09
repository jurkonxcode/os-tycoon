/**
 * LocalStorage persistence with schema versioning and corruption handling.
 */
import { GAME_CONFIG } from "../config/gameConfig.js";
import { validateSaveShape } from "../utils/validators.js";

export class SaveSystem {
  constructor(stateManager, eventBus, { onRestore } = {}) {
    this._state = stateManager;
    this._bus = eventBus;
    this._onRestore = onRestore || (() => {});
  }

  hasSave() {
    try {
      return localStorage.getItem(GAME_CONFIG.SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  save() {
    const data = this._state.snapshot();
    data.meta.lastSavedAt = new Date().toISOString();
    data.meta.schemaVersion = GAME_CONFIG.SCHEMA_VERSION;
    try {
      localStorage.setItem(GAME_CONFIG.SAVE_KEY, JSON.stringify(data));
      // Also persist lastSavedAt back to live state for UI display.
      this._state.get("meta").lastSavedAt = data.meta.lastSavedAt;
      this._bus.emit("save:success", { at: data.meta.lastSavedAt });
      return { ok: true };
    } catch (err) {
      const reason = err && err.name === "QuotaExceededError"
        ? "Storage quota exceeded."
        : (err && err.message) || "Unknown save error.";
      this._bus.emit("save:error", { reason });
      return { ok: false, reason };
    }
  }

  load() {
    let raw;
    try {
      raw = localStorage.getItem(GAME_CONFIG.SAVE_KEY);
    } catch (err) {
      return { ok: false, reason: "Cannot access LocalStorage." };
    }
    if (!raw) return { ok: false, reason: "No save found." };

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, reason: "Save file is corrupted (not valid JSON)." };
    }

    const shape = validateSaveShape(parsed);
    if (!shape.ok) return { ok: false, reason: shape.reason };

    if (parsed.meta.schemaVersion !== GAME_CONFIG.SCHEMA_VERSION) {
      // No migrations yet. Refuse mismatched versions rather than corrupt.
      return {
        ok: false,
        reason: `Save schema version ${parsed.meta.schemaVersion} is not supported.`
      };
    }

    this._state.replace(parsed);
    this._onRestore();
    this._bus.emit("save:loaded", { saveId: parsed.meta.saveId });
    return { ok: true };
  }

  reset() {
    try {
      localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
      this._bus.emit("save:reset", {});
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: (err && err.message) || "Reset failed." };
    }
  }
}
