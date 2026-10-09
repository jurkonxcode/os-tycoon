/**
 * Runtime validators used before mutating state or reading saves.
 */

export function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function isValidGameDate(d) {
  return (
    isPlainObject(d) &&
    Number.isInteger(d.year) && d.year >= 1900 && d.year <= 2200 &&
    Number.isInteger(d.month) && d.month >= 1 && d.month <= 12 &&
    Number.isInteger(d.day) && d.day >= 1 && d.day <= 31
  );
}

export function isValidSpeedKey(k, validKeys) {
  return typeof k === "string" && validKeys.includes(k);
}

export function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

export function isNonNegativeNumber(n) {
  return isFiniteNumber(n) && n >= 0;
}

/**
 * Validate the top-level shape of a deserialized save file.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
export function validateSaveShape(data) {
  if (!isPlainObject(data)) return { ok: false, reason: "Save is not an object." };
  if (!isPlainObject(data.meta)) return { ok: false, reason: "Missing meta block." };
  if (!Number.isInteger(data.meta.schemaVersion)) {
    return { ok: false, reason: "Missing schemaVersion." };
  }
  if (!isPlainObject(data.time)) return { ok: false, reason: "Missing time block." };
  if (!isValidGameDate(data.time.currentDate)) {
    return { ok: false, reason: "Invalid currentDate." };
  }
  if (!isPlainObject(data.company)) return { ok: false, reason: "Missing company block." };
  if (!isFiniteNumber(data.company.cash)) {
    return { ok: false, reason: "Invalid company.cash." };
  }
  if (!isPlainObject(data.finance)) return { ok: false, reason: "Missing finance block." };
  if (!Array.isArray(data.finance.ledger)) {
    return { ok: false, reason: "finance.ledger must be an array." };
  }
  return { ok: true };
}
