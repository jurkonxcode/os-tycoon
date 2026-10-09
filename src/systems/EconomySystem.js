/**
 * The ONLY system allowed to change company.cash and researchPoints.
 */
import { BALANCE } from "../config/balanceConfig.js";

export class EconomySystem {
  constructor(stateManager, eventBus, timeSystem) {
    this._state = stateManager;
    this._bus = eventBus;
    this._time = timeSystem;
    this._subs = [];
    this._dailyRevenue = 0;
    this._dailyExpense = 0;
    this._lastHistoryDay = -1;
  }

  init() {
    this._subs.push(
      this._bus.on("economy:revenue", (p) => this._applyRevenue(p)),
      this._bus.on("economy:expense", (p) => this._applyExpense(p)),
      this._bus.on("time:dayPassed", () => this._onDay())
    );
  }

  destroy() {
    for (const u of this._subs) u();
    this._subs = [];
  }

  getCash() {
    return this._state.get("company").cash;
  }

  getRP() {
    return this._state.get("company").researchPoints;
  }

  canAfford(amount) {
    return this.getCash() >= amount;
  }

  trySpend(amount, category, reason) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("trySpend: amount must be a non-negative finite number.");
    }
    const company = this._state.get("company");
    if (company.cash < amount) {
      return { ok: false, reason: "Insufficient cash." };
    }
    this._bus.emit("economy:expense", { amount, category, reason });
    return { ok: true };
  }

  trySpendRP(amount, reason) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("trySpendRP: amount must be a non-negative finite number.");
    }
    const company = this._state.get("company");
    if (company.researchPoints < amount) {
      return { ok: false, reason: "Insufficient research points." };
    }
    company.researchPoints -= amount;
    this._bus.emit("research:pointsSpent", { amount, reason });
    this._bus.emit("state:changed", { key: "company" });
    return { ok: true };
  }

  addRP(amount, reason) {
    if (!Number.isFinite(amount) || amount < 0) return;
    const company = this._state.get("company");
    company.researchPoints += amount;
    this._bus.emit("research:pointsGained", { amount, reason });
    this._bus.emit("state:changed", { key: "company" });
  }

  _applyRevenue({ amount, category, reason }) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const company = this._state.get("company");
    company.cash += amount;
    this._dailyRevenue += amount;
    this._recordLedger({
      kind: "revenue",
      amount,
      category: category || "sales",
      reason: reason || "Revenue"
    });
    this._bus.emit("state:changed", { key: "company" });
  }

  _applyExpense({ amount, category, reason, breakdown }) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const company = this._state.get("company");
    company.cash -= amount;
    this._dailyExpense += amount;
    this._recordLedger({
      kind: "expense",
      amount,
      category: category || "operating",
      reason: reason || "Expense",
      breakdown: breakdown || null
    });
    this._bus.emit("state:changed", { key: "company" });

    if (company.cash < BALANCE.LOW_CASH_THRESHOLD &&
        company.cash >= BALANCE.BANKRUPTCY_THRESHOLD) {
      this._bus.emit("economy:lowCash", { cash: company.cash });
    }
    if (company.cash < BALANCE.BANKRUPTCY_THRESHOLD) {
      this._bus.emit("economy:bankrupt", { cash: company.cash });
    }
  }

  _recordLedger(entry) {
    const finance = this._state.get("finance");
    const date = this._time.getDate();
    finance.ledger.push({
      ...entry,
      date: { ...date },
      totalDays: this._time.getTotalDays()
    });
    if (finance.ledger.length > BALANCE.LEDGER_MAX_ENTRIES) {
      finance.ledger.splice(0, finance.ledger.length - BALANCE.LEDGER_MAX_ENTRIES);
    }
  }

  _onDay() {
    const finance = this._state.get("finance");
    const date = this._time.getDate();
    const totalDays = this._time.getTotalDays();

    if (totalDays === this._lastHistoryDay) return;
    this._lastHistoryDay = totalDays;

    finance.dailyRevenue = this._dailyRevenue;
    finance.dailyExpense = this._dailyExpense;
    finance.history.push({
      year: date.year,
      month: date.month,
      day: date.day,
      totalDays,
      revenue: this._dailyRevenue,
      expense: this._dailyExpense,
      cash: this._state.get("company").cash
    });
    if (finance.history.length > BALANCE.FINANCE_HISTORY_MAX_DAYS) {
      finance.history.splice(0, finance.history.length - BALANCE.FINANCE_HISTORY_MAX_DAYS);
    }
    this._dailyRevenue = 0;
    this._dailyExpense = 0;
  }

  getDailyRevenue() { return this._state.get("finance").dailyRevenue; }
  getDailyExpense() { return this._state.get("finance").dailyExpense; }
  getLedger() { return this._state.get("finance").ledger; }
  getHistory() { return this._state.get("finance").history; }
}
