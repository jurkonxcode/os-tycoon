import { el } from "../utils/dom.js";
import { GAME_CONFIG } from "../config/gameConfig.js";

export class SettingsView {
  constructor(stateManager, eventBus, systems) {
    this._state = stateManager;
    this._bus = eventBus;
    this._save = systems.save;
    this._root = null;
    this._unsubs = [];
  }

  mount(container) {
    this._root = el("div", { class: "dashboard" });
    container.appendChild(this._root);
    this._unsubs.push(this._state.subscribe("meta", () => this.update()));
    this.update();
  }

  unmount() {
    for (const u of this._unsubs) u();
    this._unsubs = [];
    this._root = null;
  }

  update() {
    if (!this._root) return;
    const meta = this._state.get("meta");

    this._root.innerHTML = "";
    this._root.appendChild(el("header", {}, [
      el("div", { class: "text-dim", style: "font-size:11px;letter-spacing:1.5px;text-transform:uppercase", text: "Settings" }),
      el("h1", { style: "font-size:var(--fs-2xl);font-weight:700;margin-top:2px", text: "Save & Load" })
    ]));

    // Save panel
    const savePanel = el("section", { class: "panel" }, [
      el("div", { class: "panel__header" }, [
        el("div", {}, [
          el("div", { class: "panel__title", text: "Persistence" }),
          el("div", { class: "panel__subtitle", text: `Schema v${meta.schemaVersion} · Save ID ${meta.saveId}` })
        ])
      ]),
      el("div", { class: "stack" }, [
        this._info("Last saved", meta.lastSavedAt ? new Date(meta.lastSavedAt).toLocaleString() : "Never"),
        el("div", { class: "row" }, [
          this._btn("Save Game", "primary", () => {
            const res = this._save.save();
            this._notify(res.ok ? "Saved." : `Save failed: ${res.reason}`, res.ok);
          }),
          this._btn("Load Game", "ghost", () => {
            const res = this._save.load();
            this._notify(res.ok ? "Game loaded." : `Load failed: ${res.reason}`, res.ok);
          }),
          this._btn("Reset Save", "danger", () => {
            if (!confirm("Delete the current save? This cannot be undone.")) return;
            const res = this._save.reset();
            if (res.ok) {
              this._bus.emit("game:newRequested");
              this._notify("Save deleted. New game started.", true);
            } else {
              this._notify(`Reset failed: ${res.reason}`, false);
            }
          })
        ])
      ])
    ]);
    this._root.appendChild(savePanel);

    // Info panel
    const infoPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel__title", text: "About" }),
      el("div", { class: "stack text-muted", style: "font-size:var(--fs-sm)" }, [
        el("div", { text: "OS Tycoon: Technology Empire" }),
        el("div", { text: `Starting cash: $${(50000).toLocaleString()}` }),
        el("div", { text: "Starting research points: 100" }),
        el("div", { text: "Start date: 1 January 1995" }),
        el("div", { text: `Max days per frame: ${GAME_CONFIG.MAX_DAYS_PER_FRAME}` })
      ])
    ]);
    this._root.appendChild(infoPanel);
  }

  _info(label, value) {
    return el("div", { class: "row row--between", style: "padding:6px 0;border-bottom:1px solid var(--color-border)" }, [
      el("span", { class: "text-muted", text: label }),
      el("span", { class: "mono", text: value })
    ]);
  }

  _btn(text, variant, onClick) {
    return el("button", {
      class: `btn ${variant === "primary" ? "btn--primary" : variant === "danger" ? "btn--danger" : "btn--ghost"}`,
      type: "button",
      text,
      on: { click: onClick }
    });
  }

  _notify(text, ok) {
    this._bus.emit("notification:show", {
      title: ok ? "Success" : "Error",
      body: text,
      type: ok ? "success" : "error"
    });
  }
}
