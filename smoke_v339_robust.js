// smoke_v339_robust.js — Paket D: Robustheit (v3.39).
// D1: Storage-Quota wirft -> Nutzer wird gewarnt, App scheitert nicht still.
// D2: Parse-Guard bekommt Schrott-JSON -> Fallback, kein Crash.
// D3: Validatoren (IBAN, Datum, Betrag) mit gueltig/ungueltig, nur Hinweis.
"use strict";
const { loadApp } = require("./smoke_bootstrap");

var pass = 0, fail = 0, fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); console.log("  FAIL: " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (erwartet '" + b + "', war '" + a + "')"); }

var loaded = loadApp();
var app = loaded.app;
var ctx = loaded.ctx;

async function main() {
  // ==========================================================
  // D1: Storage-Quota
  // ==========================================================
  (function () {
    // isQuotaError erkennt verschiedene Browser-Varianten
    ok(app.fns.isQuotaError({ name: "QuotaExceededError" }) === true, "D1 isQuotaError: QuotaExceededError");
    ok(app.fns.isQuotaError({ name: "NS_ERROR_DOM_QUOTA_REACHED" }) === true, "D1 isQuotaError: Firefox-Variante");
    ok(app.fns.isQuotaError({ code: 22 }) === true, "D1 isQuotaError: code 22");
    ok(app.fns.isQuotaError({ name: "TypeError" }) === false, "D1 isQuotaError: anderer Fehler nicht");
    ok(app.fns.isQuotaError(null) === false, "D1 isQuotaError: null nicht");
  })();

  // Storage.set bei Quota-Fehler: warnt den Nutzer (alert), scheitert nicht still
  var alertCount = 0;
  ctx.alert = function () { alertCount++; };
  var origSet = ctx.localStorage.setItem;
  ctx.localStorage.setItem = function () { var e = new Error("quota"); e.name = "QuotaExceededError"; throw e; };
  var threw = false;
  try { await app.Storage.set("bh_quota_probe", "wert"); } catch (e) { threw = true; }
  ctx.localStorage.setItem = origSet; // wiederherstellen
  ok(!threw, "D1 Storage.set wirft NICHT nach aussen bei Quota");
  ok(alertCount >= 1, "D1 Storage.set zeigt Nutzerhinweis bei Quota (alert)");

  // ==========================================================
  // D2: Parse-Guard (safeJsonParse)
  // ==========================================================
  (function () {
    var sentinel = { fallback: true };
    eq(app.fns.safeJsonParse('{"a":1}', null, "ok").a, 1, "D2 gueltiges JSON wird geparst");
    ok(app.fns.safeJsonParse("{kaputt", sentinel, "schrott") === sentinel, "D2 Schrott-JSON -> Fallback");
    ok(app.fns.safeJsonParse(null, sentinel, "null") === sentinel, "D2 null -> Fallback");
    ok(app.fns.safeJsonParse(undefined, sentinel, "undef") === sentinel, "D2 undefined -> Fallback");
    ok(Array.isArray(app.fns.safeJsonParse("[1,2,3]", null, "arr")), "D2 Array-JSON geparst");
    // Schrott darf nicht werfen
    var crashed = false;
    try { app.fns.safeJsonParse("}{][totaler müll", [], "x"); } catch (e) { crashed = true; }
    ok(!crashed, "D2 safeJsonParse wirft nie");
  })();

  // ==========================================================
  // D3: Validatoren (nur Hinweis, kein Blockieren)
  // ==========================================================
  (function () {
    // IBAN
    ok(app.fns.validateIban("").valid === true, "D3 IBAN leer ist gueltig (kein Zwang)");
    ok(app.fns.validateIban("DE89 3704 0044 0532 0130 00").valid === true, "D3 gueltige deutsche IBAN (mit Leerzeichen)");
    ok(app.fns.validateIban("DE89370400440532013000").valid === true, "D3 gueltige deutsche IBAN (kompakt)");
    ok(app.fns.validateIban("DE00370400440532013000").valid === false, "D3 falsche Pruefziffer ungueltig");
    ok(app.fns.validateIban("DE89 3704 0044").valid === false, "D3 zu kurze IBAN ungueltig");
    ok(app.fns.validateIban("XYZ123").valid === false, "D3 Unsinn ungueltig");
    ok(app.fns.validateIban("DE00370400440532013000").hint.length > 0, "D3 ungueltige IBAN liefert Hinweis-Text");

    // Datum
    ok(app.fns.validateGermanDate("").valid === true, "D3 Datum leer ist gueltig");
    ok(app.fns.validateGermanDate("15.06.2026").valid === true, "D3 gueltiges Datum");
    ok(app.fns.validateGermanDate("29.02.2024").valid === true, "D3 Schaltjahr 29.02.2024 gueltig");
    ok(app.fns.validateGermanDate("29.02.2023").valid === false, "D3 29.02.2023 (kein Schaltjahr) ungueltig");
    ok(app.fns.validateGermanDate("31.04.2026").valid === false, "D3 31.04 ungueltig");
    ok(app.fns.validateGermanDate("15.13.2026").valid === false, "D3 Monat 13 ungueltig");
    ok(app.fns.validateGermanDate("2026-06-15").valid === false, "D3 ISO-Format wird als TT.MM.JJJJ erwartet");
    ok(app.fns.validateGermanDate("1.1.1800").valid === false, "D3 Jahr 1800 unplausibel");

    // Betrag
    ok(app.fns.validateAmount("").valid === true, "D3 Betrag leer ist gueltig");
    ok(app.fns.validateAmount("1.250,00").valid === true, "D3 1.250,00 gueltig");
    ok(app.fns.validateAmount("200").valid === true, "D3 200 gueltig");
    ok(app.fns.validateAmount("50,5").valid === true, "D3 50,5 gueltig");
    ok(app.fns.validateAmount("200 €").valid === true, "D3 200 € gueltig");
    ok(app.fns.validateAmount("zwei euro").valid === false, "D3 Text ungueltig");
    ok(app.fns.validateAmount("12,345").valid === false, "D3 drei Nachkommastellen ungueltig");

    // Dispatcher
    eq(app.fns.validationHintForField("iban", "XYZ").length > 0, true, "D3 Dispatcher iban -> Hinweis");
    eq(app.fns.validationHintForField("datum", "31.04.2026").length > 0, true, "D3 Dispatcher datum -> Hinweis");
    eq(app.fns.validationHintForField("betrag", "abc").length > 0, true, "D3 Dispatcher betrag -> Hinweis");
    eq(app.fns.validationHintForField("name", "egal"), "", "D3 Dispatcher unbekanntes Feld -> kein Hinweis");
    eq(app.fns.validationHintForField("datum", "15.06.2026"), "", "D3 Dispatcher gueltiges Datum -> kein Hinweis");
  })();

  console.log("\n== ERGEBNIS smoke_v339_robust ==");
  console.log("PASS: " + pass + "  FAIL: " + fail);
  if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
  console.log("Alle Robustheits-Asserts gruen.");
}

main().catch(function (e) { console.error("smoke_v339_robust Laufzeitfehler:", e); process.exit(1); });
