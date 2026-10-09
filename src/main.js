import { Game } from "./core/Game.js";

import { Router } from "./ui/Router.js";
import { Sidebar } from "./ui/Sidebar.js";
import { Topbar } from "./ui/Topbar.js";
import { Dashboard } from "./ui/Dashboard.js";
import { CompanyView } from "./ui/CompanyView.js";
import { FinanceView } from "./ui/FinanceView.js";
import { SettingsView } from "./ui/SettingsView.js";
import { PlaceholderView } from "./ui/PlaceholderView.js";
import { NotificationSystem } from "./ui/NotificationSystem.js";

import { BALANCE } from "./config/balanceConfig.js";
import { formatCurrency } from "./utils/formatters.js";

function boot() {
  const game = new Game();

  const sidebarEl = document.getElementById("sidebar");
  const topbarEl = document.getElementById("topbar");
  const viewEl = document.getElementById("view-container");
  const notifEl = document.getElementById("notifications");

  if (!sidebarEl || !topbarEl || !viewEl || !notifEl) {
    console.error("Required DOM nodes missing. Check index.html.");
    return;
  }

  const systems = {
    time: game.time,
    company: game.company,
    economy: game.economy,
    save: game.save
  };

  const notifications = new NotificationSystem(notifEl, game.bus);
  notifications.mount();

  const router = new Router(viewEl, game.bus);

  const sidebar = new Sidebar(sidebarEl, router, game.bus);
  sidebar.mount();

  const topbar = new Topbar(topbarEl, game.state, game.bus, game.time, game.economy);
  topbar.mount();

  router.register("dashboard", () => new Dashboard(game.state, game.bus, systems));
  router.register("company",   () => new CompanyView(game.state, game.bus, systems));
  router.register("finance",   () => new FinanceView(game.state, game.bus, systems));
  router.register("settings",  () => new SettingsView(game.state, game.bus, systems));

  router.register("cpu-lab", () => new PlaceholderView({
    title: "CPU Lab", phase: "Phase 2",
    description: "Design CPU architectures, choose process nodes, tune clock speeds and cache, and run benchmarks before launching a product."
  }));
  router.register("research", () => new PlaceholderView({
    title: "Research", phase: "Phase 3",
    description: "Unlock technologies across CPU architecture, manufacturing, OS, graphics, networking, cloud, and AI."
  }));
  router.register("products", () => new PlaceholderView({
    title: "Product Development", phase: "Phase 4",
    description: "Turn validated CPU designs into launched products with pricing, inventory, and lifecycle management."
  }));
  router.register("manufacturing", () => new PlaceholderView({
    title: "Manufacturing", phase: "Phase 4",
    description: "Manage fabs, tooling, yields, and production runs for your product lineup."
  }));
  router.register("marketing", () => new PlaceholderView({
    title: "Marketing & Sales", phase: "Phase 4",
    description: "Run campaigns, manage distribution channels, and respond to market demand."
  }));
  router.register("competitors", () => new PlaceholderView({
    title: "Competitors", phase: "Phase 5",
    description: "Track rival firms: their R&D, product launches, pricing, and market share."
  }));
  router.register("timeline", () => new PlaceholderView({
    title: "Technology Timeline", phase: "Phase 3",
    description: "A historical timeline of the tech industry from 1995 onward, with your own alternate-history branches."
  }));

  const backdrop = document.createElement("div");
  backdrop.className = "sidebar-backdrop";
  document.body.appendChild(backdrop);

  const closeSidebar = () => {
    sidebarEl.classList.remove("is-open");
    backdrop.classList.remove("is-open");
  };
  const openSidebar = () => {
    sidebarEl.classList.add("is-open");
    backdrop.classList.add("is-open");
  };

  game.bus.on("topbar:toggleSidebar", () => {
    if (sidebarEl.classList.contains("is-open")) closeSidebar();
    else openSidebar();
  });
  game.bus.on("sidebar:closeMobile", closeSidebar);
  backdrop.addEventListener("click", closeSidebar);

  let lowCashWarned = false;
  game.bus.on("economy:lowCash", ({ cash }) => {
    if (lowCashWarned) return;
    lowCashWarned = true;
    game.bus.emit("notification:show", {
      title: "Low cash reserve",
      body: `Cash is now ${formatCurrency(cash)}.`,
      type: "warning", timeout: 6000
    });
  });
  game.bus.on("economy:bankrupt", () => {
    game.bus.emit("notification:show", {
      title: "Bankruptcy",
      body: "Your company has run out of cash.",
      type: "error", timeout: 0
    });
  });
  game.bus.on("state:changed", ({ key }) => {
    if (key !== "company") return;
    if (game.state.get("company").cash > BALANCE.LOW_CASH_THRESHOLD) lowCashWarned = false;
  });

  game.bus.on("game:newRequested", () => {
    game.newGame();
    lowCashWarned = false;
  });

  router.start("dashboard");
  game.start();

  let lastSaveDay = 0;
  game.bus.on("time:dayPassed", ({ totalDays }) => {
    if (totalDays - lastSaveDay >= 30) {
      lastSaveDay = totalDays;
      const res = game.save.save();
      if (res.ok) {
        game.bus.emit("notification:show", {
          title: "Auto-saved",
          body: `Day ${totalDays} saved.`,
          type: "info", timeout: 2500
        });
      }
    }
  });

  if (game.save.hasSave()) {
    game.bus.emit("notification:show", {
      title: "Save detected",
      body: "Open Settings to load, or keep playing a new game.",
      type: "info", timeout: 6000
    });
  }

  window.__OS_TYCOON__ = { game, router };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
