/**
 * Hash-based router. Each route maps to a view factory.
 * Views must implement mount(), update(), unmount().
 */
export class Router {
  constructor(container, eventBus) {
    this._container = container;
    this._bus = eventBus;
    this._routes = new Map();
    this._current = null;
    this._currentName = null;
    this._onHashChange = this._onHashChange.bind(this);
  }

  register(name, factory) {
    this._routes.set(name, factory);
  }

  start(defaultRoute = "dashboard") {
    window.addEventListener("hashchange", this._onHashChange);
    if (!window.location.hash) {
      window.location.hash = `#/${defaultRoute}`;
    } else {
      this._navigate(this._readHash());
    }
  }

  navigate(name) {
    window.location.hash = `#/${name}`;
  }

  getCurrent() { return this._currentName; }

  _readHash() {
    const raw = window.location.hash.replace(/^#\/?/, "");
    return raw || "dashboard";
  }

  _onHashChange() {
    this._navigate(this._readHash());
  }

  _navigate(name) {
    if (!this._routes.has(name)) name = "dashboard";
    if (this._currentName === name && this._current) return;

    if (this._current && typeof this._current.unmount === "function") {
      this._current.unmount();
    }
    this._container.innerHTML = "";

    const factory = this._routes.get(name);
    const view = factory();
    this._current = view;
    this._currentName = name;

    if (typeof view.mount === "function") {
      view.mount(this._container);
    }
    if (typeof view.update === "function") {
      view.update();
    }
    this._bus.emit("router:navigated", { route: name });
  }

  destroy() {
    window.removeEventListener("hashchange", this._onHashChange);
  }
}
