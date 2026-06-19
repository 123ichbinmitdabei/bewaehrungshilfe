// smoke_v339_logik.js — Paket B: Logik, Dead-Code, Konsistenz (v3.39).
// Statische Pruefungen direkt auf index.html:
//  - Handler-Integritaet: jeder onclick/onchange/... ruft eine existierende Funktion auf
//  - Dead-Code: die in v3.39 entfernten Funktionen sind weg
//  - keine console.log/console.debug-Reste
//  - keine TODO/FIXME/XXX-Marker
//  - State-Defaults vorhanden
"use strict";
const fs = require("fs");
const path = require("path");
const { loadApp } = require("./smoke_bootstrap");

var pass = 0, fail = 0, fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); console.log("  FAIL: " + msg); } }

var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var open = html.indexOf("<script>");
var close = html.lastIndexOf("</script>");
var js = html.slice(open + 8, close);

// ---- Funktionsdefinitionen einsammeln ----
var defs = {};
var m;
var reFn = /(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
while ((m = reFn.exec(js))) defs[m[1]] = true;
var reConst = /(?:^|\n)\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/g;
while ((m = reConst.exec(js))) defs[m[1]] = true;

// Erlaubte globale/builtin-Bezeichner, die in Handlern vorkommen duerfen
var allowed = new Set([
  "if", "for", "while", "switch", "return", "function", "catch", "typeof", "new", "await", "async", "void", "delete", "in", "of", "else", "do",
  "let", "const", "var", "try", "finally", "throw", "break", "continue", "case", "default", "yield", "instanceof",
  "parseInt", "parseFloat", "String", "Number", "Boolean", "Array", "Object", "JSON", "Math", "Date", "RegExp",
  "isNaN", "encodeURIComponent", "decodeURIComponent", "setTimeout", "setInterval", "clearTimeout",
  "alert", "confirm", "prompt", "console", "event", "this", "window", "document", "state",
]);

// ============================================================
// B1: Handler-Integritaet
// ============================================================
(function () {
  var handlerAttr = /\bon(?:click|change|input|submit|keydown|keyup|keypress|focus|blur|mouseover|mouseout|load|error)\s*=\s*"((?:[^"\\]|\\.)*)"/g;
  var orphanSet = {};
  var handlerCount = 0;
  var h;
  while ((h = handlerAttr.exec(html))) {
    var body = h[1];
    handlerCount++;
    // nur Aufrufe, deren Name NICHT von einem Punkt/Wort/$ vorangestellt ist (=> keine Methodenaufrufe)
    var callRe = /(^|[^\w.$])([A-Za-z_$][\w$]*)\s*\(/g;
    var c;
    while ((c = callRe.exec(body))) {
      var name = c[2];
      if (defs[name]) continue;
      if (allowed.has(name)) continue;
      orphanSet[name] = (orphanSet[name] || 0) + 1;
    }
  }
  ok(handlerCount > 100, "B1 mind. 100 Handler-Attribute gescannt (war " + handlerCount + ")");
  var orphans = Object.keys(orphanSet);
  if (orphans.length) console.log("    verwaiste Handler-Aufrufe: " + orphans.join(", "));
  ok(orphans.length === 0, "B1 keine verwaisten Handler (Funktion existiert nicht): " + orphans.join(", "));
  // gezielt: der in v3.39 reparierte Handler
  ok(html.indexOf("openSavedSignaturePad") === -1, "B1 kaputter Handler openSavedSignaturePad entfernt");
  ok(defs["openSavedSignatureEditor"] === true, "B1 Ziel-Funktion openSavedSignatureEditor existiert");
})();

// ============================================================
// B2: Dead-Code entfernt
// ============================================================
(function () {
  ["debouncedSaveInbox", "docxBlankCell", "isAndroidChrome", "isIosSafari",
   "sectionIfHasContent", "tdEmpty", "unDismissSetupChecklist", "inboxSaveTimer"].forEach(function (n) {
    ok(html.indexOf(n) === -1, "B2 toter Bezeichner entfernt: " + n);
  });
})();

// ============================================================
// B6: Keine Debug-Reste / Marker
// ============================================================
(function () {
  // Kommentare entfernen, damit auskommentierte Beispiele (z.B. der nicht
  // aktivierte Service-Worker-Block) nicht faelschlich als Debug-Rest zaehlen.
  var code = js
    .replace(/\/\*[\s\S]*?\*\//g, "")           // Blockkommentare
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");        // Zeilenkommentare (URLs mit :// schonen)
  ok(!/console\.log\s*\(/.test(code), "B6 kein console.log im Script");
  ok(!/console\.debug\s*\(/.test(code), "B6 kein console.debug im Script");
  ok(!/console\.info\s*\(/.test(code), "B6 kein console.info im Script");
  ok(!/\b(TODO|FIXME|XXX)\b/.test(code), "B6 keine TODO/FIXME/XXX-Marker");
  // F3-Regression: kein em-dash U+2014 im gesamten index.html
  ok(html.indexOf("—") === -1, "F3 kein em-dash U+2014 in index.html");
})();

// ============================================================
// B5: State-Defaults vorhanden (Konsistenz-Grundlage)
// ============================================================
(function () {
  var loaded = loadApp();
  var app = loaded.app;
  app.resetState();
  var st = app.getState();
  ["view", "shared", "theme", "settings", "docs", "notes", "inbox"].forEach(function (k) {
    ok(k in st, "B5 Default-State hat Schluessel: " + k);
  });
  // Alle 10 DOCS koennen ein Doc-Skelett haben
  ok(Object.keys(app.DOCS).length === 10, "B5 10 DOCS definiert");
})();

console.log("\n== ERGEBNIS smoke_v339_logik ==");
console.log("PASS: " + pass + "  FAIL: " + fail);
if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
console.log("Alle Logik-Asserts gruen.");
