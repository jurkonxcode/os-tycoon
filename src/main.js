const root = document.getElementById("view-container") || document.body;

function show(text, color) {
  document.body.innerHTML =
    '<pre style="padding:16px;color:' + (color || "#22d3ee") +
    ';background:#0a0f1a;font-family:monospace;font-size:12px;' +
    'line-height:1.6;white-space:pre-wrap;min-height:100vh;margin:0">' +
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</pre>";
}

show("main.js loaded. Importing modules...\n");

const modules = [
  "./core/EventBus.js",
  "./core/StateManager.js",
  "./core/GameLoop.js",
  "./core/Game.js",
  "./config/gameConfig.js",
  "./config/balanceConfig.js",
  "./systems/TimeSystem.js",
  "./systems/CompanySystem.js",
  "./systems/EconomySystem.js",
  "./systems/SaveSystem.js",
  "./ui/Router.js",
  "./ui/Sidebar.js",
  "./ui/Topbar.js",
  "./ui/Dashboard.js",
  "./ui/CompanyView.js",
  "./ui/FinanceView.js",
  "./ui/SettingsView.js",
  "./ui/PlaceholderView.js",
  "./ui/NotificationSystem.js",
  "./utils/formatters.js",
  "./utils/calculations.js",
  "./utils/validators.js",
  "./utils/dom.js",
  "./utils/id.js"
];

(async () => {
  let report = "MODULE CHECK\n\n";
  let failed = [];
  for (const m of modules) {
    try {
      await import(m);
      report += "OK   " + m + "\n";
    } catch (e) {
      report += "FAIL " + m + "\n";
      failed.push({ path: m, error: e.message });
    }
  }
  if (failed.length === 0) {
    report += "\nAll modules OK. Loading game...\n";
    show(report, "#10b981");
    try {
      const { Game } = await import("./core/Game.js");
      const { Router } = await import("./ui/Router.js");
      const { Sidebar } = await import("./ui/Sidebar.js");
      const { Topbar } = await import("./ui/Topbar.js");
      const { Dashboard } = await import("./ui/Dashboard.js");
      const { CompanyView } = await import("./ui/CompanyView.js");
      const { FinanceView } = await import("./ui/FinanceView.js");
      const { SettingsView } = await import("./ui/SettingsView.js");
      const { PlaceholderView } = await import("./ui/PlaceholderView.js");
      const { NotificationSystem } = await import("./ui/NotificationSystem.js");
      const { BALANCE } = await import("./config/balanceConfig.js");
      const { formatCurrency } = await import("./utils/formatters.js");

      document.body.innerHTML =
        '<div id="app" class="app-shell">' +
        '<aside id="sidebar" class="sidebar"></aside>' +
        '<div class="main-area">' +
        '<header id="topbar" class="topbar"></header>' +
        '<main id="view-container" class="view-container"></main>' +
        '</div></div>' +
        '<div id="notifications" class="notification-stack"></div>';

      const game = new Game();
      const sidebarEl = document.getElementById("sidebar");
      const topbarEl = document.getElementById("topbar");
      const viewEl = document.getElementById("view-container");
      const notifEl = document.getElementById("notifications");

      const systems = {
        time: game.time,
        company: game.company,
        economy: game.economy,
        save: game.save
      };

      new NotificationSystem(notifEl, game.bus).mount();
      const router = new Router(viewEl, game.bus);
      new Sidebar(sidebarEl, router, game.bus).mount();
      new Topbar(topbarEl, game.state, game.bus, game.time, game.economy).mount();

      router.register("dashboard", () => new Dashboard(game.state, game.bus, systems));
      router.register("company",   () => new CompanyView(game.state, game.bus, systems));
      router.register("finance",   () => new FinanceView(game.state, game.bus, systems));
      router.register("settings",  () => new SettingsView(game.state, game.bus, systems));

      router.register("cpu-lab", () => new PlaceholderView({
        title: "CPU Lab", phase: "Phase 2",
        description: "CPU design tools arrive in Phase 2."
      }));
      router.register("research", () => new PlaceholderView({
        title: "Research", phase: "Phase 3",
        description: "Technology tree arrives in Phase 3."
      }));
      router.register("products", () => new PlaceholderView({
        title: "Product Development", phase: "Phase 4",
        description: "Product launch arrives in Phase 4."
      }));
      router.register("manufacturing", () => new PlaceholderView({
        title: "Manufacturing", phase: "Phase 4",
        description: "Fab management arrives in Phase 4."
      }));
      router.register("marketing", () => new PlaceholderView({
        title: "Marketing & Sales", phase: "Phase 4",
        description: "Campaigns arrive in Phase 4."
      }));
      router.register("competitors", () => new PlaceholderView({
        title: "Competitors", phase: "Phase 5",
        description: "Rival firms arrive in Phase 5."
      }));
      router.register("timeline", () => new PlaceholderView({
        title: "Technology Timeline", phase: "Phase 3",
        description: "Historical timeline arrives in Phase 3."
      }));

      router.start("dashboard");
      game.start();

      window.__OS_TYCOON__ = { game, router };
    } catch (e) {
      show("RUNTIME ERROR:\n\n" + e.message + "\n\n" + (e.stack || ""), "#ef4444");
    }
  } else {
    report += "\n\nFiles with FAIL are missing or broken.\n";
    report += "Send screenshot to assistant.\n\n";
    for (const f of failed) {
      report += f.path + "\n  → " + f.error + "\n\n";
    }
    show(report, "#ef4444");
  }
})();
