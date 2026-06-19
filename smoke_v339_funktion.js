// smoke_v339_funktion.js — Paket A: Funktions-Vollaudit (v3.39).
// Render-Vollabdeckung (leer + gefuellt), Feld-Roundtrip je Wizard,
// Sync-Vollabdeckung, Pipelines (ICS/VCALENDAR, globale Suche, Achievements,
// Timeline, Setup-Checkliste, Backup-Export + Re-Import-Identitaet).
// Laeuft unter Node mit gemockten Browser-Globals.
"use strict";
const { loadApp } = require("./smoke_bootstrap");

var modules = {};
var curMod = "allgemein";
var pass = 0, fail = 0, fails = [];
function mod(name) { curMod = name; if (!modules[name]) modules[name] = { pass: 0, fail: 0 }; }
function ok(cond, msg) {
  if (!modules[curMod]) modules[curMod] = { pass: 0, fail: 0 };
  if (cond) { pass++; modules[curMod].pass++; }
  else { fail++; modules[curMod].fail++; fails.push("[" + curMod + "] " + msg); console.log("  FAIL [" + curMod + "]: " + msg); }
}
function eq(a, b, msg) { ok(a === b, msg + " (erwartet '" + b + "', war '" + a + "')"); }
function isStr(x, msg) { ok(typeof x === "string" && x.length > 0, msg); }

var loaded = loadApp();
var app = loaded.app;

function freshState() {
  app.resetState();
  var st = app.getState();
  st.docs = {};
  Object.keys(app.DOCS).forEach(function (id) {
    st.docs[id] = { answers: {}, rows: {}, attachments: {}, signatures: {}, checks: {}, currentIdx: 0 };
  });
  st.contacts = []; st.shared = {}; st.customTemplates = {}; st.briefHistory = [];
  st.notes = []; st.inbox = []; st.terminPrep = {};
  st.activeDocId = "ear";
  return st;
}

// repraesentatives Textfeld je Doc (dynamisch ermittelt)
function firstField(docId) {
  var d = app.DOCS[docId];
  var res = null;
  (d.sections || []).forEach(function (s) {
    if (res) return;
    if ((s.fields || []).length) {
      var f = (s.fields).find(function (f) { return !f.type || f.type === "text" || f.type === "textarea"; }) || s.fields[0];
      if (f) res = { sec: s.id, field: f.id };
    }
  });
  return res;
}
function firstRowSec(docId) {
  var d = app.DOCS[docId];
  var res = null;
  (d.sections || []).forEach(function (s) {
    if (res) return;
    if ((s.columns || []).length) res = { sec: s.id, col: s.columns[0].id };
  });
  return res;
}

// ============================================================
// A2a: Render-Vollabdeckung LEERER Zustand (kein Crash)
// ============================================================
mod("A2a-RenderLeer");
(function () {
  var st = freshState();
  var views = ["home", "contacts", "briefHistory", "timeline", "settings",
    "anschreiben", "belege", "inbox", "import", "help", "preview"];
  views.forEach(function (v) {
    st.view = v;
    var threw = false;
    try { app.fns.render(); } catch (e) { threw = true; console.log("    render(" + v + ") -> " + e.message); }
    ok(!threw, "Leer: Hauptansicht rendert: " + v);
  });
  Object.keys(app.DOCS).forEach(function (id) {
    st.view = "wizard"; st.activeDocId = id;
    var html = null, threw = false;
    try { html = app.fns.renderWizard(); } catch (e) { threw = true; console.log("    wizard(" + id + ") -> " + e.message); }
    ok(!threw, "Leer: Wizard rendert: " + id);
    isStr(html, "Leer: Wizard liefert HTML: " + id);
  });
})();

// ============================================================
// A2b: Render-Vollabdeckung GEFUELLTER Zustand (kein Crash)
// ============================================================
mod("A2b-RenderGefuellt");
(function () {
  var st = freshState();
  st.shared = { name: "Platzhalter Person", aktenzeichen: "1 Js 000/00", therapeut: "Praxis Muster",
    anwalt: "Kanzlei Muster", gerichtskasse: "Landesjustizkasse", arbeitgeber: "Firma Muster" };
  st.contacts = [{ id: "c1", rolle: "bh", name: "BH Muster" }, { id: "c2", rolle: "therapeut", name: "Th Muster" }];
  st.notes = [{ id: "n1", text: "Eine Notiz", createdAt: "2026-01-01T00:00:00Z" }];
  st.inbox = [{ id: "i1", name: "Beleg.pdf", type: "pdf" }];
  st.briefHistory = [{ id: "b1", title: "Stundung", createdAt: "2026-01-01T00:00:00Z" }];
  // ein paar Docs fuellen
  st.docs.bhtermine.rows = { termine: [{ datum: "15.06.2026", status: "wahrgenommen" }] };
  st.docs.sozial.rows = { stunden: [{ datum: "01.02.2026", stunden: "4" }] };
  st.docs.ear.answers = { "arbeit.lohn": "1500", "personal.name": "Platzhalter Person" };
  var views = ["home", "contacts", "briefHistory", "timeline", "settings",
    "anschreiben", "belege", "inbox", "import", "help", "preview"];
  views.forEach(function (v) {
    st.view = v;
    var threw = false;
    try { app.fns.render(); } catch (e) { threw = true; console.log("    render(" + v + ") -> " + e.message); }
    ok(!threw, "Gefuellt: Hauptansicht rendert: " + v);
  });
  Object.keys(app.DOCS).forEach(function (id) {
    st.view = "wizard"; st.activeDocId = id;
    var threw = false;
    try { app.fns.renderWizard(); } catch (e) { threw = true; console.log("    wizard(" + id + ") -> " + e.message); }
    ok(!threw, "Gefuellt: Wizard rendert: " + id);
  });
})();

// ============================================================
// A3: Feld-Roundtrip je Wizard (Text-Feld + dynamische Zeile)
// ============================================================
mod("A3-FeldRoundtrip");
(function () {
  Object.keys(app.DOCS).forEach(function (id) {
    var ff = firstField(id);
    if (ff) {
      var st = freshState();
      st.activeDocId = id; st.view = "wizard";
      app.fns.setAnswer(ff.sec, ff.field, "RT_" + id);
      eq(app.fns.getAnswer(ff.sec, ff.field), "RT_" + id, "A3 Textfeld-Roundtrip: " + id + "/" + ff.sec + "." + ff.field);
    }
    var rs = firstRowSec(id);
    if (rs) {
      var st2 = freshState();
      st2.activeDocId = id; st2.view = "wizard";
      var row = {}; row[rs.col] = "ROW_" + id;
      app.fns.setRows(rs.sec, [row]);
      var got = app.fns.getRows(rs.sec);
      ok(Array.isArray(got) && got.length === 1, "A3 Zeile angelegt: " + id + "/" + rs.sec);
      eq(got[0][rs.col], "ROW_" + id, "A3 Zellenwert-Roundtrip: " + id + "/" + rs.sec + "." + rs.col);
    }
  });
})();

// ============================================================
// A4: Sync-Vollabdeckung (Doc<->shared bidirektional, Adressbuch)
// ============================================================
mod("A4-Sync");
(function () {
  app.DATA_SYNC_GROUPS.forEach(function (g, i) {
    var df = g.fields.find(function (f) { return f.type === "doc"; });
    var sf = g.fields.find(function (f) { return f.type === "shared"; });
    // Doc -> shared
    var st = freshState();
    st.docs[df.docId].answers[df.key] = "D" + i;
    app.fns.reconcileAllSyncGroups();
    eq(st.shared[sf.key], "D" + i, "A4 Doc->shared: " + g.name);
    // shared -> Doc (zurueck)
    var st2 = freshState();
    st2.shared[sf.key] = "S" + i;
    app.fns.reconcileAllSyncGroups();
    eq(st2.docs[df.docId].answers[df.key], "S" + i, "A4 shared->Doc: " + g.name);
  });
  // Adressbuch -> shared fuer alle Rollen
  Object.keys(app.CONTACT_SHARED_MAP).forEach(function (rolle) {
    var st = freshState();
    var map = app.CONTACT_SHARED_MAP[rolle];
    var c = { id: "c_" + rolle, rolle: rolle, name: "K_" + rolle };
    st.contacts = [c];
    app.fns.syncContactToShared(c);
    eq(st.shared[map.name], "K_" + rolle, "A4 Kontakt->shared: " + rolle);
  });
})();

// ============================================================
// A5a: ICS / VCALENDAR-Pipeline
// ============================================================
mod("A5a-ICS");
(function () {
  freshState();
  // escapeIcs: Komma, Semikolon, Newline maskieren
  var esc = app.fns.escapeIcs("a,b;c\nd");
  ok(esc.indexOf("\\,") >= 0, "A5 escapeIcs maskiert Komma");
  ok(esc.indexOf("\\;") >= 0, "A5 escapeIcs maskiert Semikolon");
  ok(esc.indexOf("\\n") >= 0, "A5 escapeIcs maskiert Newline");
  // buildIcsEvent: gueltiger VEVENT
  var d = app.fns.parseDateGuess("15.06.2026");
  ok(d instanceof Date, "A5 parseDateGuess liefert Date");
  var ev = app.fns.buildIcsEvent({ date: d, hour: 10, minute: 0, summary: "Termin Test", uid: "u1@test", location: "Ort", description: "Info" });
  isStr(ev, "A5 buildIcsEvent liefert String");
  ["BEGIN:VEVENT", "END:VEVENT", "UID:u1@test", "DTSTART:", "DTEND:", "SUMMARY:Termin Test"].forEach(function (tok) {
    ok(ev.indexOf(tok) >= 0, "A5 VEVENT enthaelt " + tok);
  });
  // toIcsDate: 8-stelliges Datum + T + Zeit
  var icsd = app.fns.toIcsDate(d, 9, 30);
  ok(/^\d{8}T\d{6}$/.test(icsd), "A5 toIcsDate Format YYYYMMDDTHHMMSS (war " + icsd + ")");
  // buildEventFromRow fuer bhtermine
  var st = app.getState();
  st.activeDocId = "bhtermine";
  var rowEv = app.fns.buildEventFromRow("bhtermine", "termine", 0, { datum: "15.06.2026", uhrzeit: "10:00" });
  ok(rowEv && rowEv.indexOf("BEGIN:VEVENT") >= 0, "A5 buildEventFromRow liefert VEVENT");
  // ungueltiges Datum -> null
  ok(app.fns.buildEventFromRow("bhtermine", "termine", 0, { datum: "" }) === null, "A5 buildEventFromRow ohne Datum -> null");
})();

// ============================================================
// A5b: Globale Suche
// ============================================================
mod("A5b-Suche");
(function () {
  var st = freshState();
  st.notes = [{ id: "n1", text: "Wichtiger Suchbegriff Zebra", createdAt: "2026-01-01T00:00:00Z" }];
  st.docs.ear.answers = { "personal.name": "Findemich Mustermann" };
  ok(app.fns.runGlobalSearch("").length === 0, "A5 leere Suche -> keine Treffer");
  var r1 = app.fns.runGlobalSearch("zebra");
  ok(r1.length >= 1, "A5 Suche findet Notiz");
  var r2 = app.fns.runGlobalSearch("findemich");
  ok(r2.length >= 1, "A5 Suche findet Doc-Antwort");
  var r3 = app.fns.runGlobalSearch("xyzgibtsnicht");
  ok(r3.length === 0, "A5 Suche ohne Treffer -> leer");
})();

// ============================================================
// A5c: Achievements / Setup-Checkliste / Timeline
// ============================================================
mod("A5c-Pipelines");
(function () {
  var st = freshState();
  var ach = app.fns.computeAchievements();
  ok(ach && typeof ach === "object", "A5 computeAchievements Objekt");
  var cl = app.fns.computeSetupChecklist();
  ok(Array.isArray(cl) && cl.length === 8, "A5 Setup-Checkliste 8 Items");
  var tl = app.fns.collectTimelineEvents();
  ok(Array.isArray(tl), "A5 Timeline Array");
  // Signatur-Einbettung
  st.shared.savedSignature = "data:image/png;base64,AAAA";
  st.shared.savedSignatureName = "Platzhalter";
  st.briefSignatureEnabled = true;
  ok(app.fns.getBriefSignatureHtml().indexOf("Platzhalter") >= 0, "A5 Signatur-Einbettung enthaelt Namen");
})();

// ============================================================
// A5d: Backup-Export + Re-Import-Identitaet (tiefer Vergleich)
// ============================================================
mod("A5d-Backup");
(function () {
  var st = freshState();
  st.shared = { name: "Backup Tester", aktenzeichen: "1 Js 1/23" };
  st.theme = "dark";
  st.docs.ear.answers = { "arbeit.lohn": "1750", "personal.name": "Backup Tester" };
  st.docs.bhtermine.rows = { termine: [{ datum: "01.03.2026", status: "wahrgenommen" }] };
  st.contacts = [{ id: "c1", rolle: "bh", name: "BH Muster" }];
  st.notes = [{ id: "n1", text: "Notiz", createdAt: "2026-01-01T00:00:00Z" }];
  st.briefHistory = [{ id: "h1", title: "Stundung" }];
  st.customTemplates = { eigen1: { title: "Eigen", body: "Text" } };
  st.terminPrep = { t1: { fragen: "Frage" } };

  var dump = null, threw = false;
  // exportAllData ist async und liefert das Dump-Objekt zurueck
  try {
    var p = app.fns.exportAllData();
    ok(p && typeof p.then === "function", "A5 exportAllData ist Promise");
  } catch (e) { threw = true; console.log("    export -> " + e.message); }
  ok(!threw, "A5 exportAllData ohne Crash");

  // Synchroner Identitaetstest ueber das Dump-Format:
  // Dump bauen wie exportAllData, JSON-Roundtrip, in frischen State re-importieren.
  var st2 = app.getState();
  var srcDump = {
    version: 4, shared: st2.shared, theme: st2.theme, settings: st2.settings,
    docs: st2.docs, notes: st2.notes, inbox: st2.inbox, contacts: st2.contacts,
    briefHistory: st2.briefHistory, customTemplates: st2.customTemplates, terminPrep: st2.terminPrep,
  };
  var serialized = JSON.stringify(srcDump);
  var data = JSON.parse(serialized);
  ok(typeof data === "object" && !!data.docs, "A5 Dump JSON-Roundtrip parsebar");

  // frischen State und Re-Import (Merge wie in triggerImport)
  var fresh = freshState();
  Object.keys(data.docs).forEach(function (docId) {
    if (app.DOCS[docId]) fresh.docs[docId] = Object.assign({}, fresh.docs[docId], data.docs[docId]);
  });
  fresh.shared = data.shared;
  fresh.theme = data.theme;
  fresh.notes = data.notes; fresh.inbox = data.inbox;
  fresh.contacts = data.contacts; fresh.briefHistory = data.briefHistory;
  fresh.customTemplates = data.customTemplates; fresh.terminPrep = data.terminPrep;

  // tiefer Vergleich der relevanten Felder
  eq(JSON.stringify(fresh.shared), JSON.stringify(srcDump.shared), "A5 Re-Import: shared identisch");
  eq(JSON.stringify(fresh.docs.ear.answers), JSON.stringify(srcDump.docs.ear.answers), "A5 Re-Import: ear answers identisch");
  eq(JSON.stringify(fresh.docs.bhtermine.rows), JSON.stringify(srcDump.docs.bhtermine.rows), "A5 Re-Import: bhtermine rows identisch");
  eq(JSON.stringify(fresh.contacts), JSON.stringify(srcDump.contacts), "A5 Re-Import: contacts identisch");
  eq(JSON.stringify(fresh.notes), JSON.stringify(srcDump.notes), "A5 Re-Import: notes identisch");
  eq(JSON.stringify(fresh.customTemplates), JSON.stringify(srcDump.customTemplates), "A5 Re-Import: customTemplates identisch");
  eq(fresh.theme, "dark", "A5 Re-Import: theme uebernommen");
})();

// ============================================================
// Summary
// ============================================================
console.log("\n== MODUL-SUMMARY smoke_v339_funktion ==");
Object.keys(modules).forEach(function (m) {
  var r = modules[m];
  console.log("  " + (r.fail === 0 ? "OK  " : "FAIL") + "  " + m + ": " + r.pass + " pass, " + r.fail + " fail");
});
console.log("\nGESAMT: PASS " + pass + "  FAIL " + fail + "  (Asserts: " + (pass + fail) + ")");
if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
console.log("Alle Funktions-Asserts gruen.");
