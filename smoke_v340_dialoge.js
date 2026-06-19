// smoke_v340_dialoge.js — Paket H1/I1: Dialog-Migration v3.40.
// In v3.40 wurden ALLE verbliebenen nativen confirm() auf ein Promise-basiertes
// In-App-Modal (confirmAsync) umgestellt. Hartes Invariant: destruktive Aktion
// nur nach Bestaetigung. Bestaetigen fuehrt aus, Abbrechen NICHT.
"use strict";
const fs = require("fs");
const path = require("path");
const { loadApp } = require("./smoke_bootstrap");

var pass = 0, fail = 0, fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); console.log("  FAIL: " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (erwartet '" + b + "', war '" + a + "')"); }

// Microtasks leeren, damit await-Fortsetzungen nach runConfirmAction/closeConfirmModal laufen
async function flush() { for (var i = 0; i < 25; i++) await Promise.resolve(); }

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
  st.activeDocId = "bhtermine";
  return st;
}

async function main() {
  // ==========================================================
  // confirmAsync-Mechanik
  // ==========================================================
  (async function () {
    var st = freshState();
    var p1 = app.fns.confirmAsync({ message: "X?" });
    ok(!!st.confirmModal, "confirmAsync setzt confirmModal");
    app.fns.runConfirmAction();
    eq(await p1, true, "confirmAsync lost true bei Bestaetigen");
    ok(st.confirmModal === null, "confirmAsync schliesst Modal bei Bestaetigen");

    var p2 = app.fns.confirmAsync({ message: "Y?" });
    app.fns.closeConfirmModal();
    eq(await p2, false, "confirmAsync lost false bei Abbrechen");
    ok(st.confirmModal === null, "confirmAsync schliesst Modal bei Abbrechen");
  })();
  await flush();

  // ==========================================================
  // confirmAppointment: missed -> Bestaetigen setzt Status, Abbrechen nicht
  // ==========================================================
  (function () {
    var st = freshState();
    st.activeDocId = "bhtermine";
    st.docs.bhtermine.rows = { termine: [{ datum: "01.03.2026" }] };
    var refId = app.fns._registerActionRef({ docId: "bhtermine", sectionId: "termine", rowIdx: 0, kind: "bhtermine" });
    app.fns.confirmAppointment(refId, "missed");
    ok(!!st.confirmModal, "confirmAppointment(missed) oeffnet Bestaetigungs-Modal");
    ok(st.confirmModal.danger === true, "confirmAppointment(missed) Modal ist danger");
    ok(!st.docs.bhtermine.rows.termine[0].status, "confirmAppointment markiert NICHT vor Bestaetigung");
  })();
  await flush();
  // Bestaetigen
  app.fns.runConfirmAction();
  await flush();
  (function () {
    var st = app.getState();
    eq(st.docs.bhtermine.rows.termine[0].status, "verpasst (nicht erschienen)", "confirmAppointment setzt Status nach Bestaetigung");
    ok(!!st.confirmModal, "confirmAppointment bietet danach Ersatz-Termin-Modal an");
    app.fns.closeConfirmModal(); // Ersatz ablehnen
  })();
  await flush();

  // Abbrechen-Pfad
  (function () {
    var st = freshState();
    st.activeDocId = "bhtermine";
    st.docs.bhtermine.rows = { termine: [{ datum: "02.03.2026" }] };
    var refId = app.fns._registerActionRef({ docId: "bhtermine", sectionId: "termine", rowIdx: 0, kind: "bhtermine" });
    app.fns.confirmAppointment(refId, "cancelled");
    ok(!!st.confirmModal, "confirmAppointment(cancelled) oeffnet Modal");
    app.fns.closeConfirmModal();
  })();
  await flush();
  (function () {
    var st = app.getState();
    ok(!st.docs.bhtermine.rows.termine[0].status, "confirmAppointment: Abbrechen setzt KEINEN Status");
    ok(st.confirmModal === null, "confirmAppointment: nach Abbrechen kein Modal mehr");
  })();

  // confirmAppointment(done) ohne Bestaetigung -> direkt Status
  (function () {
    var st = freshState();
    st.activeDocId = "bhtermine";
    st.docs.bhtermine.rows = { termine: [{ datum: "03.03.2026" }] };
    var refId = app.fns._registerActionRef({ docId: "bhtermine", sectionId: "termine", rowIdx: 0, kind: "bhtermine" });
    app.fns.confirmAppointment(refId, "done");
  })();
  await flush();
  eq(app.getState().docs.bhtermine.rows.termine[0].status, "wahrgenommen", "confirmAppointment(done) setzt Status ohne Rueckfrage");

  // ==========================================================
  // confirmPayment: postponed -> Bestaetigen setzt verschoben, Abbrechen nicht
  // ==========================================================
  (function () {
    var st = freshState();
    st.activeDocId = "schadens";
    st.docs.schadens.rows = { zahlungen: [{ datum: "01.04.2026" }] };
    var refId = app.fns._registerActionRef({ docId: "schadens", sectionId: "zahlungen", rowIdx: 0 });
    app.fns.confirmPayment(refId, "postponed");
    ok(!!st.confirmModal, "confirmPayment(postponed) oeffnet Modal");
    ok(st.docs.schadens.rows.zahlungen[0].status !== "verschoben", "confirmPayment markiert NICHT vor Bestaetigung");
  })();
  await flush();
  app.fns.runConfirmAction();
  await flush();
  (function () {
    var st = app.getState();
    eq(st.docs.schadens.rows.zahlungen[0].status, "verschoben", "confirmPayment(postponed) setzt Status nach Bestaetigung");
    if (st.confirmModal) app.fns.closeConfirmModal(); // Folge-Modal (neues Datum) ablehnen
  })();
  await flush();

  // Abbrechen
  (function () {
    var st = freshState();
    st.activeDocId = "schadens";
    st.docs.schadens.rows = { zahlungen: [{ datum: "05.04.2026" }] };
    var refId = app.fns._registerActionRef({ docId: "schadens", sectionId: "zahlungen", rowIdx: 0 });
    app.fns.confirmPayment(refId, "postponed");
    app.fns.closeConfirmModal();
  })();
  await flush();
  ok(app.getState().docs.schadens.rows.zahlungen[0].status !== "verschoben", "confirmPayment: Abbrechen aendert nichts");

  // confirmPayment(paid) nutzt weiterhin inputModal (kein nativer prompt)
  (function () {
    var st = freshState();
    st.activeDocId = "schadens";
    st.docs.schadens.rows = { zahlungen: [{ datum: "06.04.2026" }] };
    var refId = app.fns._registerActionRef({ docId: "schadens", sectionId: "zahlungen", rowIdx: 0 });
    app.fns.confirmPayment(refId, "paid");
    ok(!!st.inputModal, "confirmPayment(paid) oeffnet inputModal");
    app.fns.setInputModalValue("99,00");
    app.fns.submitInputModal();
    eq(st.docs.schadens.rows.zahlungen[0].status, "bezahlt", "confirmPayment(paid) Status nach Eingabe");
    eq(st.docs.schadens.rows.zahlungen[0].betrag, "99,00", "confirmPayment(paid) Betrag uebernommen");
  })();
  await flush();

  // ==========================================================
  // handleSozialDone: Abbrechen setzt trotzdem Status (kein Stunden-Eintrag)
  // ==========================================================
  (function () {
    var st = freshState();
    st.activeDocId = "sozial";
    var row = { datum: "01.05.2026", von: "08:00", bis: "12:00", pause: "0" };
    st.docs.sozial.rows = { stunden: [row] };
    app.fns.handleSozialDone("sozial", "stunden", 0, row);
    ok(!!st.confirmModal, "handleSozialDone oeffnet Modal (Stunden berechenbar)");
    ok(!row.status, "handleSozialDone setzt Status noch nicht");
  })();
  await flush();
  app.fns.runConfirmAction(); // Stunden eintragen
  await flush();
  (function () {
    var st = app.getState();
    var row = st.docs.sozial.rows.stunden[0];
    eq(row.status, "wahrgenommen", "handleSozialDone setzt Status nach Bestaetigung");
    ok(!!row.stunden && parseFloat(String(row.stunden).replace(",", ".")) === 4, "handleSozialDone traegt 4 h ein bei Bestaetigung");
  })();

  // Abbrechen: Status trotzdem gesetzt, aber KEINE Stunden
  (function () {
    var st = freshState();
    st.activeDocId = "sozial";
    var row = { datum: "02.05.2026", von: "08:00", bis: "12:00", pause: "0" };
    st.docs.sozial.rows = { stunden: [row] };
    app.fns.handleSozialDone("sozial", "stunden", 0, row);
    app.fns.closeConfirmModal();
  })();
  await flush();
  (function () {
    var row = app.getState().docs.sozial.rows.stunden[0];
    eq(row.status, "wahrgenommen", "handleSozialDone: Abbrechen setzt trotzdem Status");
    ok(!row.stunden, "handleSozialDone: Abbrechen traegt KEINE Stunden ein");
  })();

  // ==========================================================
  // Statische Gegenprobe: keine nativen confirm()/prompt() mehr im Script
  // ==========================================================
  (function () {
    var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
    var open = html.indexOf("<script>");
    var js = html.slice(open + 8, html.lastIndexOf("</script>"));
    var nativeConfirm = 0, nativePrompt = 0;
    js.split("\n").forEach(function (line) {
      var code = line.replace(/\/\/.*$/, "");
      if (/(^|[^.\w])confirm\s*\(/.test(code)) nativeConfirm++;
      if (/(^|[^.\w])prompt\s*\(/.test(code)) nativePrompt++;
    });
    ok(nativeConfirm === 0, "H1 keine nativen confirm()-Aufrufe mehr (war " + nativeConfirm + ")");
    ok(nativePrompt === 0, "H1 keine nativen prompt()-Aufrufe mehr (war " + nativePrompt + ")");
    ok(/function confirmAsync/.test(js), "H1 confirmAsync-Infrastruktur vorhanden");
    // confirmAsync nutzt onConfirm/onCancel -> Promise
    ok(/onCancel/.test(js), "H1 closeConfirmModal unterstuetzt onCancel (fuer confirmAsync)");
  })();

  console.log("\n== ERGEBNIS smoke_v340_dialoge ==");
  console.log("PASS: " + pass + "  FAIL: " + fail);
  if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
  console.log("Alle Dialog-Asserts (v3.40) gruen.");
}

main().catch(function (e) { console.error("smoke_v340_dialoge Laufzeitfehler:", e); process.exit(1); });
