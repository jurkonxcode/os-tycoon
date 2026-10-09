/**
 * Composition root. Creates the state, systems, and starts the loop.
 * This is the only place where systems are wired together.
 */
import { EventBus } from "./EventBus.js";
import { StateManager } from "./StateManager.js";
import { GameLoop } from "./GameLoop.js";

import { GAME_CONFIG } from "../config/gameConfig.js";
import { BALANCE } from "../config/balanceConfig.js";

import { TimeSystem } from "../systems/TimeSystem.js";
import { CompanySystem } from "../systems/CompanySystem.js";
import { EconomySystem } from "../systems/EconomySystem.js";
import { SaveSystem } from "../systems/SaveSystem.js";

import { generateId } from "../utils/id.js";

export function createInitialState() {
  const start = GAME_CONFIG.START_DATE;
  return {
    meta: {
      schemaVersion: GAME_CONFIG.SCHEMA_VERSION,
      saveId: generateId("save"),
      createdAt: new Date().toISOString(),
      lastSavedAt: null
    },
    time: {
      currentDate: { year: start.year, month: start.month, day: start.day },
      totalDaysElapsed: 0,
      speed: "normal"
    },
    company: {
      name: GAME_CONFIG.COMPANY_NAME_DEFAULT,
      foundedYear: start.year,
      reputation: BALANCE.STARTING_REPUTATION,
      level: 1,
      cash: BALANCE.STARTING_CASH,
      researchPoints: BALANCE.STARTING_RESEARCH_POINTS,
      employees: { ...BALANCE.STARTING_EMPLOYEES },
      assets: {
        labLevel: BALANCE.STARTING_LAB_LEVEL,
        fabLevel: BALANCE.STARTING_FAB_LEVEL
      }
    },
    finance: {
      ledger: [],
      dailyRevenue: 0,
      dailyExpense: 0,
      history: [] // [{ year, month, day, revenue, expense, cash }]
    },
    products: {},
    competitors: {},
    settings: {
      locale: GAME_CONFIG.LOCALE,
      theme: "dark"
    }
  };
}

export class Game {
  constructor() {
    this.bus = new EventBus();
    this.state = new StateManager(this.bus, createInitialState());

    // Systems — created after state exists.
    this.time = new TimeSystem(this.state, this.bus);
    this.company = new CompanySystem(this.state, this.bus, this.time);
    this.economy = new EconomySystem(this.state, this.bus, this.time);
    this.save = new SaveSystem(this.state, this.bus, {
      onRestore: () => this._onStateRestored()
    });

    // Wire cross-system dependencies (only via EventBus events).
    this.time.init();
    this.company.init();
    this.economy.init();

    this.loop = new GameLoop(this.bus, this.time);
  }

  start() {
    this.loop.start();
    this.bus.emit("game:started", { date: this.time.getDate() });
  }

  stop() {
    this.loop.stop();
  }

  /** Called after SaveSystem replaces the state. */
  _onStateRestored() {
    this.loop.resetAccumulator();
    this.bus.emit("game:restored", { date: this.time.getDate() });
  }

  /** Start a fresh game, wiping the current state. */
  newGame() {
    const fresh = createInitialState();
    this.state.replace(fresh);
    this.loop.resetAccumulator();
    this.bus.emit("game:new", { date: this.time.getDate() });
  }
}
