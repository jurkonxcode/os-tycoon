/**
 * Infrastructure-level configuration. Do NOT put balancing numbers here —
 * they belong in balanceConfig.js.
 */
export const GAME_CONFIG = Object.freeze({
  SCHEMA_VERSION: 1,
  SAVE_KEY: "os_tycoon_save_v1",
  SETTINGS_KEY: "os_tycoon_settings_v1",

  START_DATE: Object.freeze({ year: 1995, month: 1, day: 1 }),
  COMPANY_NAME_DEFAULT: "Nova Microsystems",

  /** Simulation speeds. msPerDay = real milliseconds per simulated game day. */
  SPEEDS: Object.freeze({
    paused:   { msPerDay: Infinity, label: "Paused" },
    normal:   { msPerDay: 1500,     label: "Normal" },
    fast:     { msPerDay: 500,      label: "Fast" },
    veryFast: { msPerDay: 125,      label: "Very Fast" }
  }),

  /** Hard cap to prevent runaway loops on long frames. */
  MAX_DAYS_PER_FRAME: 7,

  LOCALE: "en-US",
  CURRENCY: "USD"
});
