import { el } from "../utils/dom.js";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent
} from "../utils/formatters.js";
import { computeRunwayDays, computeDailyBurn } from "../utils/calculations.js";

export class Dashboard {
  constructor(stateManager, eventBus, systems) {
    this._state = stateManager;
    this._bus = eventBus;
    this._time = systems.time;
    this._economy = systems.economy;
    this._company = systems.company;
    this._root = null;
    this._unsubs = [];
  }

  mount(container) {
    this._root = el("div", { class: "dashboard" });
    container.appendChild(this._root);

    this._unsubs.push(this._state.subscribe("company", () => this.update()));
    this._unsubs.push(this._state.subscribe("finance", () => this.update()));
    this._unsubs.push(this._state.subscribe("time", () => this.update()));
    this._unsubs.push(this._bus.on("router:navigated", ({ route }) => {
      if (route === "dashboard") this.update();
    }));

    this.update();
  }

  unmount() {
    for (const u of this._unsubs) u();
    this._unsubs = [];
    this._root = null;
  }

  update() {
    if (!this._root) return;
    const company = this._state.get("company");
    const finance = this._state.get("finance");
    const dailyBurn = computeDailyBurn(company.employees, company.assets);
    const runway = computeRunwayDays(company.cash, dailyBurn);
    const netProfit = finance.dailyRevenue - finance.dailyExpense;

    this._root.innerHTML = "";

    // Header
    this._root.appendChild(el("header", { class: "row row--between", style: "align-items:flex-end" }, [
      el("div", {}, [
        el("div", { class: "text-dim", style: "font-size:11px;letter-spacing:1.5px;text-transform:uppercase", text: "Company Overview" }),
        el("h1", { style: "font-size:var(--fs-2xl);font-weight:700;margin-top:2px", text: company.name })
      ]),
      el("div", { class: "row" }, [
        el("span", { class: "badge badge--cyan", text: `Level ${company.level}` }),
        el("span", { class: "badge badge--muted", text: `Founded ${company.foundedYear}` }),
        el("span", { class: "badge badge--muted", text: `Rep ${Math.round(company.reputation)}` })
      ])
    ]));

    // Stat grid
    const stats = el("div", { class: "dashboard__grid-stats" });
    stats.append(
      this._stat("Cash", formatCurrency(company.cash),
        company.cash <= 5000 ? "stat--warn" : "stat--positive",
        `Runway ≈ ${Number.isFinite(runway) ? runway : "∞"} days`),
      this._stat("Revenue (today)", formatCurrency(finance.dailyRevenue), "stat--positive", "From product sales"),
      this._stat("Expenses (today)", formatCurrency(finance.dailyExpense), "stat--negative", "Salaries, upkeep, R&D"),
      this._stat("Net Profit (today)", formatCurrency(netProfit),
        netProfit >= 0 ? "stat--positive" : "stat--negative", "Revenue − Expenses"),
      this._stat("Research Points", formatNumber(company.researchPoints, 1), "stat--accent", "Separate from cash"),
      this._stat("Daily Burn", formatCurrency(dailyBurn), "stat--negative", "Salaries + upkeep")
    );
    this._root.appendChild(stats);

    // Main grid
    const grid = el("div", { class: "dashboard__grid-main" });
    grid.append(
      this._panelFinance(),
      this._panelCompany()
    );
    this._root.appendChild(grid);

    // Bottom grid — 3 columns of status lists
    const bottom = el("div", { class: "grid", style: "grid-template-columns:repeat(auto-fit,minmax(260px,1fr))" });
    bottom.append(
      this._panelPipeline(),
      this._panelCompetitors(),
      this._panelNews()
    );
    this._root.appendChild(bottom);
  }

  _stat(label, value, modifier = "", hint = "") {
    const cls = `stat ${modifier}`.trim();
    return el("div", { class: cls }, [
      el("div", { class: "stat__label", text: label }),
      el("div", { class: "stat__value", text: value }),
      hint ? el("div", { class: "stat__hint", text: hint }) : null
    ]);
  }

  _panelFinance() {
    const history = this._economy.getHistory().slice(-30);
    const panel = el("section", { class: "panel" }, [
      el("div", { class: "panel__header" }, [
        el("div", {}, [
          el("div", { class: "panel__title", text: "Cash Flow (30 days)" }),
          el("div", { class: "panel__subtitle", text: "Daily closing cash balance" })
        ]),
        el("span", { class: "badge badge--muted", text: "Last 30 days" })
      ])
    ]);

    if (history.length === 0) {
      panel.appendChild(el("div", { class: "dashboard__empty", text: "No data yet. Let the simulation run for a few days." }));
    } else {
      const max = Math.max(...history.map(h => h.cash), 1);
      const min = Math.min(...history.map(h => h.cash), 0);
      const range = Math.max(max - min, 1);
      const bars = el("div", { class: "dashboard__timeline-bars", attrs: { role: "img", "aria-label": "Cash history" } });
      for (const h of history) {
        const ratio = (h.cash - min) / range;
        const height = Math.max(4, Math.round(ratio * 76));
        bars.appendChild(el("div", {
          class: "dashboard__bar",
          style: `height:${height}px`,
          attrs: { title: `${formatDate({ year: h.year, month: h.month, day: h.day })} — ${formatCurrency(h.cash)}` }
        }));
      }
      panel.appendChild(bars);
    }
    return panel;
  }

  _panelCompany() {
    const c = this._state.get("company");
    const list = el("div", { class: "dashboard__list" }, [
      this._listRow("Engineers", String(c.employees.engineers)),
      this._listRow("Researchers", String(c.employees.researchers)),
      this._listRow("Marketers", String(c.employees.marketers)),
      this._listRow("Lab Level", String(c.assets.labLevel)),
      this._listRow("Fab Level", String(c.assets.fabLevel)),
      this._listRow("Reputation", `${Math.round(c.reputation)} / 100`)
    ]);
    return el("section", { class: "panel" }, [
      el("div", { class: "panel__header" }, [
        el("div", {}, [
          el("div", { class: "panel__title", text: "Company Snapshot" }),
          el("div", { class: "panel__subtitle", text: "Workforce and infrastructure" })
        ])
      ]),
      list
    ]);
  }

  _panelPipeline() {
    return el("section", { class: "panel" }, [
      el("div", { class: "panel__header" }, [
        el("div", { class: "panel__title", text: "Active Development" }),
        el("span", { class: "badge badge--amber", text: "Phase 2" })
      ]),
      el("div", { class: "dashboard__empty", text: "CPU Design Lab unlocks in Phase 2." })
    ]);
  }

  _panelCompetitors() {
    return el("section", { class: "panel" }, [
      el("div", { class: "panel__header" }, [
        el("div", { class: "panel__title", text: "Market Watch" }),
        el("span", { class: "badge badge--amber", text: "Phase 5" })
      ]),
      el("div", { class: "dashboard__empty", text: "Competitor simulation will be added in Phase 5." })
    ]);
  }

  _panelNews() {
    return el("section", { class: "panel" }, [
      el("div", { class: "panel__header" }, [
        el("div", { class: "panel__title", text: "Industry News" }),
        el("span", { class: "badge badge--muted", text: "Phase 3" })
      ]),
      el("div", { class: "dashboard__empty", text: "Market events arrive in Phase 3." })
    ]);
  }

  _listRow(label, value) {
    return el("div", { class: "dashboard__list-item" }, [
      el("span", { class: "text-muted", text: label }),
      el("span", { class: "mono", text: value })
    ]);
  }
}
