/**
 * Small unique-ID helper. Not cryptographically secure — sufficient for
 * save-file entity IDs.
 */

let counter = 0;

export function generateId(prefix = "id") {
  counter = (counter + 1) % 1_000_000;
  const time = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1_000_000).toString(36);
  const c = counter.toString(36);
  return `${prefix}_${time}${rand}${c}`;
}
