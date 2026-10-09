import { el } from "../utils/dom.js";
import { formatCurrency, formatNumber } from "../utils/formatters.js";
import { computeDailySalaries, computeDailyUpkeep } from "../utils/calculations.js";

export class CompanyView {
  constructor(stateManager, eventBus, systems) {
    this._state = stateManager;
    this._bus = eventBus;
    this._company = systems.company;
    this._root = null;
    this._unsubs = [];
  }

  mount(container) {
    this._root = el("div", { class: "dashboard" });
    container.appendChild(this._root);
    this._unsubs.push(this._state.subscribe("company", () => this.update()));
    this.update();
  }

  unmount() {
    for (const u of this._unsubs) u();
    this._unsubs = [];
    this._root = null;
  }

  update() {
    if (!this._root) return;
    const c = this._state.get("company");
    const salaries = computeDailySalaries(c.employees);
    const upkeep = computeDailyUpkeep(c.assets);

    this._root.innerHTML = "";

    this._root.appendChild(el("header", {}, [
      el("div", { class: "text-dim", style: "font-size:11px;letter-spacing:1.5px;text-transform:uppercase", text: "Company" }),
      el("h1", { style: "font-size:var(--fs-2xl);font-weight:700;margin-top:2px", text: c.name })
    ]));

    const stats = el("div", { class: "dashboard__grid-stats" });
    stats.append(
      this._stat("Cash", formatCurrency(c.cash)),
      this._stat("Research Points", formatNumber(c.researchPoints, 1)),
      this._stat("Reputation", `${Math.round(c.reputation)} / 100`),
      this._stat("Company Level", String(c.level)),
      this._stat("Daily Salaries", formatCurrency(salaries)),
      this._stat("Daily Upkeep", formatCurrency(upkeep))
    );
    this._root.appendChild(stats);

    const panel = el("section", { class: "panel" }, [
      el("div", { class: "panel__header" }, [
        el("div", { class: "panel__title", text: "Workforce" }),
        el("span", { class: "badge badge--muted", text: "Hiring opens in Phase 3" })
      ]),
      this._table([
        ["Role", "Count", "Salary / day", "Subtotal / day"],
        ["Engineer", String(c.employees.engineers), "$100", formatCurrency(c.employees.engineers * 100)],
        ["Researcher", String(c.employees.researchers), "$110", formatCurrency(c.employees.researchers * 110)],
        ["Marketer", String(c.employees.marketers), "$90", formatCurrency(c.employees.marketers * 90)]
      ])
    ]);
    this._root.appendChild(panel);
  }

  _stat(label, value) {
    return el("div", { class: "stat" }, [
      el("div", { class: "stat__label", text: label }),
      el("div", { class: "stat__value", text: value })
    ]);
  }

  _table(rows) {
    const table = el("table", { class: "table table--responsive" });
    const [header, ...body] = rows;
    const thead = el("thead");
    const htr = el("tr");
    for (const h of header) htr.appendChild(el("th", { text: h }));
    thead.appendChild(htr);
    table.appendChild(thead);
    const tbody = el("tbody");
    for (const row of body) {
      const tr = el("tr");
      for (let i = 0; i < row.length; i++) {
        tr.appendChild(el("td", { text: row[i], dataset: { label: header[i] } }));
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;
  }
}
