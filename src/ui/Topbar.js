import { el } from "../utils/dom.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { GAME_CONFIG } from "../config/gameConfig.js";

const SPEED_ORDER = ["paused", "normal", "fast", "veryFast"];

export class Topbar {
  constructor(rootEl, stateManager, eventBus, timeSystem, economySystem) {
    this._root = rootEl;
    this._state = stateManager;
    this._bus = eventBus;
    this._time = timeSystem;
    this._economy = economySystem;

    this._els = {};
    this._unsubs = [];
  }

  mount() {
    this._root.innerHTML = "";

    // Mobile sidebar toggle
    this._els.toggle = el("button", {
      class: "topbar__toggle",
      type: "button",
      attrs: { "aria-label": "Open navigation" },
      on: { click: () => this._bus.emit("topbar:toggleSidebar") }
    }, ["☰"]);
    this._root.appendChild(this._els.toggle);

    this._els.date = el("div", { class: "mono", attrs: { "aria-label": "Game date" } });
    this._els.company = el("div", { class: "text-muted" });
    this._els.cash = el("div", { class: "mono" });
    this._els.revenue = el("div", { class: "mono text-green" });
    this._els.expense = el("div", { class: "mono text-red" });
    this._els.reputation = el("div", { class: "mono text-cyan" });

    this._root.append(
      this._wrap("Date", this._els.date),
      this._wrap("Company", this._els.company),
      this._wrap("Cash", this._els.cash),
      this._wrap("Today +", this._els.revenue),
      this._wrap("Today −", this._els.expense),
      this._wrap("Rep", this._els.reputation)
    );

    // Speed controls
    this._els.speedGroup = el("div", { class: "row", attrs: { role: "group", "aria-label": "Simulation speed" } });
    for (const key of SPEED_ORDER) {
      const label = GAME_CONFIG.SPEEDS[key].label;
      const btn = el("button", {
        class: "btn btn--sm btn--ghost",
        type: "button",
        dataset: { speed: key },
        on: { click: () => this._time.setSpeed(key) }
      }, [label]);
      this._els.speedGroup.appendChild(btn);
    }
    this._root.appendChild(el("div", { class: "row", style: "margin-left:auto" }, [this._els.speedGroup]));

    // Subscriptions
    this._unsubs.push(this._state.subscribe("time", () => this.update()));
    this._unsubs.push(this._state.subscribe("company", () => this.update()));
    this._unsubs.push(this._state.subscribe("finance", () => this.update()));
    this._unsubs.push(this._bus.on("time:speedChanged", () => this._syncSpeedButtons()));

    this.update();
    this._syncSpeedButtons();
  }

  unmount() {
    for (const u of this._unsubs) u();
    this._unsubs = [];
  }

  update() {
    const date = this._time.getDate();
    const company = this._state.get("company");
    this._els.date.textContent = formatDate(date);
    this._els.company.textContent = company.name;
    this._els.cash.textContent = formatCurrency(company.cash);
    this._els.cash.style.color = company.cash <= 5000 ? "var(--color-amber)" : "var(--color-green)";
    this._els.revenue.textContent = formatCurrency(this._economy.getDailyRevenue());
    this._els.expense.textContent = formatCurrency(this._economy.getDailyExpense());
    this._els.reputation.textContent = Math.round(company.reputation);
  }

  _syncSpeedButtons() {
    const current = this._time.getSpeed();
    for (const btn of this._els.speedGroup.querySelectorAll("button")) {
      const isActive = btn.dataset.speed === current;
      btn.classList.toggle("btn--primary", isActive);
      btn.classList.toggle("btn--ghost", !isActive);
    }
  }

  _wrap(label, node) {
    return el("div", { class: "stack", style: "gap:0;min-width:fit-content" }, [
      el("div", { class: "text-dim", style: "font-size:10px;text-transform:uppercase;letter-spacing:1px", text: label }),
      node
    ]);
  }
}
