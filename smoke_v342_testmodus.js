// smoke_v342_testmodus.js - Paket L/M: eingebauter Test-Modus (v3.42).
// Prueft die in Node testbaren Garantien des Test-Modus:
//   1. TEST_CASES wohlgeformt und vollstaendig (mind. 60, eindeutige ids).
//   2. HARTE REGEL: Ergebnis-Speicherung schreibt NUR bh_test_-Keys, App-Daten
//      bleiben unberuehrt.
//   3. Export-Builder: gueltiges JSON und nicht-leerer HTML-Bericht.
//   4. Bild-Downscale (reine Groessenfunktion) verkleinert zu grosse Eingabe.
//   5. testdaten.json: gueltiges JSON, Backup-Format, nur synthetische Daten.
//   6. Touch-Target-Mini-Check (Paket D): .btn hat min-height.
//   7. Keine em-dashes (U+2014) in den neuen Deliverables.
"use strict";
const fs = require("fs");
const path = require("path");
const { loadApp } = require("./smoke_bootstrap");

var pass = 0, fail = 0, fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); console.log("  FAIL: " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (erwartet '" + b + "', war '" + a + "')"); }

function main() {
  var loaded = loadApp();
  var app = loaded.app;
  var ctx = loaded.ctx;

  if (ctx.__APP_TM_ERR) { console.error("Testmodus-Export-Fehler:\n" + ctx.__APP_TM_ERR); process.exit(1); }
  ok(!!app.testmodus, "Testmodus-Namespace ist exportiert");
  var TM = app.testmodus;

  // ==========================================================
  // 1. TEST_CASES wohlgeformt
  // ==========================================================
  var cases = TM.TEST_CASES;
  ok(Array.isArray(cases), "TEST_CASES ist ein Array");
  ok(cases.length >= 60, "TEST_CASES enthaelt mind. 60 Faelle (war " + cases.length + ")");
  var ids = {};
  var allWellFormed = true, allUniqueIds = true;
  cases.forEach(function (c) {
    if (!c || typeof c.id !== "string" || !c.id) allWellFormed = false;
    if (typeof c.bereich !== "string" || !c.bereich) allWellFormed = false;
    if (typeof c.titel !== "string" || !c.titel) allWellFormed = false;
    if (!Array.isArray(c.schritte) || c.schritte.length === 0) allWellFormed = false;
    if (typeof c.erwartung !== "string" || !c.erwartung) allWellFormed = false;
    if (c && c.id) { if (ids[c.id]) allUniqueIds = false; ids[c.id] = true; }
  });
  ok(allWellFormed, "Jeder Fall hat id, bereich, titel, schritte (nicht leer), erwartung");
  ok(allUniqueIds, "Alle TEST_CASES-ids sind eindeutig");
  // Wichtige Bereiche vorhanden
  var bereiche = {};
  cases.forEach(function (c) { bereiche[c.bereich] = true; });
  ["Wizards", "Dialoge", "Drucken", "Backup", "UI/Touch", "PWA/Offline", "Validierung"].forEach(function (b) {
    ok(!!bereiche[b], "Bereich vorhanden: " + b);
  });

  // ==========================================================
  // 2. HARTE REGEL: nur bh_test_-Keys, App-Daten unberuehrt
  // ==========================================================
  // App-Daten-Keys mit Sentinel vorbelegen
  var protectedKeys = [];
  Object.keys(app.keys).forEach(function (k) { protectedKeys.push(app.keys[k]); });
  Object.keys(app.DOCS).forEach(function (id) { if (app.DOCS[id].storageKey) protectedKeys.push(app.DOCS[id].storageKey); });
  ["bh_pin_recovery_v1", "bh_onboarding_done_v1", "bh_install_dismissed_v1", "bh_setup_checklist_dismissed"].forEach(function (k) { protectedKeys.push(k); });
  // Dedup
  protectedKeys = protectedKeys.filter(function (v, i, a) { return v && a.indexOf(v) === i; });

  var snapshot = {};
  protectedKeys.forEach(function (k, i) { var v = "APPDATA-SENTINEL-" + i; ctx.localStorage.setItem(k, v); snapshot[k] = v; });

  // Sauberer Testmodus-State, dann eine Test-Antwort speichern
  TM.tmSetState({ open: false, filter: "alle", results: {} });
  var keysBefore = Object.keys(ctx.localStorage.__dump());
  TM.tmSetStatus("wiz-ear", "bestanden");
  TM.tmSetNote("wiz-ear", "Lief sauber durch.");
  TM.tmSetStatus("print-1", "fehler");

  // Ergebnis-Key existiert und ist ein bh_test_-Key
  var resultKey = TM.BH_TEST_RESULTS_KEY;
  ok(/^bh_test_/.test(resultKey), "Ergebnis-Key hat Praefix bh_test_ (" + resultKey + ")");
  ok(ctx.localStorage.getItem(resultKey) != null, "Ergebnis wurde unter bh_test_-Key gespeichert");

  // App-Daten-Keys unveraendert
  var appDataUntouched = true;
  protectedKeys.forEach(function (k) { if (ctx.localStorage.getItem(k) !== snapshot[k]) { appDataUntouched = false; console.log("    veraendert: " + k); } });
  ok(appDataUntouched, "Alle App-Daten-Keys nach Test-Lauf unveraendert");

  // Jeder neu hinzugekommene oder geaenderte Key ist ein bh_test_-Key
  var keysAfter = Object.keys(ctx.localStorage.__dump());
  var onlyTestKeysWritten = true;
  keysAfter.forEach(function (k) {
    if (keysBefore.indexOf(k) === -1 && !/^bh_test_/.test(k)) { onlyTestKeysWritten = false; console.log("    fremder neuer Key: " + k); }
  });
  ok(onlyTestKeysWritten, "Test-Modus schreibt ausschliesslich bh_test_-Keys");

  // Persistenz: tmLoadResults liest gespeicherte Antworten zurueck
  var reloaded = TM.tmLoadResults();
  eq(reloaded["wiz-ear"] && reloaded["wiz-ear"].status, "bestanden", "Gespeicherter Status wird zurueckgelesen");
  eq(reloaded["wiz-ear"] && reloaded["wiz-ear"].notiz, "Lief sauber durch.", "Gespeicherte Notiz wird zurueckgelesen");

  // ==========================================================
  // 3. Export-Builder: JSON + HTML
  // ==========================================================
  var exp = TM.tmBuildExportJson();
  ok(exp && Array.isArray(exp.faelle), "Export-JSON hat faelle-Array");
  eq(exp.faelle.length, cases.length, "Export-JSON deckt alle Faelle ab");
  ok(exp.zusammenfassung && typeof exp.zusammenfassung.total === "number", "Export-JSON hat Zusammenfassung");
  var jsonStr = "";
  var jsonOk = true;
  try { jsonStr = JSON.stringify(exp); JSON.parse(jsonStr); } catch (e) { jsonOk = false; }
  ok(jsonOk, "Export-JSON ist serialisier- und parsebar");

  // HTML-Bericht aus Beispiel-Ergebnissen (mit Fehler + Bild)
  var tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  TM.tmSetState({ open: false, filter: "alle", results: {
    "print-1": { status: "fehler", notiz: "Leere Seite im Druck.", bilder: [{ name: "screenshot.png", dataUrl: tinyPng }] },
    "wiz-ear": { status: "bestanden", notiz: "", bilder: [] },
  } });
  var html = TM.tmBuildHtmlReport();
  ok(typeof html === "string" && html.length > 200, "HTML-Bericht ist nicht leer");
  ok(html.indexOf("<html") !== -1 && html.indexOf("</html>") !== -1, "HTML-Bericht ist ein vollstaendiges HTML-Dokument");
  ok(html.indexOf("Zuerst korrigieren") !== -1, "HTML-Bericht stellt Fehler-Faelle zuerst dar");
  ok(html.indexOf(tinyPng) !== -1, "HTML-Bericht bettet angehaengte Bilder ein");
  ok(html.indexOf("Leere Seite im Druck.") !== -1, "HTML-Bericht enthaelt die Notiz");

  // ==========================================================
  // 4. Bild-Downscale (reine Funktion)
  // ==========================================================
  var big = TM.tmScaledSize(4000, 3000, 1000);
  ok(Math.max(big.width, big.height) === 1000, "tmScaledSize begrenzt laengsten Rand auf 1000 (war " + Math.max(big.width, big.height) + ")");
  eq(big.width, 1000, "tmScaledSize: Breite skaliert");
  eq(big.height, 750, "tmScaledSize: Hoehe proportional skaliert");
  var small = TM.tmScaledSize(800, 600, 1000);
  eq(small.width, 800, "tmScaledSize laesst kleine Bilder unveraendert (Breite)");
  eq(small.height, 600, "tmScaledSize laesst kleine Bilder unveraendert (Hoehe)");

  // ==========================================================
  // 5. testdaten.json: gueltig, Backup-Format, nur synthetische Daten
  // ==========================================================
  var tdRaw = fs.readFileSync(path.join(__dirname, "testdaten.json"), "utf8");
  var td = null, tdOk = true;
  try { td = JSON.parse(tdRaw); } catch (e) { tdOk = false; }
  ok(tdOk, "testdaten.json ist gueltiges JSON");
  ok(td && typeof td.version === "number" && td.version <= 4, "testdaten.json: version <= 4 (Backup-Format unveraendert)");
  ok(td && td.docs && typeof td.docs === "object", "testdaten.json hat docs (vom Import gefordert)");
  ["shared", "settings", "docs", "notes", "inbox", "contacts", "briefHistory", "customTemplates", "terminPrep"].forEach(function (k) {
    ok(td && Object.prototype.hasOwnProperty.call(td, k), "testdaten.json hat Backup-Feld: " + k);
  });
  // Synthetische Daten: Emails nur auf reservierten Beispiel-Domains
  var emails = (tdRaw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []);
  var allExample = emails.every(function (m) { return /@example\.(com|org)$/.test(m); });
  ok(emails.length > 0, "testdaten.json enthaelt Beispiel-Emails");
  ok(allExample, "testdaten.json: alle Emails auf reservierten example-Domains (keine echten)");
  // Keine echte IBAN (oeffentliche Test-IBAN waere erlaubt, hier gar keine)
  var ibans = (tdRaw.match(/\bDE\d{20}\b/g) || []).filter(function (m) { return m !== "DE89370400440532013000"; });
  eq(ibans.length, 0, "testdaten.json enthaelt keine echte IBAN");
  // Kein bekannter Realname
  ok(tdRaw.indexOf("Mariana Cannabis") === -1, "testdaten.json: kein bekannter Realname");
  // Generierte Datei stimmt mit der App-Funktion ueberein (kein Drift)
  var generated = JSON.stringify(TM.tmBuildTestdaten(), null, 2);
  ok(generated === tdRaw.replace(/\r\n/g, "\n").replace(/\n$/, "") || generated === tdRaw, "testdaten.json entspricht tmBuildTestdaten() (kein Drift)");

  // ==========================================================
  // 6. Touch-Target-Mini-Check (Paket D)
  // ==========================================================
  var htmlSrc = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  var btnBlock = /\.btn\s*\{[^}]*\}/.exec(htmlSrc);
  ok(!!btnBlock, "CSS-Klasse .btn gefunden");
  ok(btnBlock && /min-height\s*:\s*44px/.test(btnBlock[0]), "Paket D: .btn hat min-height: 44px");
  var iconBlock = /\.home-header-actions\s+\.btn-icon\s*\{[^}]*\}/.exec(htmlSrc);
  ok(iconBlock && /min-width\s*:\s*44px/.test(iconBlock[0]) && /min-height\s*:\s*44px/.test(iconBlock[0]), "Paket D: Icon-Buttons mind. 44x44 px");

  // ==========================================================
  // 7. Keine em-dashes (U+2014) in neuen Deliverables
  // ==========================================================
  var emdashChar = String.fromCharCode(0x2014);
  eq(tdRaw.split(emdashChar).length - 1, 0, "testdaten.json: 0 em-dashes (U+2014)");
  // Marker fuer saubere Entfernbarkeit vorhanden
  ok((htmlSrc.match(/=== TESTMODUS START ===/g) || []).length >= 2, "Entfern-Marker TESTMODUS START vorhanden (CSS + JS)");
  ok((htmlSrc.match(/=== TESTMODUS ENDE ===/g) || []).length >= 2, "Entfern-Marker TESTMODUS ENDE vorhanden (CSS + JS)");

  console.log("\n== ERGEBNIS smoke_v342_testmodus ==");
  console.log("PASS: " + pass + "  FAIL: " + fail);
  if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
  console.log("Alle Testmodus-Asserts (v3.42) gruen.");
}

main();
