// smoke_v341_reset.js — Paket J1: Reset-Button auf eigene App begrenzt (v3.41).
// resetAppCache darf NUR eigene Ressourcen anfassen: bh-cache-* Caches und
// Service Worker mit Scope /bewaehrungshilfe/. Fremde Pages-Projekte (gleiche
// Origin) bleiben unberuehrt. localStorage wird NIE angefasst.
"use strict";
const { loadApp } = require("./smoke_bootstrap");

var pass = 0, fail = 0, fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); console.log("  FAIL: " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (erwartet '" + b + "', war '" + a + "')"); }

async function main() {
  var loaded = loadApp();
  var app = loaded.app;
  var ctx = loaded.ctx;

  // ==========================================================
  // Praedikate
  // ==========================================================
  ok(app.fns.isOwnBhCache("bh-cache-v3.41") === true, "isOwnBhCache: bh-cache-v3.41 ist eigen");
  ok(app.fns.isOwnBhCache("bh-cache-dev") === true, "isOwnBhCache: bh-cache-dev ist eigen");
  ok(app.fns.isOwnBhCache("fremd-cache-x") === false, "isOwnBhCache: fremder Cache nicht eigen");
  ok(app.fns.isOwnBhCache("terp-sessions-v1") === false, "isOwnBhCache: terp-sessions nicht eigen");
  ok(app.fns.isOwnBhCache(null) === false, "isOwnBhCache: null nicht eigen");
  ok(app.fns.isOwnBhScope("https://123ichbinmitdabei.github.io/bewaehrungshilfe/") === true, "isOwnBhScope: eigener Scope");
  ok(app.fns.isOwnBhScope("https://123ichbinmitdabei.github.io/terp-sessions/") === false, "isOwnBhScope: fremder Scope nicht eigen");
  ok(app.fns.isOwnBhScope("") === false, "isOwnBhScope: leerer Scope nicht eigen");
  ok(app.fns.isOwnBhScope(undefined) === false, "isOwnBhScope: undefined nicht eigen");

  // ==========================================================
  // resetAppCache: nur eigene Caches + eigene SWs, localStorage unberuehrt
  // ==========================================================
  // Nutzerwert in localStorage, der NICHT angetastet werden darf
  ctx.localStorage.setItem("bh_shared_v1", JSON.stringify({ name: "Platzhalter" }));
  ctx.localStorage.setItem("bh_contacts_v1", JSON.stringify([{ id: "c1" }]));

  var unregisteredScopes = [];
  var deletedCaches = [];
  var reloaded = 0;
  ctx.navigator.serviceWorker = {
    getRegistrations: function () {
      return Promise.resolve([
        { scope: "https://123ichbinmitdabei.github.io/bewaehrungshilfe/", unregister: function () { unregisteredScopes.push("bh"); return Promise.resolve(true); } },
        { scope: "https://123ichbinmitdabei.github.io/terp-sessions/", unregister: function () { unregisteredScopes.push("terp"); return Promise.resolve(true); } },
        { scope: "", unregister: function () { unregisteredScopes.push("leer"); return Promise.resolve(true); } },
      ]);
    },
  };
  ctx.caches = {
    keys: function () { return Promise.resolve(["bh-cache-v3.41", "bh-cache-v3.40", "fremd-cache-x", "terp-sessions-v1"]); },
    delete: function (k) { deletedCaches.push(k); return Promise.resolve(true); },
  };
  ctx.window.location.reload = function () { reloaded++; };

  await app.fns.resetAppCache();

  // Caches: nur eigene geloescht
  ok(deletedCaches.indexOf("bh-cache-v3.41") >= 0, "resetAppCache loescht eigenen Cache bh-cache-v3.41");
  ok(deletedCaches.indexOf("bh-cache-v3.40") >= 0, "resetAppCache loescht eigenen Cache bh-cache-v3.40");
  ok(deletedCaches.indexOf("fremd-cache-x") === -1, "resetAppCache loescht FREMDEN Cache NICHT");
  ok(deletedCaches.indexOf("terp-sessions-v1") === -1, "resetAppCache loescht terp-sessions-Cache NICHT");
  eq(deletedCaches.length, 2, "resetAppCache loescht genau die 2 eigenen Caches");

  // Service Worker: nur eigener Scope deregistriert
  ok(unregisteredScopes.indexOf("bh") >= 0, "resetAppCache deregistriert eigenen SW (bewaehrungshilfe)");
  ok(unregisteredScopes.indexOf("terp") === -1, "resetAppCache deregistriert FREMDEN SW (terp-sessions) NICHT");
  ok(unregisteredScopes.indexOf("leer") === -1, "resetAppCache deregistriert SW mit leerem Scope NICHT (konservativ)");
  eq(unregisteredScopes.length, 1, "resetAppCache deregistriert genau 1 eigenen SW");

  // Reload erfolgt
  eq(reloaded, 1, "resetAppCache laedt die Seite neu");

  // HARTES INVARIANT: localStorage unberuehrt
  eq(ctx.localStorage.getItem("bh_shared_v1"), JSON.stringify({ name: "Platzhalter" }), "resetAppCache: bh_shared_v1 unberuehrt");
  eq(ctx.localStorage.getItem("bh_contacts_v1"), JSON.stringify([{ id: "c1" }]), "resetAppCache: bh_contacts_v1 unberuehrt");

  // ==========================================================
  // Defensiv: fehlende APIs -> kein Crash, trotzdem reload, localStorage da
  // ==========================================================
  var reloaded2 = 0;
  ctx.navigator.serviceWorker = undefined;
  ctx.caches = undefined;
  ctx.window.location.reload = function () { reloaded2++; };
  var threw = false;
  try { await app.fns.resetAppCache(); } catch (e) { threw = true; console.log("    threw: " + e.message); }
  ok(!threw, "resetAppCache ohne serviceWorker/caches: kein Crash");
  eq(reloaded2, 1, "resetAppCache laedt trotzdem neu, wenn APIs fehlen");
  eq(ctx.localStorage.getItem("bh_shared_v1"), JSON.stringify({ name: "Platzhalter" }), "resetAppCache (defensiv): localStorage unberuehrt");

  console.log("\n== ERGEBNIS smoke_v341_reset ==");
  console.log("PASS: " + pass + "  FAIL: " + fail);
  if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
  console.log("Alle Reset-Asserts (v3.41) gruen.");
}

main().catch(function (e) { console.error("smoke_v341_reset Laufzeitfehler:", e); process.exit(1); });
