/**
 * Salaries, reputation, and daily operating costs.
 */
import { BALANCE } from "../config/balanceConfig.js";
import {
  computeDailySalaries,
  computeDailyUpkeep
} from "../utils/calculations.js";

export class CompanySystem {
  constructor(stateManager, eventBus, timeSystem) {
    this._state = stateManager;
    this._bus = eventBus;
    this._time = timeSystem;
    this._unsub = null;
  }

  init() {
    this._unsub = this._bus.on("time:dayPassed", () => this._onDay());
  }

  destroy() {
    if (this._unsub) this._unsub();
  }

  getCompany() {
    return this._state.get("company");
  }

  getDailySalaries() {
    return computeDailySalaries(this.getCompany().employees);
  }

  getDailyUpkeep() {
    return computeDailyUpkeep(this.getCompany().assets);
  }

  _onDay() {
    const company = this.getCompany();
    const salaries = this.getDailySalaries();
    const upkeep = this.getDailyUpkeep();

    this._bus.emit("economy:expense", {
      amount: salaries + upkeep,
      category: "operating",
      reason: "Salaries & upkeep",
      breakdown: { salaries, upkeep }
    });

    if (company.cash > BALANCE.LOW_CASH_THRESHOLD) {
      company.reputation = Math.min(100, company.reputation + 0.01);
    }
  }
}
