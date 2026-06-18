// smoke_v338_sync.js — Verifikation der DATA_SYNC_GROUPS und des Adressbuch-Syncs
// (Work Order Aufgabe A1). Laeuft unter Node mit gemockten Browser-Globals.
"use strict";
const { loadApp } = require("./smoke_bootstrap");

var pass = 0, fail = 0;
var fails = [];
function ok(cond, msg) {
  if (cond) { pass++; }
  else { fail++; fails.push(msg); console.log("  FAIL: " + msg); }
}
function eq(a, b, msg) { ok(a === b, msg + " (erwartet '" + b + "', war '" + a + "')"); }

var loaded = loadApp();
var app = loaded.app;

function freshState() {
  app.resetState();
  var st = app.getState();
  st.docs = {};
  st.contacts = [];
  st.shared = {};
  return st;
}

// Hilfsfunktion: setzt ein Doc-Feld und stellt die Doc-Struktur sicher.
function setDocField(st, docId, key, val) {
  if (!st.docs[docId]) st.docs[docId] = { answers: {}, rows: {}, attachments: {}, signatures: {} };
  if (!st.docs[docId].answers) st.docs[docId].answers = {};
  st.docs[docId].answers[key] = val;
}

console.log("== A1: DATA_SYNC_GROUPS — Doc -> Shared (reconcile) ==");
// Pro Sync-Gruppe: Doc-Feld setzen, reconcile, pruefen dass shared-Feld gefuellt ist.
app.DATA_SYNC_GROUPS.forEach(function (group, i) {
  var st = freshState();
  var docField = group.fields.find(function (f) { return f.type === "doc"; });
  var sharedField = group.fields.find(function (f) { return f.type === "shared"; });
  ok(!!docField, "Gruppe '" + group.name + "' hat ein Doc-Feld");
  ok(!!sharedField, "Gruppe '" + group.name + "' hat ein Shared-Feld");
  if (!docField || !sharedField) return;
  var testVal = "SyncTest_" + i;
  setDocField(st, docField.docId, docField.key, testVal);
  app.fns.reconcileAllSyncGroups();
  eq(st.shared[sharedField.key], testVal, "reconcile: " + group.name + " Doc->shared." + sharedField.key);
});

console.log("== A1: DATA_SYNC_GROUPS — Doc-Feld existiert in DOCS-Definition ==");
// Jedes Doc-Mapping muss auf eine echte Section + Field-ID zeigen.
function fieldExistsInDoc(docId, key) {
  var doc = app.DOCS[docId];
  if (!doc) return false;
  var parts = key.split(".");
  var secId = parts[0], fieldId = parts[1];
  var sec = (doc.sections || []).find(function (s) { return s.id === secId; });
  if (!sec) return false;
  var inFields = (sec.fields || []).some(function (f) { return f.id === fieldId; });
  var inCols = (sec.columns || []).some(function (c) { return c.id === fieldId; });
  return inFields || inCols;
}
app.DATA_SYNC_GROUPS.forEach(function (group) {
  group.fields.forEach(function (f) {
    if (f.type !== "doc") return;
    ok(fieldExistsInDoc(f.docId, f.key), "Mapping-Ziel existiert: " + f.docId + "/" + f.key + " (" + group.name + ")");
  });
});

console.log("== A1: shared -> Adressbuch (syncSharedToContacts) ==");
// Therapeut-Beispiel aus dem Work Order: Dr. Test
(function () {
  var st = freshState();
  setDocField(st, "thera", "briefkopf.name", "Dr. Test");
  app.fns.reconcileAllSyncGroups();
  eq(st.shared.therapeut, "Dr. Test", "thera briefkopf.name -> shared.therapeut");
  var res = app.fns.syncSharedToContacts();
  ok(res.added >= 1, "syncSharedToContacts legt mind. 1 Kontakt an");
  var thera = (st.contacts || []).find(function (c) { return c.rolle === "therapeut"; });
  ok(!!thera, "Therapeut-Kontakt existiert");
  eq(thera && thera.name, "Dr. Test", "Therapeut-Kontakt name=Dr. Test");
})();

console.log("== A1: shared -> Adressbuch fuer alle gemappten Rollen ==");
// Fuer jede Rolle im CONTACT_SHARED_MAP: shared-Felder fuellen, sync, Kontakt pruefen.
Object.keys(app.CONTACT_SHARED_MAP).forEach(function (rolle) {
  var st = freshState();
  var map = app.CONTACT_SHARED_MAP[rolle];
  // Den shared-Key fuer "name" setzen
  st.shared[map.name] = "Name_" + rolle;
  st.shared[map.email] = rolle + "@test.example";
  var res = app.fns.syncSharedToContacts();
  var c = (st.contacts || []).find(function (x) { return x.rolle === rolle; });
  ok(!!c, "Rolle '" + rolle + "': Kontakt angelegt");
  eq(c && c.name, "Name_" + rolle, "Rolle '" + rolle + "': name gespiegelt");
  eq(c && c.email, rolle + "@test.example", "Rolle '" + rolle + "': email gespiegelt");
});

console.log("== A1: Kontakt -> shared (syncContactToShared) ==");
// Aenderung im Adressbuch zurueck in die Stammdaten.
Object.keys(app.CONTACT_SHARED_MAP).forEach(function (rolle) {
  var st = freshState();
  var map = app.CONTACT_SHARED_MAP[rolle];
  var contact = { id: "c_" + rolle, rolle: rolle, name: "Geaendert_" + rolle, email: "", telefon: "", firma: "", anschrift: "" };
  st.contacts = [contact];
  app.fns.syncContactToShared(contact);
  eq(st.shared[map.name], "Geaendert_" + rolle, "Rolle '" + rolle + "': Kontakt.name -> shared." + map.name);
});

console.log("== A1: Round-Trip Doc -> shared -> Kontakt -> shared ==");
(function () {
  var st = freshState();
  setDocField(st, "kosten", "anwaltskosten.verteidiger_name", "RA Mueller");
  app.fns.reconcileAllSyncGroups();
  eq(st.shared.anwalt, "RA Mueller", "RoundTrip: Doc -> shared.anwalt");
  app.fns.syncSharedToContacts();
  var anwalt = st.contacts.find(function (c) { return c.rolle === "anwalt"; });
  ok(!!anwalt, "RoundTrip: Anwalt-Kontakt existiert");
  // Im Kontakt aendern und zurueck syncen
  anwalt.name = "RA Schmidt";
  app.fns.syncContactToShared(anwalt);
  eq(st.shared.anwalt, "RA Schmidt", "RoundTrip: geaenderter Kontakt -> shared.anwalt");
})();

console.log("== A2: propagateFieldChange ==");
(function () {
  var st = freshState();
  // Therapeut-Telefon ueber propagateFieldChange setzen
  var n = app.fns.propagateFieldChange({ type: "shared", key: "therapeut_telefon" }, "0123-456");
  ok(n >= 1, "propagateFieldChange propagiert mind. 1 Feld");
  eq(st.docs.thera.answers["briefkopf.tel"], "0123-456", "propagate: shared.therapeut_telefon -> thera briefkopf.tel");
})();

console.log("\n== ERGEBNIS smoke_v338_sync ==");
console.log("PASS: " + pass + "  FAIL: " + fail);
if (fail > 0) { console.log("FEHLER:\n - " + fails.join("\n - ")); process.exit(1); }
console.log("Alle Sync-Asserts gruen.");
