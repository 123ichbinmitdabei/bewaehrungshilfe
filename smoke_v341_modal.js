// smoke_v341_modal.js — Paket J2: Modal-Nebenlaeufigkeit (FIFO-Warteschlange).
// Ein zweites Modal waehrend eines offenen wird eingereiht, nicht still
// ueberschrieben. Fail-safe bleibt: nichts bestaetigt sich selbst. confirmAsync
// loest weiterhin korrekt. Kein destruktiver Pfad ohne Bestaetigung.
"use strict";
const { loadApp } = require("./smoke_bootstrap");

var pass = 0, fail = 0, fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); console.log("  FAIL: " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (erwartet '" + b + "', war '" + a + "')"); }
async function flush() { for (var i = 0; i < 25; i++) await Promise.resolve(); }

var loaded = loadApp();
var app = loaded.app;
var f = app.fns;

function reset() {
  app.resetState();
  var st = app.getState();
  st.docs = {};
  Object.keys(app.DOCS).forEach(function (id) {
    st.docs[id] = { answers: {}, rows: {}, attachments: {}, signatures: {}, checks: {}, currentIdx: 0 };
  });
  st.contacts = []; st.shared = {}; st.inbox = []; st.notes = [];
  st.view = "home"; st.activeDocId = "ear";
  st.confirmModal = null; st.inputModal = null;
  f.clearModalQueue();
  return st;
}

async function main() {
  // ==========================================================
  // 1. Zwei Confirms: A bleibt aktiv, B in Queue. A bestaetigen -> B aktiv.
  // ==========================================================
  (function () {
    var st = reset();
    var aRan = 0, bRan = 0;
    f.confirmAction({ message: "A", onConfirm: function () { aRan++; } });
    ok(!!st.confirmModal && st.confirmModal.message === "A", "A ist aktiv");
    f.confirmAction({ message: "B", onConfirm: function () { bRan++; } });
    eq(f.getModalQueueLength(), 1, "B wurde eingereiht (Queue=1)");
    ok(st.confirmModal.message === "A", "A bleibt aktiv, NICHT von B ueberschrieben");
    f.runConfirmAction(); // A bestaetigen
    eq(aRan, 1, "A.onConfirm lief bei Bestaetigung");
    ok(!!st.confirmModal && st.confirmModal.message === "B", "nach A ist B aktiv (aus Queue)");
    eq(f.getModalQueueLength(), 0, "Queue leer nachdem B geoeffnet");
    f.runConfirmAction(); // B bestaetigen
    eq(bRan, 1, "B.onConfirm lief");
    ok(!st.confirmModal, "kein Modal mehr offen");
  })();

  // ==========================================================
  // 2. Abbrechen-Variante: A abbrechen -> onCancel, nicht onConfirm; dann B aktiv.
  // ==========================================================
  (function () {
    var st = reset();
    var aConfirm = 0, aCancel = 0;
    f.confirmAction({ message: "A", onConfirm: function () { aConfirm++; }, onCancel: function () { aCancel++; } });
    f.confirmAction({ message: "B", onConfirm: function () {} });
    eq(f.getModalQueueLength(), 1, "B eingereiht");
    f.closeConfirmModal(); // A abbrechen
    eq(aCancel, 1, "A.onCancel lief bei Abbruch");
    eq(aConfirm, 0, "A.onConfirm lief NICHT bei Abbruch (fail-safe)");
    ok(!!st.confirmModal && st.confirmModal.message === "B", "nach Abbruch von A ist B aktiv");
  })();

  // ==========================================================
  // 3. Misch-Variante: Confirm offen, inputModal aufrufen -> Input eingereiht.
  // ==========================================================
  (function () {
    var st = reset();
    var okVal = null;
    f.confirmAction({ message: "Confirm", onConfirm: function () {} });
    f.inputModal("Input-Frage", { onOk: function (v) { okVal = v; } });
    eq(f.getModalQueueLength(), 1, "Input eingereiht waehrend Confirm offen");
    ok(!!st.confirmModal && !st.inputModal, "Confirm bleibt aktiv, Input noch nicht");
    f.runConfirmAction(); // Confirm beantworten
    ok(!st.confirmModal && !!st.inputModal, "nach Confirm erscheint das Input-Modal");
    f.setInputModalValue("hallo");
    f.submitInputModal();
    eq(okVal, "hallo", "Input.onOk lief mit eingegebenem Wert");
    ok(!st.inputModal, "kein Input-Modal mehr offen");
  })();

  // ==========================================================
  // 4. FIFO bei drei eingereihten Modals: Reihenfolge stimmt.
  // ==========================================================
  (function () {
    var st = reset();
    var order = [];
    f.confirmAction({ message: "M0", onConfirm: function () { order.push(0); } });
    f.confirmAction({ message: "M1", onConfirm: function () { order.push(1); } });
    f.confirmAction({ message: "M2", onConfirm: function () { order.push(2); } });
    f.confirmAction({ message: "M3", onConfirm: function () { order.push(3); } });
    eq(f.getModalQueueLength(), 3, "drei Modals eingereiht (M0 aktiv)");
    eq(st.confirmModal.message, "M0", "M0 ist aktiv");
    f.runConfirmAction(); eq(st.confirmModal.message, "M1", "nach M0 -> M1");
    f.runConfirmAction(); eq(st.confirmModal.message, "M2", "nach M1 -> M2");
    f.runConfirmAction(); eq(st.confirmModal.message, "M3", "nach M2 -> M3");
    f.runConfirmAction();
    eq(JSON.stringify(order), JSON.stringify([0, 1, 2, 3]), "FIFO-Reihenfolge 0,1,2,3 eingehalten");
    ok(!st.confirmModal, "alle abgearbeitet");
  })();

  // ==========================================================
  // 5. Notiz-Vorschlag-Szenario: Modal offen, zweiter Flow loest aus,
  //    das offene Modal bleibt sichtbar (kein stilles Ueberschreiben).
  // ==========================================================
  (function () {
    var st = reset();
    var firstCancelled = 0, suggestRan = 0;
    // Nutzer hat ein wichtiges Modal offen (z.B. Loeschen-Bestaetigung)
    f.confirmAction({ title: "Wichtig", message: "Erste Aktion", danger: true, onConfirm: function () {}, onCancel: function () { firstCancelled++; } });
    var before = st.confirmModal;
    // Zeitgesteuerter Notiz-Vorschlag feuert (simuliert via confirmAsync wie im echten Code)
    var p = f.confirmAsync({ title: "Vorschlag", message: "Notizen erledigt?" });
    p.then(function () { suggestRan++; });
    ok(st.confirmModal === before, "offenes Modal bleibt unveraendert sichtbar");
    eq(st.confirmModal.message, "Erste Aktion", "es ist weiterhin das erste Modal");
    eq(f.getModalQueueLength(), 1, "der Vorschlag steht in der Queue");
    // Erstes Modal beantworten -> Vorschlag erscheint
    f.runConfirmAction();
    ok(!!st.confirmModal && st.confirmModal.message === "Notizen erledigt?", "Vorschlag erscheint erst nach Schliessen des ersten");
    f.closeConfirmModal();
  })();
  await flush();

  // ==========================================================
  // 6. confirmAsync durch die Queue: Promise loest erst nach Beantwortung.
  // ==========================================================
  (async function () {
    var st = reset();
    f.confirmAction({ message: "Blocker", onConfirm: function () {} });
    var resolved = null;
    var p = f.confirmAsync({ message: "Async-B" }); // wird eingereiht
    p.then(function (v) { resolved = v; });
    eq(f.getModalQueueLength(), 1, "confirmAsync eingereiht hinter Blocker");
    await flush();
    eq(resolved, null, "confirmAsync-Promise loest NICHT, solange eingereiht");
    f.runConfirmAction(); // Blocker beantworten -> Async-B wird aktiv
    ok(!!st.confirmModal && st.confirmModal.message === "Async-B", "Async-B ist nach Blocker aktiv");
    f.runConfirmAction(); // Async-B bestaetigen
    await flush();
    eq(resolved, true, "confirmAsync-Promise loest true nach Beantwortung");
  })();
  await flush();

  // ==========================================================
  // 7. Fail-safe: eingereihtes Modal bestaetigt sich nicht selbst.
  // ==========================================================
  (function () {
    var st = reset();
    var bRan = 0;
    f.confirmAction({ message: "A", onConfirm: function () {} });
    f.confirmAction({ message: "B", danger: true, onConfirm: function () { bRan++; } });
    f.runConfirmAction(); // A -> B wird aktiv, aber NICHT automatisch bestaetigt
    eq(bRan, 0, "B.onConfirm laeuft NICHT automatisch (kein Selbst-Bestaetigen)");
    ok(!!st.confirmModal && st.confirmModal.message === "B", "B wartet auf ausdrueckliche Antwort");
    f.runConfirmAction();
    eq(bRan, 1, "B laeuft erst nach ausdruecklicher Bestaetigung");
  })();

  console.log("\n== ERGEBNIS smoke_v341_modal ==");
  console.log("PASS: " + pass + "  FAIL: " + fail);
  if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
  console.log("Alle Modal-Queue-Asserts (v3.41) gruen.");
}

main().catch(function (e) { console.error("smoke_v341_modal Laufzeitfehler:", e); process.exit(1); });
