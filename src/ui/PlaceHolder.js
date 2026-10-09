import { el } from "../utils/dom.js";

/**
 * Temporary view for modules scheduled in later phases.
 * Displays honest information — no fake buttons.
 */
export class PlaceholderView {
  constructor({ title, phase, description }) {
    this._title = title;
    this._phase = phase;
    this._description = description;
    this._root = null;
  }

  mount(container) {
    this._root = el("div", { class: "dashboard" }, [
      el("header", {}, [
        el("div", { class: "text-dim", style: "font-size:11px;letter-spacing:1.5px;text-transform:uppercase", text: "Scheduled Module" }),
        el("h1", { style: "font-size:var(--fs-2xl);font-weight:700;margin-top:2px", text: this._title })
      ]),
      el("section", { class: "panel" }, [
        el("div", { class: "panel__header" }, [
          el("div", { class: "panel__title", text: "Not yet available" }),
          el("span", { class: "badge badge--amber", text: this._phase })
        ]),
        el("div", { class: "text-muted", text: this._description }),
        el("div", { class: "dashboard__empty", text: "This module has no active features in Phase 1. Buttons are intentionally absent." })
      ])
    ]);
    container.appendChild(this._root);
  }

  update() { /* static */ }
  unmount() { this._root = null; }
}
