// smoke_v340_sw.js — Paket H2/I1: Service-Worker-Logik + Reset-Button v3.40.
// Testet die reine, in Node lauffaehige Logik: Cache-Namen-Ableitung aus ?v=,
// activate-Cleanup-Auswahl, sowie resetAppCache gegen gemockte serviceWorker/caches
// (unregister + cache-delete aufgerufen, localStorage UNBERUEHRT).
"use strict";
const fs = require("fs");
const path = require("path");
const { loadApp } = require("./smoke_bootstrap");
const sw = require("./sw.js");

var pass = 0, fail = 0, fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); console.log("  FAIL: " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (erwartet '" + b + "', war '" + a + "')"); }

async function main() {
  // ==========================================================
  // sw.js: Cache-Namen-Ableitung aus ?v=
  // ==========================================================
  eq(sw.deriveCacheName("https://x/sw.js?v=v3.40"), "bh-cache-v3.40", "deriveCacheName liest ?v=v3.40");
  eq(sw.deriveCacheName("https://x/sw.js?v=v3.41&foo=1"), "bh-cache-v3.41", "deriveCacheName ignoriert weitere Params");
  eq(sw.deriveCacheName("https://x/sw.js"), "bh-cache-dev", "deriveCacheName ohne Param -> dev");
  eq(sw.deriveCacheName("https://x/sw.js?v="), "bh-cache-dev", "deriveCacheName leerer Param -> dev");
  eq(sw.deriveCacheName("kaputt"), "bh-cache-dev", "deriveCacheName ungueltige URL -> dev (kein Crash)");

  // ==========================================================
  // sw.js: activate-Cleanup-Auswahl
  // ==========================================================
  (function () {
    var all = ["bh-cache-v3.39", "bh-cache-v3.40", "bh-cache-dev", "some-other-cache"];
    var del = sw.selectCachesToDelete(all, "bh-cache-v3.40");
    ok(del.indexOf("bh-cache-v3.39") >= 0, "selectCachesToDelete: alter eigener Cache wird geloescht");
    ok(del.indexOf("bh-cache-dev") >= 0, "selectCachesToDelete: anderer eigener Cache wird geloescht");
    ok(del.indexOf("bh-cache-v3.40") === -1, "selectCachesToDelete: aktueller Cache bleibt");
    ok(del.indexOf("some-other-cache") === -1, "selectCachesToDelete: FREMDER Cache bleibt unberuehrt");
    eq(sw.selectCachesToDelete([], "bh-cache-v3.40").length, 0, "selectCachesToDelete: leere Liste -> nichts");
    eq(sw.selectCachesToDelete(null, "bh-cache-v3.40").length, 0, "selectCachesToDelete: null -> nichts (kein Crash)");
  })();

  // ==========================================================
  // resetAppCache gegen gemockte APIs
  // ==========================================================
  var loaded = loadApp();
  var app = loaded.app;
  var ctx = loaded.ctx;

  // localStorage mit einem Nutzerwert befuellen, der NICHT angetastet werden darf
  ctx.localStorage.setItem("bh_shared_v1", JSON.stringify({ name: "Platzhalter" }));

  var unregistered = 0;
  var deletedCaches = [];
  var reloaded = 0;
  ctx.navigator.serviceWorker = {
    getRegistrations: function () {
      return Promise.resolve([
        { unregister: function () { unregistered++; return Promise.resolve(true); } },
        { unregister: function () { unregistered++; return Promise.resolve(true); } },
      ]);
    },
  };
  ctx.caches = {
    keys: function () { return Promise.resolve(["bh-cache-v3.39", "bh-cache-v3.40"]); },
    delete: function (k) { deletedCaches.push(k); return Promise.resolve(true); },
  };
  ctx.window.location.reload = function () { reloaded++; };

  await app.fns.resetAppCache();

  eq(unregistered, 2, "resetAppCache deregistriert alle Service Worker");
  eq(deletedCaches.length, 2, "resetAppCache loescht alle Caches");
  ok(deletedCaches.indexOf("bh-cache-v3.39") >= 0 && deletedCaches.indexOf("bh-cache-v3.40") >= 0, "resetAppCache loescht die richtigen Cache-Namen");
  eq(reloaded, 1, "resetAppCache laedt die Seite neu");
  // HARTES INVARIANT: localStorage (Nutzerdaten) bleibt UNBERUEHRT
  eq(ctx.localStorage.getItem("bh_shared_v1"), JSON.stringify({ name: "Platzhalter" }), "resetAppCache fasst localStorage NICHT an");

  // Defensiv: ohne serviceWorker/caches kein Crash, trotzdem reload
  var reloaded2 = 0;
  ctx.navigator.serviceWorker = undefined;
  ctx.caches = undefined;
  ctx.window.location.reload = function () { reloaded2++; };
  var threw = false;
  try { await app.fns.resetAppCache(); } catch (e) { threw = true; console.log("    resetAppCache threw: " + e.message); }
  ok(!threw, "resetAppCache ohne serviceWorker/caches: kein Crash");
  eq(reloaded2, 1, "resetAppCache laedt trotzdem neu, wenn APIs fehlen");
  // localStorage immer noch da
  eq(ctx.localStorage.getItem("bh_shared_v1"), JSON.stringify({ name: "Platzhalter" }), "resetAppCache (defensiv) fasst localStorage NICHT an");

  // ==========================================================
  // Statisch: SW-Registrierung NICHT aktiv (nur im Block-Kommentar)
  // ==========================================================
  (function () {
    var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
    var open = html.indexOf("<script>");
    var js = html.slice(open + 8, html.lastIndexOf("</script>"));
    // Block- und Zeilenkommentare entfernen, dann nach aktiver Registrierung suchen
    var code = js.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
    ok(!/serviceWorker\s*\.\s*register\s*\(/.test(code), "H2 SW-Registrierung ist NICHT aktiv (nur auskommentiert)");
    // Aber der auskommentierte Block existiert und nutzt das ?v=-Muster
    ok(/serviceWorker\.register\("\.\/sw\.js\?v=" \+ APP_VERSION\)/.test(js), "H2 auskommentierter Block nutzt ?v=APP_VERSION-Muster");
    // Reset-Button ist live verdrahtet
    ok(/onclick="resetAppCache\(\)"/.test(html), "H2 Reset-Button ist in den Einstellungen verdrahtet");
    ok(/Deine Daten bleiben erhalten/.test(html), "H2 Reset-Button erklaert: Daten bleiben erhalten");
  })();

  console.log("\n== ERGEBNIS smoke_v340_sw ==");
  console.log("PASS: " + pass + "  FAIL: " + fail);
  if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
  console.log("Alle SW-Asserts (v3.40) gruen.");
}

main().catch(function (e) { console.error("smoke_v340_sw Laufzeitfehler:", e); process.exit(1); });
