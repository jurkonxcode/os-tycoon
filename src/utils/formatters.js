import { GAME_CONFIG } from "../config/gameConfig.js";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const FULL_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currencyFormatter = new Intl.NumberFormat(GAME_CONFIG.LOCALE, {
  style: "currency",
  currency: GAME_CONFIG.CURRENCY,
  maximumFractionDigits: 0
});

const currencyCompactFormatter = new Intl.NumberFormat(GAME_CONFIG.LOCALE, {
  style: "currency",
  currency: GAME_CONFIG.CURRENCY,
  notation: "compact",
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat(GAME_CONFIG.LOCALE, {
  maximumFractionDigits: 2
});

export function formatCurrency(value) {
  if (!Number.isFinite(value)) return "—";
  return currencyFormatter.format(Math.round(value));
}

export function formatCurrencyCompact(value) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < 10000) return currencyFormatter.format(Math.round(value));
  return currencyCompactFormatter.format(value);
}

export function formatSignedCurrency(value) {
  if (!Number.isFinite(value)) return "—";
  const s = currencyFormatter.format(Math.round(Math.abs(value)));
  if (value > 0) return `+${s}`;
  if (value < 0) return `-${s}`;
  return s;
}

export function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(GAME_CONFIG.LOCALE, {
    maximumFractionDigits: digits
  }).format(value);
}

export function formatPercent(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatDate(date, { full = false } = {}) {
  if (!date || typeof date.year !== "number") return "—";
  const monthName = full
    ? FULL_MONTH_NAMES[date.month - 1]
    : MONTH_NAMES[date.month - 1];
  const day = String(date.day).padStart(2, "0");
  return `${day} ${monthName} ${date.year}`;
}

export function formatDays(days) {
  if (!Number.isFinite(days)) return "—";
  return `${formatNumber(days, 0)} days`;
}
