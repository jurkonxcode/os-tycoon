/**
 * All balancing values for OS Tycoon live here.
 *
 * Design intent:
 * - Starting burn rate ≈ $490/day → about 100 days of runway at $50,000.
 * - The first CPU project (Phase 2) is expected to cost roughly
 *   $20,000–$25,000 total, leaving meaningful reserves.
 * - Research Points (RP) are entirely separate from cash.
 * - No system may generate cash or RP outside of the designated paths
 *   (salaries burn cash; researchers generate RP per day; nothing else).
 */
export const BALANCE = Object.freeze({
  /* ---------- Starting resources ---------- */
  STARTING_CASH: 50000,
  STARTING_RESEARCH_POINTS: 100,
  STARTING_REPUTATION: 10,
  STARTING_LAB_LEVEL: 1,
  STARTING_FAB_LEVEL: 0,
  STARTING_EMPLOYEES: Object.freeze({
    engineers: 2,
    researchers: 1,
    marketers: 0
  }),

  /* ---------- Daily salaries (per employee, per game day) ---------- */
  SALARY_PER_DAY: Object.freeze({
    engineer: 100,
    researcher: 110,
    marketer: 90
  }),

  /* ---------- Fixed daily operating costs ---------- */
  DAILY_OVERHEAD: 120,
  LAB_UPKEEP_PER_LEVEL: 60,
  FAB_UPKEEP_PER_LEVEL: 200,

  /* ---------- Research (Phase 3 hook, defined now) ---------- */
  RP_PER_RESEARCHER_PER_DAY: 0.5,
  MAX_RESEARCHERS: 20,
  MAX_ENGINEERS: 20,
  MAX_MARKETERS: 20,

  /* ---------- Hiring ---------- */
  HIRING_COST: Object.freeze({
    engineer: 2000,
    researcher: 2200,
    marketer: 1500
  }),

  /* ---------- CPU development cost model (used in Phase 2) ---------- */
  CPU_DEV_BASE_DAYS: 90,
  CPU_DEV_DAYS_PER_EXTRA_COMPLEXITY: 0.5,
  CPU_DEV_SETUP_COST: 5000,

  /* ---------- Warning thresholds ---------- */
  LOW_CASH_THRESHOLD: 5000,
  BANKRUPTCY_THRESHOLD: 0,

  /* ---------- Ledger retention ---------- */
  LEDGER_MAX_ENTRIES: 2000,
  FINANCE_HISTORY_MAX_DAYS: 730
});
