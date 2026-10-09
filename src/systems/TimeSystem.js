/**
 * Owns the game calendar. Single source of time for every other system.
 * Only emits "time:dayPassed" once per simulated day.
 */
import { GAME_CONFIG } from "../config/gameConfig.js";
import { advanceDate } from "../utils/calculations.js";

const VALID_SPEEDS = Object.keys(GAME_CONFIG.SPEEDS);

export class TimeSystem {
  constructor(stateManager, eventBus) {
    this._state = stateManager;
    this._bus = eventBus;
  }

  init() {
    const speed = this._state.get("time").speed;
    if (!VALID_SPEEDS.includes(speed)) {
      this._state.get("time").speed = "normal";
    }
  }

  getDate() {
    return this._state.get("time").currentDate;
  }

  getTotalDays() {
    return this._state.get("time").totalDaysElapsed;
  }

  getSpeed() {
    return this._state.get("time").speed;
  }

  setSpeed(key) {
    if (!VALID_SPEEDS.includes(key)) {
      throw new Error(`Invalid speed key: ${key}`);
    }
    const time = this._state.get("time");
    if (time.speed === key) return;
    time.speed = key;
    this._state.set("time", time);
    this._bus.emit("time:speedChanged", { speed: key });
  }

  pause() { this.setSpeed("paused"); }
  resume() {
    const current = this.getSpeed();
    this.setSpeed(current === "paused" ? "normal" : current);
  }
  isPaused() { return this.getSpeed() === "paused"; }

  advanceOneDay() {
    const time = this._state.get("time");
    const nextDate = advanceDate(time.currentDate, 1);
    time.currentDate = nextDate;
    time.totalDaysElapsed += 1;

    this._bus.emit("time:dayPassed", {
      date: nextDate,
      totalDays: time.totalDaysElapsed
    });
  }
}
