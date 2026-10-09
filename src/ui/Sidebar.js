import { el, svgIcon } from "../utils/dom.js";

const ICONS = {
  dashboard: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10",
  company:   "M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01",
  "cpu-lab": "M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M5 5h14v14H5zM9 9h6v6H9z",
  research:  "M9 3h6v3l-1 2v3l4 8a2 2 0 01-1.8 3H7.8A2 2 0 016 19l4-8V8L9 6V3zM7 15h10",
  products:  "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  manufacturing: "M3 21V9l6 4V9l6 4V9l6 4v8H3zM7 17h.01M12 17h.01M17 17h.01",
  marketing: "M3 11l18-8v18l-18-8v-2zM7 13v6a2 2 0 002 2h1",
  finance:   "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  competitors: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  timeline:  "M12 8v4l3 3M12 3a9 9 0 100 18 9 9 0 000-18z",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
};

export const SIDEBAR_ITEMS = [
  { name: "dashboard",     label: "Dashboard" },
  { name: "company",       label: "Company" },
  { name: "cpu-lab",       label: "CPU Lab" },
  { name: "research",      label: "Research" },
  { name: "products",      label: "Product Development" },
  { name: "manufacturing", label: "Manufacturing" },
  { name: "marketing",     label: "Marketing & Sales" },
  { name: "finance",       label: "Finance" },
  { name: "competitors",   label: "Competitors" },
  { name: "timeline",      label: "Technology Timeline" },
  { name: "settings",      label: "Settings" }
];

export class Sidebar {
  constructor(rootEl, router, eventBus) {
    this._root = rootEl;
    this._router = router;
    this._bus = eventBus;
    this._items = new Map();
  }

  mount() {
    this._root.innerHTML = "";

    this._root.appendChild(el("div", { class: "sidebar__brand" }, [
      el("div", { class: "sidebar__brand-title", text: "OS TYCOON" }),
      el("div", { class: "sidebar__brand-subtitle", text: "Technology Empire" })
    ]));

    const nav = el("nav", { class: "sidebar__nav" });
    for (const item of SIDEBAR_ITEMS) {
      const btn = el("button", {
        class: "sidebar__item",
        type: "button",
        dataset: { route: item.name },
        on: { click: () => this._onItemClick(item.name) }
      }, [
        svgIcon(ICONS[item.name] || ICONS.dashboard, { size: 18 }),
        el("span", { class: "sidebar__item-label", text: item.label })
      ]);
      btn.querySelector("svg").classList.add("sidebar__item-icon");
      nav.appendChild(btn);
      this._items.set(item.name, btn);
    }
    this._root.appendChild(nav);

    this._root.appendChild(el("div", { class: "sidebar__footer" }, [
      el("div", { text: "Phase 1 — Core Foundation" })
    ]));

    this._bus.on("router:navigated", ({ route }) => this.setActive(route));
    this.setActive(this._router.getCurrent() || "dashboard");
  }

  setActive(name) {
    for (const [key, btn] of this._items) {
      btn.classList.toggle("is-active", key === name);
    }
  }

  _onItemClick(name) {
    this._router.navigate(name);
    this._bus.emit("sidebar:itemClicked", { route: name });
    this._bus.emit("sidebar:closeMobile");
  }
}
