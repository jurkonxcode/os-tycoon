import { el } from "../utils/dom.js";

const DEFAULT_TIMEOUT = 4000;

export class NotificationSystem {
  constructor(rootEl, eventBus) {
    this._root = rootEl;
    this._bus = eventBus;
    this._unsub = null;
  }

  mount() {
    this._unsub = this._bus.on("notification:show", (payload) => this.show(payload));
  }

  unmount() {
    if (this._unsub) this._unsub();
  }

  show({ title = "Notice", body = "", type = "info", timeout = DEFAULT_TIMEOUT } = {}) {
    const node = el("div", { class: `notification notification--${type}`, attrs: { role: "status" } }, [
      el("div", { class: "notification__title", text: title }),
      body ? el("div", { class: "notification__body", text: body }) : null
    ]);
    this._root.appendChild(node);

    const remove = () => {
      node.classList.add("is-leaving");
      setTimeout(() => {
        if (node.parentNode === this._root) this._root.removeChild(node);
      }, 220);
    };
    setTimeout(remove, timeout);
    node.addEventListener("click", remove, { once: true });
  }
}
