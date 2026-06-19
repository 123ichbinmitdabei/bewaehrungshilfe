// smoke_v339_dialoge.js — Paket C: Dialog-Migration (v3.39).
// Hartes Invariant: eine destruktive Aktion wird NUR nach Bestaetigung ausgefuehrt.
// Bestaetigen fuehrt die Aktion aus, Abbrechen NICHT.
// Prueft confirmAction- und inputModal-Mechanik sowie die migrierten Aufrufer.
"use strict";
const fs = require("fs");
const path = require("path");
const { loadApp } = require("./smoke_bootstrap");

var pass = 0, fail = 0, fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); console.log("  FAIL: " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (erwartet '" + b + "', war '" + a + "')"); }

var loaded = loadApp();
var app = loaded.app;

function freshState() {
  app.resetState();
  var st = app.getState();
  st.docs = {};
  Object.keys(app.DOCS).forEach(function (id) {
    st.docs[id] = { answers: {}, rows: {}, attachments: {}, signatures: {}, checks: {}, currentIdx: 0 };
  });
  st.contacts = []; st.shared = {}; st.inbox = []; st.confirmModal = null; st.inputModal = null;
  st.activeDocId = "schadens";
  return st;
}

// ============================================================
// C-Modal-1: confirmAction-Mechanik
// ============================================================
(function () {
  var st = freshState();
  var did = false;
  app.fns.confirmAction({ message: "Test?", onConfirm: function () { did = true; } });
  ok(!!st.confirmModal, "confirmAction setzt state.confirmModal");
  ok(did === false, "confirmAction fuehrt onConfirm NICHT sofort aus");
  app.fns.runConfirmAction();
  ok(did === true, "runConfirmAction fuehrt die Aktion aus");
  ok(st.confirmModal === null, "runConfirmAction schliesst das Modal");

  // Abbrechen-Pfad
  var did2 = false;
  app.fns.confirmAction({ message: "Test2?", onConfirm: function () { did2 = true; } });
  app.fns.closeConfirmModal();
  ok(did2 === false, "closeConfirmModal fuehrt die Aktion NICHT aus (Abbrechen)");
  ok(st.confirmModal === null, "closeConfirmModal schliesst das Modal");
})();

// ============================================================
// C-Modal-2: inputModal-Mechanik (Ersatz fuer prompt)
// ============================================================
(function () {
  var st = freshState();
  var captured = null;
  app.fns.inputModal("Betrag?", { default: "100", onOk: function (v) { captured = v; } });
  ok(!!st.inputModal, "inputModal setzt state.inputModal");
  eq(st.inputModal.value, "100", "inputModal uebernimmt default-Wert");
  ok(captured === null, "inputModal fuehrt onOk NICHT sofort aus");
  app.fns.setInputModalValue("250,00");
  app.fns.submitInputModal();
  eq(captured, "250,00", "submitInputModal liefert den eingegebenen Wert an onOk");
  ok(st.inputModal === null, "submitInputModal schliesst das Modal");

  // Abbrechen-Pfad
  var captured2 = "unset";
  app.fns.inputModal("Betrag?", { default: "5", onOk: function (v) { captured2 = v; } });
  app.fns.closeInputModal();
  eq(captured2, "unset", "closeInputModal ruft onOk NICHT auf (Abbrechen)");
  ok(st.inputModal === null, "closeInputModal schliesst das Modal");
})();

// ============================================================
// C-Del-1: deleteRow (destruktiv) nur nach Bestaetigung
// ============================================================
(function () {
  var st = freshState();
  st.activeDocId = "schadens";
  app.fns.setRows("zahlungen", [{ datum: "01.01.2026", betrag: "100" }, { datum: "02.01.2026", betrag: "200" }]);
  app.fns.deleteRow("zahlungen", 0);
  eq(app.fns.getRows("zahlungen").length, 2, "deleteRow loescht NICHT sofort (Modal offen)");
  ok(!!st.confirmModal, "deleteRow oeffnet Bestaetigungs-Modal");
  app.fns.runConfirmAction();
  eq(app.fns.getRows("zahlungen").length, 1, "deleteRow loescht nach Bestaetigung");
  eq(app.fns.getRows("zahlungen")[0].betrag, "200", "deleteRow entfernt die richtige Zeile");

  // Abbrechen behaelt alles
  app.fns.deleteRow("zahlungen", 0);
  app.fns.closeConfirmModal();
  eq(app.fns.getRows("zahlungen").length, 1, "deleteRow: Abbrechen loescht nichts");
})();

// ============================================================
// C-Del-2: deleteInboxItem (destruktiv)
// ============================================================
(function () {
  var st = freshState();
  st.inbox = [{ id: "ib1", name: "Beleg.pdf", type: "pdf" }];
  app.fns.deleteInboxItem("ib1");
  eq(st.inbox.length, 1, "deleteInboxItem loescht NICHT sofort");
  ok(!!st.confirmModal, "deleteInboxItem oeffnet Modal");
  app.fns.runConfirmAction();
  eq(st.inbox.length, 0, "deleteInboxItem loescht nach Bestaetigung");
  // Abbrechen
  st.inbox = [{ id: "ib2", name: "B2", type: "pdf" }];
  app.fns.deleteInboxItem("ib2");
  app.fns.closeConfirmModal();
  eq(st.inbox.length, 1, "deleteInboxItem: Abbrechen loescht nichts");
})();

// ============================================================
// C-Del-3: deleteSavedSignature (destruktiv)
// ============================================================
(function () {
  var st = freshState();
  st.shared.savedSignature = "data:image/png;base64,AAAA";
  st.shared.savedSignatureName = "Platzhalter";
  app.fns.deleteSavedSignature();
  ok(st.shared.savedSignature !== undefined, "deleteSavedSignature loescht NICHT sofort");
  ok(!!st.confirmModal, "deleteSavedSignature oeffnet Modal");
  app.fns.runConfirmAction();
  ok(st.shared.savedSignature === undefined, "deleteSavedSignature loescht nach Bestaetigung");
  // Abbrechen
  st.shared.savedSignature = "data:image/png;base64,BBBB";
  app.fns.deleteSavedSignature();
  app.fns.closeConfirmModal();
  ok(st.shared.savedSignature === "data:image/png;base64,BBBB", "deleteSavedSignature: Abbrechen behaelt Unterschrift");
})();

// ============================================================
// C-Reset: resetSettingsToDefaults (semi-destruktiv)
// ============================================================
(function () {
  var st = freshState();
  st.settings.showStats = false;
  st.settings.backupReminderDays = 7;
  app.fns.resetSettingsToDefaults();
  eq(st.settings.showStats, false, "resetSettings aendert NICHT sofort");
  ok(!!st.confirmModal, "resetSettings oeffnet Modal");
  app.fns.runConfirmAction();
  eq(st.settings.showStats, true, "resetSettings setzt nach Bestaetigung zurueck");
  eq(st.settings.backupReminderDays, 14, "resetSettings setzt backupReminderDays auf Default");
  // Abbrechen
  st.settings.showStats = false;
  app.fns.resetSettingsToDefaults();
  app.fns.closeConfirmModal();
  eq(st.settings.showStats, false, "resetSettings: Abbrechen behaelt Einstellung");
})();

// ============================================================
// C-Pay: confirmPayment "paid" nutzt inputModal statt prompt
// ============================================================
(function () {
  var st = freshState();
  st.activeDocId = "schadens";
  st.docs.schadens.rows = { zahlungen: [{ datum: "01.01.2026", bemerkung: "Rate 150" }] };
  var refId = app.fns._registerActionRef({ docId: "schadens", sectionId: "zahlungen", rowIdx: 0 });
  app.fns.confirmPayment(refId, "paid");
  ok(!!st.inputModal, "confirmPayment(paid) oeffnet inputModal statt prompt");
  ok(st.docs.schadens.rows.zahlungen[0].status !== "bezahlt", "confirmPayment markiert NICHT vor Eingabe");
  app.fns.setInputModalValue("150,00");
  app.fns.submitInputModal();
  eq(st.docs.schadens.rows.zahlungen[0].status, "bezahlt", "confirmPayment: Status nach Bestaetigung bezahlt");
  eq(st.docs.schadens.rows.zahlungen[0].betrag, "150,00", "confirmPayment: Betrag uebernommen");
  // Abbrechen
  st.docs.schadens.rows = { zahlungen: [{ datum: "02.01.2026" }] };
  var refId2 = app.fns._registerActionRef({ docId: "schadens", sectionId: "zahlungen", rowIdx: 0 });
  app.fns.confirmPayment(refId2, "paid");
  app.fns.closeInputModal();
  ok(st.docs.schadens.rows.zahlungen[0].status !== "bezahlt", "confirmPayment: Abbrechen markiert nichts");
})();

// ============================================================
// C-Static: kein prompt() mehr im Druck-/Logikpfad, Input-Modal hat 16px Font
// ============================================================
(function () {
  var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  var open = html.indexOf("<script>");
  var js = html.slice(open + 8, html.lastIndexOf("</script>"));
  // Kein literaler prompt(...) Aufruf mehr (nur noch inputModal). Kommentare ignorieren:
  // jede Zeile vor einem "//" abschneiden, dann nach prompt( suchen.
  var promptCalls = 0;
  js.split("\n").forEach(function (line) {
    var code = line.replace(/\/\/.*$/, "");
    if (/(^|[^.\w])prompt\s*\(/.test(code)) promptCalls++;
  });
  ok(promptCalls === 0, "C kein prompt()-Aufruf mehr im Script (war " + promptCalls + ")");
  // inputModal-Feld nutzt font-size:16px (kein iOS-Zoom)
  ok(/id="input-modal-field"[\s\S]{0,400}font-size:16px/.test(js), "C inputModal-Feld nutzt 16px Font (kein iOS-Zoom)");
  // Kein echter window.open()-Aufruf im Druckpfad (A3)
  var winOpen = 0;
  js.split("\n").forEach(function (line) { var code = line.replace(/\/\/.*$/, ""); if (/window\.open\s*\(/.test(code)) winOpen++; });
  ok(winOpen === 0, "C kein window.open()-Aufruf im Druckpfad (war " + winOpen + ")");
  // printFormular nutzt jetzt Reflow (offsetHeight + requestAnimationFrame) wie die anderen Druckpfade
  var pf = js.slice(js.indexOf("async function printFormular"));
  pf = pf.slice(0, pf.indexOf("\nasync function ", 10) > 0 ? pf.indexOf("\nasync function ", 10) : 4000);
  ok(pf.indexOf("offsetHeight") >= 0 && pf.indexOf("requestAnimationFrame") >= 0, "C printFormular nutzt Reflow vor window.print()");
})();

console.log("\n== ERGEBNIS smoke_v339_dialoge ==");
console.log("PASS: " + pass + "  FAIL: " + fail);
if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
console.log("Alle Dialog-Asserts gruen.");
