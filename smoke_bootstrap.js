// Smoke-Test-Bootstrap fuer den Bewaehrungshilfe-Assistenten (v3.38).
// Laedt das Inline-Script aus index.html in einen vm-Context mit gemockten
// Browser-Globals und stellt App-Funktionen/Konstanten ueber __APP bereit.
// Mocked Globals nutzen bewusst explizite function(){}-Syntax (keine Arrows).
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");

function makeStorageMock() {
  const store = {};
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; },
    clear: function () { for (const k in store) delete store[k]; },
    key: function (i) { return Object.keys(store)[i] || null; },
    get length() { return Object.keys(store).length; },
    __dump: function () { return store; },
  };
}

// Universelles, nachsichtiges DOM-Element-Mock. Unbekannte Methoden no-op,
// gibt sinnvolle Defaults zurueck, damit render() & Co. nicht crashen.
function makeEl(tag) {
  var el = {
    tagName: (tag || "div").toUpperCase(),
    nodeType: 1,
    children: [],
    childNodes: [],
    _attrs: {},
    dataset: {},
    style: {},
    classList: {
      add: function () {}, remove: function () {}, toggle: function () {},
      contains: function () { return false; },
    },
    innerHTML: "",
    outerHTML: "",
    textContent: "",
    value: "",
    checked: false,
    disabled: false,
    files: [],
    offsetHeight: 0, offsetWidth: 0, clientHeight: 0, clientWidth: 0,
    scrollHeight: 0, scrollTop: 0,
  };
  el.appendChild = function (c) { el.children.push(c); el.childNodes.push(c); return c; };
  el.removeChild = function (c) { var i = el.children.indexOf(c); if (i >= 0) el.children.splice(i, 1); return c; };
  el.remove = function () {};
  el.insertBefore = function (c) { el.children.push(c); return c; };
  el.replaceChild = function () {};
  el.cloneNode = function () { return makeEl(tag); };
  el.setAttribute = function (k, v) { el._attrs[k] = String(v); };
  el.getAttribute = function (k) { return Object.prototype.hasOwnProperty.call(el._attrs, k) ? el._attrs[k] : null; };
  el.removeAttribute = function (k) { delete el._attrs[k]; };
  el.hasAttribute = function (k) { return Object.prototype.hasOwnProperty.call(el._attrs, k); };
  el.addEventListener = function () {};
  el.removeEventListener = function () {};
  el.dispatchEvent = function () { return true; };
  el.querySelector = function () { return makeEl("div"); };
  el.querySelectorAll = function () { return []; };
  el.getElementsByTagName = function () { return []; };
  el.getElementsByClassName = function () { return []; };
  el.closest = function () { return null; };
  el.matches = function () { return false; };
  el.focus = function () {};
  el.blur = function () {};
  el.click = function () {};
  el.scrollIntoView = function () {};
  el.insertAdjacentHTML = function () {};
  el.getBoundingClientRect = function () { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; };
  el.getContext = function () { return null; };
  el.setSelectionRange = function () {};
  el.select = function () {};
  return el;
}

function makeDocument() {
  var byId = {};
  var doc = {
    title: "",
    cookie: "",
    readyState: "complete",
    getElementById: function (id) { if (!byId[id]) byId[id] = makeEl("div"); return byId[id]; },
    querySelector: function () { return makeEl("div"); },
    querySelectorAll: function () { return []; },
    getElementsByTagName: function () { return []; },
    getElementsByClassName: function () { return []; },
    createElement: function (t) { return makeEl(t); },
    createElementNS: function (ns, t) { return makeEl(t); },
    createDocumentFragment: function () { return makeEl("fragment"); },
    createTextNode: function (t) { return { nodeType: 3, textContent: String(t) }; },
    addEventListener: function () {},
    removeEventListener: function () {},
    execCommand: function () { return true; },
  };
  doc.body = makeEl("body");
  doc.head = makeEl("head");
  doc.documentElement = makeEl("html");
  return doc;
}

function makeContext() {
  var localStorageMock = makeStorageMock();
  var noopTimer = function () { return 0; };
  var documentMock = makeDocument();

  var navigatorMock = {
    userAgent: "node-smoke-test",
    language: "de-DE",
    languages: ["de-DE", "de"],
    onLine: true,
    standalone: false,
    // navigator.share bewusst NICHT gesetzt -> Fallback-Pfad testbar
    clipboard: { writeText: function () { return Promise.resolve(); } },
    serviceWorker: undefined,
  };

  var ctx = {
    console: console,
    JSON: JSON, Math: Math, Date: Date, RegExp: RegExp, Promise: Promise,
    Array: Array, Object: Object, String: String, Number: Number, Boolean: Boolean,
    Error: Error, parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN,
    encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    Map: Map, Set: Set, Symbol: Symbol, WeakMap: WeakMap,
    setTimeout: noopTimer, clearTimeout: function () {},
    setInterval: noopTimer, clearInterval: function () {},
    requestAnimationFrame: noopTimer, cancelAnimationFrame: function () {},
    queueMicrotask: function () {},
    localStorage: localStorageMock,
    document: documentMock,
    navigator: navigatorMock,
    alert: function () {}, confirm: function () { return true; }, prompt: function () { return ""; },
    fetch: function () { return Promise.reject(new Error("fetch disabled in smoke test")); },
    btoa: function (s) { return Buffer.from(String(s), "binary").toString("base64"); },
    atob: function (s) { return Buffer.from(String(s), "base64").toString("binary"); },
    URL: { createObjectURL: function () { return "blob:mock"; }, revokeObjectURL: function () {} },
    Blob: function () { return { size: 0, type: "" }; },
    FileReader: function () { return { readAsDataURL: function () {}, readAsText: function () {} }; },
    Image: function () { return makeEl("img"); },
    Notification: undefined,
    crypto: {
      getRandomValues: function (arr) { for (var i = 0; i < arr.length; i++) arr[i] = (i * 2654435761) % 256; return arr; },
    },
  };

  var windowMock = {
    location: { href: "https://example.test/bewaehrungshilfe/", hash: "", search: "", origin: "https://example.test", pathname: "/bewaehrungshilfe/", reload: function () {} },
    navigator: navigatorMock,
    localStorage: localStorageMock,
    document: documentMock,
    innerWidth: 1024, innerHeight: 768, devicePixelRatio: 1,
    matchMedia: function () { return { matches: false, addEventListener: function () {}, removeEventListener: function () {}, addListener: function () {}, removeListener: function () {} }; },
    addEventListener: function () {}, removeEventListener: function () {},
    requestAnimationFrame: noopTimer, cancelAnimationFrame: function () {},
    setTimeout: noopTimer, clearTimeout: function () {},
    print: function () {}, alert: function () {}, confirm: function () { return true; }, prompt: function () { return ""; },
    open: function () { return null; },
    scrollTo: function () {}, scroll: function () {},
    getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; },
    storage: undefined, // -> Storage.hasClaude = false
    print: function () {},
  };
  windowMock.window = windowMock;
  windowMock.self = windowMock;
  ctx.window = windowMock;
  ctx.self = windowMock;
  ctx.globalThis = ctx;
  ctx.global = ctx;

  // Event-Konstruktor (renderlogik nutzt new Event(...))
  ctx.Event = function (type) { return { type: type, bubbles: false }; };
  ctx.CustomEvent = function (type, opts) { return { type: type, detail: opts && opts.detail }; };

  return ctx;
}

function extractInlineJs(html) {
  var open = html.indexOf("<script>");
  var close = html.lastIndexOf("</script>");
  if (open === -1 || close === -1) throw new Error("Kein <script>-Block in index.html gefunden");
  return html.slice(open + "<script>".length, close);
}

function loadApp() {
  var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  var js = extractInlineJs(html);

  // Auto-Init-IIFE entfernen, damit kein render() auf leerem State laeuft.
  js = js.replace(/\(async \(\) => \{\s*if \(!checkBrowserCompat\(\)\) return;[\s\S]*?\n\}\)\(\);/, "/* auto-init removed for smoke test */");

  // Export-Block: alle benoetigten Symbole nach __APP heben.
  var exportBlock = "\n;try { __APP = {" +
    "getState: function(){ return state; }," +
    "setState: function(s){ state = s; }," +
    "resetState: function(){ state = makeDefaultStateForSmoke(); }," +
    "Storage: Storage, memStorage: memStorage," +
    "DOCS: DOCS, DATA_SYNC_GROUPS: DATA_SYNC_GROUPS, CONTACT_SHARED_MAP: CONTACT_SHARED_MAP," +
    "ANSCHREIBEN_TEMPLATES: ANSCHREIBEN_TEMPLATES, CONTACT_ROLES: CONTACT_ROLES," +
    "keys: { SHARED_STORAGE_KEY: SHARED_STORAGE_KEY, CONTACTS_STORAGE_KEY: CONTACTS_STORAGE_KEY," +
      "BRIEF_HISTORY_KEY: BRIEF_HISTORY_KEY, CUSTOM_TEMPLATES_KEY: CUSTOM_TEMPLATES_KEY," +
      "TERMIN_PREP_KEY: TERMIN_PREP_KEY, BACKUP_REMINDER_KEY: BACKUP_REMINDER_KEY," +
      "NOTIF_ENABLED_KEY: NOTIF_ENABLED_KEY, NOTIF_SHOWN_KEY: NOTIF_SHOWN_KEY," +
      "NOTES_STORAGE_KEY: NOTES_STORAGE_KEY, INBOX_STORAGE_KEY: INBOX_STORAGE_KEY," +
      "PIN_STORAGE_KEY: PIN_STORAGE_KEY, SETTINGS_STORAGE_KEY: SETTINGS_STORAGE_KEY," +
      "THEME_STORAGE_KEY: THEME_STORAGE_KEY }," +
    "fns: { render: render, renderWizard: renderWizard, manualSyncFromDocs: manualSyncFromDocs," +
      "reconcileAllSyncGroups: reconcileAllSyncGroups, syncSharedToContacts: syncSharedToContacts," +
      "syncContactToShared: syncContactToShared, propagateFieldChange: propagateFieldChange," +
      "deleteContact: deleteContact, addContact: addContact, updateContactField: updateContactField," +
      "deleteCustomTemplate: deleteCustomTemplate, computeSetupChecklist: computeSetupChecklist," +
      "collectTimelineEvents: collectTimelineEvents, renderTimelineView: renderTimelineView," +
      "computeAchievements: computeAchievements, notifSupported: notifSupported," +
      "notifIsEnabled: notifIsEnabled, scheduleNotifChecks: scheduleNotifChecks," +
      "exportAllData: exportAllData, saveContacts: saveContacts," +
      "_readSyncField: _readSyncField, _writeSyncField: _writeSyncField," +
      "getBriefSignatureHtml: getBriefSignatureHtml, restoreCustomTemplatesIntoTemplates: restoreCustomTemplatesIntoTemplates," +
      "renderContactsView: renderContactsView, renderHome: renderHome," +
      "renderBriefHistoryView: renderBriefHistoryView, renderSettingsView: renderSettingsView," +
      "renderHelpView: renderHelpView, renderAnschreibenView: renderAnschreibenView," +
      "renderImportView: renderImportView, renderInboxView: renderInboxView," +
      "renderBelegeView: renderBelegeView, renderPreviewToolbar: renderPreviewToolbar," +
      "getAnswer: getAnswer, setAnswer: setAnswer, getDocState: getDocState," +
      "getRows: getRows, setRows: setRows," +
      "buildIcsEvent: buildIcsEvent, buildEventFromRow: buildEventFromRow," +
      "escapeIcs: escapeIcs, toIcsDate: toIcsDate, parseDateGuess: parseDateGuess," +
      "runGlobalSearch: runGlobalSearch, openGlobalSearch: openGlobalSearch," +
      "confirmAction: confirmAction, runConfirmAction: runConfirmAction, closeConfirmModal: closeConfirmModal," +
      "confirmAsync: confirmAsync, confirmAppointment: confirmAppointment, handleSozialDone: handleSozialDone," +
      "showNextModal: showNextModal, getModalQueueLength: function(){ return modalQueue.length; }, clearModalQueue: function(){ modalQueue.length = 0; }," +
      "resetAppCache: resetAppCache, isOwnBhCache: isOwnBhCache, isOwnBhScope: isOwnBhScope," +
      "inputModal: inputModal, submitInputModal: submitInputModal, closeInputModal: closeInputModal, setInputModalValue: setInputModalValue," +
      "deleteRow: deleteRow, deleteInboxItem: deleteInboxItem, deleteSavedSignature: deleteSavedSignature," +
      "resetSettingsToDefaults: resetSettingsToDefaults, confirmPayment: confirmPayment," +
      "removeFromInbox: removeFromInbox, _registerActionRef: _registerActionRef," +
      "safeJsonParse: safeJsonParse, isQuotaError: isQuotaError," +
      "validateIban: validateIban, validateGermanDate: validateGermanDate," +
      "validateAmount: validateAmount, validationHintForField: validationHintForField }" +
    "}; } catch(e) { __APP_ERR = e.message + '\\n' + (e.stack||''); }";

  // Separat (eigener try/catch), damit ein fehlender Testmodus-Symbolname NIE
  // die bestehenden Smoke-Tests bricht. Nur smoke_v342 nutzt __APP.testmodus.
  exportBlock += "\n;try { if (__APP) { __APP.testmodus = {" +
    "TEST_CASES: TEST_CASES, TM_STATI: TM_STATI, BH_TEST_RESULTS_KEY: BH_TEST_RESULTS_KEY," +
    "tmScaledSize: tmScaledSize, tmBuildExportJson: tmBuildExportJson, tmBuildHtmlReport: tmBuildHtmlReport," +
    "tmBuildTestdaten: tmBuildTestdaten, tmSummary: tmSummary, tmSetStatus: tmSetStatus, tmSetNote: tmSetNote," +
    "tmLoadResults: tmLoadResults, tmGetState: function(){ return tmState; }, tmSetState: function(s){ tmState = s; }" +
    "}; } } catch(e) { __APP_TM_ERR = e.message + '\\n' + (e.stack||''); }";

  js += exportBlock;

  var ctx = makeContext();
  ctx.__APP = null;
  ctx.__APP_ERR = null;
  ctx.__APP_TM_ERR = null;
  // Hilfsfunktion fuer resetState (Default-State Klon)
  ctx.makeDefaultStateForSmoke = function () {
    return {
      view: "home", activeDocId: null, shared: {}, theme: "light",
      printWithAttachments: true, printLanguage: "de", rowSearch: {},
      notes: [], inbox: [], pinLocked: false,
      lastBackupAt: null, lastChangeAt: null, backupReminderSnoozedUntil: null,
      settings: { hiddenDocs: [], backupReminderDays: 14, showInstallBanner: true, showBackupReminder: true, showTodayOverview: true, showNextAppointments: true, showBewaehrungProgress: true, showAchievements: true, showStats: true, showQuickAdd: true },
      contacts: [], customTemplates: {}, terminPrep: {}, briefHistory: [],
      docs: {},
    };
  };

  vm.createContext(ctx);
  vm.runInContext(js, ctx, { filename: "index.html.inline.js" });

  if (ctx.__APP_ERR) throw new Error("Export-Block-Fehler:\n" + ctx.__APP_ERR);
  if (!ctx.__APP) throw new Error("__APP wurde nicht gesetzt");
  return { ctx: ctx, app: ctx.__APP };
}

module.exports = { loadApp: loadApp, makeEl: makeEl };
