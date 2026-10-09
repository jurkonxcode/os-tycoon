import { BALANCE } from "../config/balanceConfig.js";

/**
 * Pure calculation helpers. No side effects, no state access.
 */

export function daysInMonth(year, month) {
  // month is 1-based.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function advanceDate(date, days = 1) {
  let { year, month, day } = date;
  let remaining = days;
  while (remaining > 0) {
    const dim = daysInMonth(year, month);
    if (day < dim) {
      day += 1;
    } else {
      day = 1;
      if (month === 12) { month = 1; year += 1; }
      else { month += 1; }
    }
    remaining -= 1;
  }
  return { year, month, day };
}

/** Compare two {year,month,day} objects. -1 if a<b, 0 if equal, 1 if a>b. */
export function compareDates(a, b) {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

export function computeDailySalaries(employees) {
  const s = BALANCE.SALARY_PER_DAY;
  return (
    (employees.engineers || 0) * s.engineer +
    (employees.researchers || 0) * s.researcher +
    (employees.marketers || 0) * s.marketer
  );
}

export function computeDailyUpkeep(assets) {
  return (
    BALANCE.DAILY_OVERHEAD +
    (assets.labLevel || 0) * BALANCE.LAB_UPKEEP_PER_LEVEL +
    (assets.fabLevel || 0) * BALANCE.FAB_UPKEEP_PER_LEVEL
  );
}

export function computeDailyBurn(employees, assets) {
  return computeDailySalaries(employees) + computeDailyUpkeep(assets);
}

export function computeRunwayDays(cash, dailyBurn) {
  if (dailyBurn <= 0) return Infinity;
  if (cash <= 0) return 0;
  return Math.floor(cash / dailyBurn);
}

export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
