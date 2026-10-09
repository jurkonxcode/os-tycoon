import { el } from "../utils/dom.js";
import { formatCurrency, formatDate, formatSignedCurrency } from "../utils/formatters.js";

export class FinanceView {
  constructor(stateManager, eventBus, systems) {
    this._state = stateManager;
    this._bus = eventBus;
    this._economy = systems.economy;
    this._root = null;
    this._unsubs = [];
    this._showAll = false;
  }

  mount(container) {
    this._root = el("div", { class: "dashboard" });
    container.appendChild(this._root);
    this._unsubs.push(this._state.subscribe("finance", () => this.update()));
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
    const finance = this._state.get("finance");
    const company = this._state.get("company");

    this._root.innerHTML = "";

    this._root.appendChild(el("header", {}, [
      el("div", { class: "text-dim", style: "font-size:11px;letter-spacing:1.5px;text-transform:uppercase", text: "Finance" }),
      el("h1", { style: "font-size:var(--fs-2xl);font-weight:700;margin-top:2px", text: "Ledger & Cash Position" })
    ]));

    const stats = el("div", { class: "dashboard__grid-stats" });
    stats.append(
      this._stat("Cash", formatCurrency(company.cash)),
      this._stat("Revenue today", formatCurrency(finance.dailyRevenue), "stat--positive"),
      this._stat("Expense today", formatCurrency(finance.dailyExpense), "stat--negative"),
      this._stat("Net today", formatCurrency(finance.dailyRevenue - finance.dailyExpense),
        finance.dailyRevenue - finance.dailyExpense >= 0 ? "stat--positive" : "stat--negative"),
      this._stat("Ledger entries", String(finance.ledger.length))
    );
    this._root.appendChild(stats);

    const panel = el("section", { class: "panel" });
    panel.appendChild(el("div", { class: "panel__header" }, [
      el("div", {}, [
        el("div", { class: "panel__title", text: "Transaction Ledger" }),
        el("div", { class: "panel__subtitle", text: "Every cash movement is recorded here." })
      ]),
      this._toggleButton()
    ]));

    const entries = this._showAll
      ? finance.ledger.slice().reverse()
      : finance.ledger.slice(-25).reverse();

    if (entries.length === 0) {
      panel.appendChild(el("div", { class: "dashboard__empty", text: "No transactions yet. Run the simulation for at least one day." }));
    } else {
      const table = el("table", { class: "table table--responsive" });
      table.appendChild(el("thead", {}, [
        el("tr", {}, [
          el("th", { text: "Date" }),
          el("th", { text: "Type" }),
          el("th", { text: "Category" }),
          el("th", { text: "Reason" }),
          el("th", { text: "Amount", style: "text-align:right" })
        ])
      ]));
      const tbody = el("tbody");
      for (const e of entries) {
        const sign = e.kind === "revenue" ? "+" : "-";
        tbody.appendChild(el("tr", {}, [
          el("td", { text: formatDate(e.date), dataset: { label: "Date" } }),
          el("td", { text: e.kind, dataset: { label: "Type" } }),
          el("td", { text: e.category, dataset: { label: "Category" } }),
          el("td", { text: e.reason, dataset: { label: "Reason" } }),
          el("td", {
            text: sign + formatCurrency(e.amount).replace("$", "$"),
            class: e.kind === "revenue" ? "text-green" : "text-red",
            style: "text-align:right",
            dataset: { label: "Amount" }
          })
        ]));
      }
      table.appendChild(tbody);
      panel.appendChild(table);
    }

    this._root.appendChild(panel);
  }

  _toggleButton() {
    return el("button", {
      class: "btn btn--sm btn--ghost",
      type: "button",
      text: this._showAll ? "Show last 25" : "Show all",
      on: { click: () => { this._showAll = !this._showAll; this.update(); } }
    });
  }

  _stat(label, value, modifier = "") {
    return el("div", { class: `stat ${modifier}`.trim() }, [
      el("div", { class: "stat__label", text: label }),
      el("div", { class: "stat__value", text: value })
    ]);
  }
}
