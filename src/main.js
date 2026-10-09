// TEMPORARY DIAGNOSTIC — replace after we find the error.
// This file shows any error DIRECTLY ON SCREEN so you can read it on your phone.

function showScreen(html, color) {
  document.body.innerHTML =
    '<pre style="padding:16px;color:' + color +
    ';background:#0a0f1a;font-family:monospace;white-space:pre-wrap;font-size:12px;line-height:1.5;min-height:100vh;margin:0">' +
    html.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
    '</pre>';
}

window.addEventListener("error", (e) => {
  showScreen(
    "RUNTIME ERROR:\n\n" +
    (e.message || "unknown") + "\n\n" +
    "File: " + (e.filename || "?") + "\n" +
    "Line: " + (e.lineno || "?") + "\n\n" +
    (e.error && e.error.stack ? e.error.stack : ""),
    "#ef4444"
  );
});

window.addEventListener("unhandledrejection", (e) => {
  showScreen(
    "PROMISE REJECTION:\n\n" +
    (e.reason && e.reason.message ? e.reason.message : String(e.reason)) + "\n\n" +
    (e.reason && e.reason.stack ? e.reason.stack : ""),
    "#ef4444"
  );
});

showScreen("main.js loaded.\nNow importing Game.js...", "#22d3ee");

(async () => {
  try {
    const { Game } = await import("./core/Game.js");
    showScreen(
      "✓ Game.js imported OK\n\n" +
      "If you see this message, ES Modules work.\n" +
      "Now replace src/main.js with the real version.\n\n" +
      "(The real main.js has the bug, not the imports.)",
      "#10b981"
    );
  } catch (err) {
    showScreen(
      "IMPORT ERROR:\n\n" +
      (err.message || String(err)) + "\n\n" +
      (err.stack || ""),
      "#ef4444"
    );
  }
})();
