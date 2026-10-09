// TEMPORARY PATH PROBE — replace after diagnosis.
function show(html, color) {
  document.body.innerHTML =
    '<pre style="padding:16px;color:' + color +
    ';background:#0a0f1a;font-family:monospace;white-space:pre-wrap;font-size:12px;line-height:1.6;min-height:100vh;margin:0">' +
    html.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
    '</pre>';
}

async function probe(path) {
  try {
    const res = await fetch(path, { method: "GET" });
    return res.status + " " + (res.ok ? "OK" : "FAIL");
  } catch (e) {
    return "ERR (" + (e.message || "network") + ")";
  }
}

(async () => {
  const base = "https://jurkonxcode.github.io/os-tycoon/";
  const candidates = [
    "src/main.js",
    "src/core/Game.js",
    "src/core/EventBus.js",
    "src/core/StateManager.js",
    "src/core/GameLoop.js",
    "src/config/gameConfig.js",
    "src/config/balanceConfig.js",
    "src/systems/TimeSystem.js",
    "src/systems/CompanySystem.js",
    "src/systems/EconomySystem.js",
    "src/systems/SaveSystem.js",
    "src/ui/Router.js",
    "src/ui/Sidebar.js",
    "src/ui/Topbar.js",
    "src/ui/Dashboard.js",
    "src/utils/formatters.js",
    "src/utils/dom.js",
    "src/utils/id.js",
    "src/utils/validators.js",
    "src/utils/calculations.js",
    "css/variables.css",
    "css/layout.css",
    "index.html",
  ];
  let out = "PATH PROBE (base: " + base + ")\n\n";
  for (const p of candidates) {
    const status = await probe(base + p);
    out += status.padEnd(16) + "  " + p + "\n";
  }
  out += "\n\nSemua yang FAIL = file tidak ada di path itu.\n";
  out += "Kirim screenshot ini ke assistant.";
  show(out, "#22d3ee");
})();
