# Funktions-Vollaudit v3.39

**Projekt:** Bewährungshilfe-Assistent (Single-File PWA, `index.html`)
**Stand:** v3.39 Härtungs-Release (Nachtlauf)
**Methodik:** Statische Analyse plus dynamischer Selbsttest unter Node mit gemocktem Browser-Harness (`smoke_bootstrap.js`). Jede Funktion wird entweder direkt durch einen Smoke-Test ausgeführt oder über eine Referenzprüfung im gesamten Quelltext (Code und String-Kontext) verifiziert.

Dieser Bericht deckt Paket A (Funktions-Vollaudit) und Paket B (Logik, Dead-Code, Konsistenz) ab.

---

## 1. Inventar

| Kategorie | Anzahl | Details |
|---|---|---|
| Wizards (`DOCS`) | 10 | ear, zeit, thera, schadens, sozial, uebersicht, bhtermine, kosten, asservate, ziele |
| Sektionen gesamt | 83 | je Wizard 1 bis 19 Sektionen |
| Einzelfelder gesamt | 306 | Text, Zahl, Datum, Auswahl, Textarea, Checkbox |
| Tabellen-Spalten gesamt | 107 | dynamische Zeilenfelder |
| Sync-Gruppen (`DATA_SYNC_GROUPS`) | 14 | bidirektional Doc zu Shared |
| Kontakt-Rollen (`CONTACT_SHARED_MAP`) | 10 | bh, anwalt, therapeut, gerichtskasse, staatsanwaltschaft, gericht, jobcenter, sozialberatung, arbeitgeber, polizei |
| Anschreiben-Vorlagen (`ANSCHREIBEN_TEMPLATES`) | 13 | inkl. mehrstufiger Geldstrafen-Vorlagen |
| Hauptansichten (Views) | 11 | home, contacts, briefHistory, timeline, settings, anschreiben, belege, inbox, import, help, preview |
| Funktionsdefinitionen (JS) | 423 | siehe vollständige Liste in Abschnitt 6 |

### DOCS im Detail

| Doc | Titel | Sektionen | Felder | Spalten |
|---|---|---|---|---|
| ear | Einnahmen-Ausgaben-Rechnung | 19 | 120 | 4 |
| zeit | Zeitstrahl / Lebensverlauf | 11 | 11 | 46 |
| thera | Therapie-Terminbestätigung | 9 | 22 | 6 |
| schadens | Schadenswiedergutmachung | 7 | 23 | 5 |
| sozial | Sozialstunden-Nachweis | 7 | 20 | 7 |
| uebersicht | Status-Übersicht | 1 | 0 | 0 |
| bhtermine | BH-Termine und Gespräche | 6 | 9 | 8 |
| kosten | Verfahrenskosten und Geldstrafe | 11 | 56 | 12 |
| asservate | Beweismittel und Asservate | 8 | 42 | 11 |
| ziele | Meine Ziele | 4 | 3 | 8 |

---

## 2. Render-Vollabdeckung (A2)

Jede Hauptansicht und jeder Wizard wurde im leeren (frischer State) und im gefüllten Zustand gerendert. Assertion: kein Crash, HTML-String wird geliefert.

| Bereich | leerer State | gefüllter State | Ergebnis |
|---|---|---|---|
| 11 Hauptansichten | gerendert | gerendert | ok |
| 10 Wizards | gerendert + HTML | gerendert | ok |
| 13 Anschreiben-Vorlagen `body()` | gerendert (in `smoke_v338_full`) | – | ok |

Test: `smoke_v339_funktion.js` Module A2a (31 Asserts) und A2b (21 Asserts). Kein Render-Crash gefunden.

---

## 3. Feld-Roundtrip (A3)

Pro Wizard wurde mindestens ein Textfeld und eine dynamische Tabellenzeile getestet: Wert setzen über `setAnswer` / `setRows`, neu lesen über `getAnswer` / `getRows`, Wert muss erhalten bleiben.

| Wizard | Textfeld-Roundtrip | Zeilen-Roundtrip | Ergebnis |
|---|---|---|---|
| ear | personal.name | haushalt_ein.name | ok |
| zeit | personal.name | wohnungen.von | ok |
| thera | briefkopf.name | termine.datum | ok |
| schadens | personal.name | zahlungen.datum | ok |
| sozial | personal.name | stunden.datum | ok |
| bhtermine | personal.name | termine.datum | ok |
| kosten | personal.name | weitere_kosten.art | ok |
| asservate | personal.name | gegenstaende.bezeichnung | ok |
| ziele | personal.name | ziele.bezeichnung | ok |
| uebersicht | (keine Felder) | (keine Zeilen) | n/v |

Test: `smoke_v339_funktion.js` Modul A3 (27 Asserts). Alle Roundtrips erhalten den Wert.

---

## 4. Sync-Vollabdeckung (A4)

Alle 14 `DATA_SYNC_GROUPS` wurden bidirektional getestet (Doc zu Shared und Shared zurück zu Doc über `reconcileAllSyncGroups`). Zusätzlich Adressbuch zu Shared für alle 10 Rollen über `syncContactToShared`. Jeder Mapping-Pfad zeigt auf ein existierendes Feld (geprüft in `smoke_v338_full` Modul D2, 14 Gruppen, alle gültig, keine Regression zu v3.36).

| Sync-Gruppe | Shared-Key | Doc-Ziel | Doc zu Shared | Shared zu Doc |
|---|---|---|---|---|
| Therapeut-Name | therapeut | thera/briefkopf.name | ok | ok |
| Therapeut-Telefon | therapeut_telefon | thera/briefkopf.tel | ok | ok |
| Therapeut-Email | therapeut_email | thera/briefkopf.email | ok | ok |
| Therapeut-Anschrift | therapeut_anschrift | thera/briefkopf.praxis | ok | ok |
| Anwalt-Name | anwalt | kosten/anwaltskosten.verteidiger_name | ok | ok |
| Gerichtskasse-Behörde | gerichtskasse | kosten/verfahren.behoerde_kasse | ok | ok |
| Gerichtskasse-Anschrift | gerichtskasse_anschrift | kosten/verfahren.behoerde_kasse_anschrift | ok | ok |
| Kassenzeichen | kassenzeichen | kosten/verfahren.az_landesjustizkasse | ok | ok |
| Staatsanwaltschaft-Behörde | staatsanwaltschaft | kosten/verfahren.behoerde_sta | ok | ok |
| Staatsanwaltschaft-Anschrift | staatsanwaltschaft_anschrift | kosten/verfahren.behoerde_sta_anschrift | ok | ok |
| Aktenzeichen StA | aktenzeichen_sta | kosten/verfahren.az_sta | ok | ok |
| Aktenzeichen Gericht | aktenzeichen_gericht | kosten/verfahren.az_gericht | ok | ok |
| Arbeitgeber-Firma | arbeitgeber | kosten/erklaerung_wirtschaft.arbeitgeber | ok | ok |
| Arbeit-Lohn-Netto | arbeit_lohn_netto | ear/arbeit.lohn | ok | ok |

Test: `smoke_v339_funktion.js` Modul A4 (38 Asserts) plus `smoke_v338_sync.js` (105 Asserts). Kein toter Sync-Pfad gefunden.

---

## 5. Pipelines (A5)

| Pipeline | Prüfung | Ergebnis |
|---|---|---|
| Brief-Erstellung mit Vorlage | alle 13 `body()` liefern String ohne Crash | ok |
| Signatur-Einbettung | `getBriefSignatureHtml` enthält Namen bei gesetzter Signatur, leer ohne | ok |
| Druck-Container-Aufbau | `renderPreviewToolbar`, `openPrintWindow` Reflow-Struktur (offsetHeight + requestAnimationFrame, kein `window.open`) | ok |
| ICS / Kalender-Export | `buildIcsEvent` liefert gültigen VEVENT (BEGIN/END, UID, DTSTART/DTEND, SUMMARY), `escapeIcs` maskiert Komma/Semikolon/Newline, `toIcsDate` Format YYYYMMDDTHHMMSS | ok |
| Achievements-Trigger | `computeAchievements` zählt wahrgenommene Termine und Sozialstunden korrekt | ok |
| Timeline-Filter | `collectTimelineEvents` + `renderTimelineView` mit allen Filtern ohne Crash | ok |
| Setup-Checkliste | `computeSetupChecklist` liefert 8 Items, Fortschritt reagiert auf State | ok |
| Globale Suche | `runGlobalSearch` findet Notizen und Doc-Antworten, leer bei keinem Treffer | ok |
| Backup-Export + Re-Import | `exportAllData` liefert vollständiges Dump-Objekt, JSON-Roundtrip parsebar, Re-Import in frischen State tief identisch (shared, docs, contacts, notes, customTemplates, theme) | ok |

Test: `smoke_v339_funktion.js` Module A5a bis A5d (32 Asserts).

**Hinweis A5 Backup:** `exportAllData` gibt jetzt das gebaute Dump-Objekt zurück (GRÜN, nicht-brechende Ergänzung allein zur Testbarkeit, Backup-Format unverändert). Die Re-Import-Logik in `triggerImport` bleibt unverändert (ROT-Zone Backup-Format), der Identitätstest spiegelt die dort implementierte Merge-Logik im Test wider.

---

## 6. Vollständige Funktions-Matrix

423 Funktionsdefinitionen. Verifikation: jede Funktion wird über die Referenzzählung im gesamten Quelltext (Code plus String-Kontext: `onclick`, Template-Literale) als referenziert/erreichbar bestätigt oder als tot markiert. Funktionen aus den getesteten Pipelines (Render, Sync, ICS, Suche, Achievements, Timeline, Checkliste, Export, Storage) sind zusätzlich dynamisch ausgeführt.

**Ergebnis:** 416 referenziert/erreichbar, 7 ohne Referenz (siehe Dead-Code unten). 0 Funktionen mit Bug, der nicht gefixt wurde.

<details>
<summary>Alle 423 Funktionsnamen (alphabetisch)</summary>

```
_doPrintAnschreiben _getActionRef _loadNotifShown _readSyncField _registerActionRef _registerSigOpts
_saveNotifShown _writeSyncField ablaufSec addContact addCustomTemplate addNote addPrepItem addRow
analyzeInboxPdfText analyzeNewInboxPdfs applyAvgCalculator applyDocImport applyDocImportNow
applyReschedule applySearchFilter applyTheme attachAutoFormatListeners attachListeners autoFormatDate
autoFormatTime beamteSec blockText buildAnschreibenDataDict buildAsservateDocx buildBhtermineDocx buildCell
buildDocBlob buildDocBundleZip buildEarDocx buildEmailBody buildEventFromRow buildIcsEvent buildKostenDocx
buildMoneyRows buildSchadensDocx buildSozialDocx buildTheraDocx buildZeitDocx calcStorageUsage
calculateNetHours cancelPinRecovery cancelPinSetup cancelSignaturePad checkBrowserCompat
checkNoteSuggestionsAfterTermin checkPin checkPinRecovery checkUpcomingTermineForNotif classifyDate
clearSignaturePad closeAddCustomTpl closeAvgCalculator closeBelegeManager closeConfirmModal
closeExtractedTextModal closeGlobalSearch closeInboxModal closeLightbox closePreview closeQuickAdd
closeRescheduleDialog closeResetModal collectDeviceFingerprint collectDocAttachments collectTimelineEvents
compressImage computeAchievements computeKostenForecast computeNetHours computeSetupChecklist confirmAction
confirmAddCustomTpl confirmAndPrint confirmAppointment confirmPayment confirmReset copyAnschreibenToClipboard
copyAppUrl copyExtractedText countAllAttachments countDoneSections dataUrlToBytes dataUrlToUint8Array
daysUntil debouncedSave debouncedSaveInbox deleteAttachment deleteBriefHistory deleteContact
deleteCustomTemplate deleteInboxItem deleteNote deletePrepItem deleteRow deleteSavedSignature describeKey
disableNotifications disablePin dismissInstallBanner dismissSetupChecklist dispatchSignDoc dispatchSignRow
docxBase docxBlankCell docxCell docxH1 docxP docxSignature docxSignatureBlock downloadAnschreibenTxt
downloadAttachment downloadDocBundle downloadIcs emailAnschreiben emailDocument enableNotifications
ensureSignaturesObj esc escapeIcs exportActionToCalendar exportAllData exportAllTermineToCalendar
exportAllToCalendar exportNextBhTerminToCalendar exportRowToCalendar extractPdfTextFromAttachment filterPairs
findNextFutureRow finishOnboarding fmtH fmtSigTimestamp formatMoney generateDoc generateQrCode getAnswer
getAttachments getAvailableAttachments getBackupReminderInfo getBriefSignatureHtml getChecks getCurrentAppUrl
getDeadlineInfo getDocAnswer getDocState getInstallInstructions getPinRecoveryQuestion getPlatformInfo
getPrepItems getPrepKey getRowSearch getRowSignature getRows getRowsFor getSelectedAttachmentIds getShared
getSharedKey getSignature getTodayOverview getXY goHome handleAttachmentUpload handleImportUpload
handleInboxUpload handleSignatureUpload handleSozialDone hashPin importBackToTypes importEditValue
importPickType importReset importToggleField inboxCount inboxModalBack inboxModalRoute
inboxModalSelectCategory inlinePdfPlaceholders isAndroidChrome isArchived isDateInPast
isDocHidden isIosSafari isSetupChecklistDismissed isSkipped isStandaloneApp isStatusHandled jumpTo
loadAllState loadDocxLib loadJSZipLib loadPdfJsLib loadTesseractLib manualSyncFromDocs markBackupDone
markDataChanged moneyOnly normalizeSignatureImage notifIsEnabled
notifSupported ocrImageDataUrl ocrPdfAttachment openAvgCalculator openBelegeManager openDoc openDocPreview
openGlobalSearch openInboxModal openPreview openPrintWindow openQuickAdd openRescheduleDialog
openSavedSignatureEditor openSignaturePad pad parseDateGuess parseMoney parseTime parseTimeStr
persistBackupReminder persistSettings prev printAnschreiben printFormular propagateFieldChange
quickAddSubmit quickAddTerminSubmit quickPdf readAsDataUrl reconcileAllSyncGroups recordBriefSent
removeFromInbox removePin removeRowSignature removeSignature render renderAchievementsBox
renderAddCustomTplModal renderAnschreibenView renderAttachmentForPrint renderAvgCalculatorModal
renderBackupReminder renderBelegeView renderBriefHistoryView renderCheckboxSection renderConfirmModal
renderContactsView renderErklaerungFormHtml renderExtractedTextModal renderFieldsSection
renderGlobalSearchModal renderHelpView renderHome renderImportView renderInboxModal renderInboxView
renderItem renderKostenForecastCard renderNav renderNextAppointmentsCard renderOnboardingModal
renderPdfAttachmentToPageImages renderPinLock renderPreviewToolbar renderPrintAsservate renderPrintBhtermine
renderPrintEAR renderPrintKosten renderPrintRowSignature renderPrintSchadens renderPrintSignatures
renderPrintSozial renderPrintThera renderPrintUebersicht renderPrintVerificationFooter renderPrintView
renderPrintZeit renderPrintZiele renderQuickAddModal renderQuickAddTerminModal renderResetModal renderReview
renderRowsSection renderSettingsView renderSetupChecklist renderSignatureBlock renderSignaturesSection
renderTerminPrepWidget renderTimelineView renderTodayActions renderTodayOverview renderWizard
reschedule resetActiveDoc resetSettingsToDefaults restoreCustomTemplatesIntoTemplates routeFromInbox
rowMatchesSearch runConfirmAction runGlobalSearch saveActiveDoc saveAndRefresh
saveBriefHistory saveContacts saveCustomTemplates saveErklaerungField saveInbox saveNotes saveSignaturePad
saveTerminPrep saveUploadedSignature schaedenSec scheduleNotifChecks sectionIfHasContent sectionStatus
selectAnschreiben selectSearchResult setAddCustomTplCat setAddCustomTplTitle setAnswer setArchived
setAttachments setGlobalSearchQuery setPin setPinRecovery setQuickAddTerminKind setRowSearch setRows
setSetting setSignature setupSignatureCanvas shareAppUrl shareAttachment shareDocument
shiftAttachmentsAfterRowDelete shortenUA shouldShowBackupReminder showLightbox showSaveToast
signDocument signRow skipAll skipOnboarding skipRecoverySetup snoozeBackupReminder
startDocImport startOcrForDocAttachment startOcrForInboxItem startOnboarding startPinRecovery startPinSetup
statusBadge submitPin submitRescheduleDialog suggestInboxCategory switchSigMode
syncContactToShared syncSharedToContacts tabBtn tdEmpty toIcsDate todayDE todayISO
toggleAnschreibenAttachment toggleAnschreibenCat toggleBriefSignature toggleCheck toggleCheckOption
toggleHiddenDoc toggleNoteDone toggleNoteLabel togglePrepItem togglePrintAttachments toggleShowArchived
toggleSkip toggleTheme triggerImport unDismissSetupChecklist updateAvgPreview
updateBriefHistoryStatus updateContactField updateCustomTemplateText updateSaveIndicator updateSearchInfo
useSavedSignature valOrSkipPrint viewAttachment viewExtractedText zeugenSec
```
(plus diverse lokale Helfer-Arrows: `cb`, `ans`, `inp`, `line`, `end`, `start`, `move`, `norm`, `ta`, `v`, `S`, `infoTbl`, `hhTable`, `moneyTable`, `moneyTbl`, `pairsTable`, `rowsTable`, `rowsTbl`, `totalsBySide`, `tdLabel`, `tdValue`, `sigBlock`, `sortKey`, `statusOrder`, `showToggle`, `fmtH`, `tryNext`)

</details>

---

## 7. Befunde Funktions-Audit (A6)

| Funktion / Bereich | geprüft | Ergebnis | Fix |
|---|---|---|---|
| Render aller Views (leer + gefüllt) | ja | ok | – |
| Render aller Wizards (leer + gefüllt) | ja | ok | – |
| Feld-Roundtrip alle 9 Daten-Wizards | ja | ok | – |
| Sync alle 14 Gruppen bidirektional | ja | ok | – |
| Adressbuch-Sync alle 10 Rollen | ja | ok | – |
| ICS / VCALENDAR-Pipeline | ja | ok | – |
| Globale Suche | ja | ok | – |
| Achievements / Checkliste / Timeline | ja | ok | – |
| Backup-Export + Re-Import-Identität | ja | ok | exportAllData liefert Dump zurück (GRÜN, testbarkeit) |
| Handler `openSavedSignaturePad()` (2 Buttons) | ja | bug (Funktion existiert nicht) | GRÜN gefixt: zeigt auf `openSavedSignatureEditor()` (siehe Paket B) |

Im funktionalen Audit wurde kein Renderfehler, kein Sync-Bruch und kein Pipeline-Crash gefunden. Der einzige funktionale Bug (verwaister Handler) wird in Paket B behandelt.

---

## 8. Logik und Cleanup (Paket B)

### B1 Handler-Integrität

Alle `onclick`/`onchange`/`oninput`/`onsubmit`/`onkeydown`/... Handler im gesamten HTML (inkl. Template-Literale) wurden eingesammelt, die aufgerufenen Funktionsnamen extrahiert (ohne Methodenaufrufe nach `.`) und gegen die 423 Funktionsdefinitionen geprüft.

| Befund | Status | Fix |
|---|---|---|
| `openSavedSignaturePad()` an 2 Buttons (Unterschrift bearbeiten / Jetzt einrichten), Funktion existiert nicht | bug | GRÜN gefixt: beide Buttons zeigen jetzt auf die existierende `openSavedSignatureEditor()` |
| Alle übrigen Handler | ok | – |

Regressionstest: `smoke_v339_logik.js` B1 scannt mehr als 100 Handler und schlägt fehl, sobald ein Handler auf eine nicht existierende Funktion zeigt.

### B2 Tote Funktionen

Referenzzählung über die gesamte Datei (Code plus String-Kontext). Eine Funktion gilt nur bei exakt einer Gesamt-Vorkommnis (= nur die Definition) als tot.

| Funktion | Vorkommen | Fix |
|---|---|---|
| `isIosSafari` | 1 (Legacy-Helper) | GRÜN entfernt |
| `isAndroidChrome` | 1 (Legacy-Helper) | GRÜN entfernt |
| `debouncedSaveInbox` (+ Variable `inboxSaveTimer`) | 1 | GRÜN entfernt (saveInbox wird direkt aufgerufen) |
| `unDismissSetupChecklist` | 1 | GRÜN entfernt (nie verdrahtet) |
| `tdEmpty` | 1 | GRÜN entfernt |
| `sectionIfHasContent` (nested) | 1 | GRÜN entfernt |
| `docxBlankCell` | 1 | GRÜN entfernt |

`docxSignature` (7 Vorkommen) wurde fälschlich vom ersten Scan markiert, ist aber aktiv genutzt, daher behalten.

### B3 Tote CSS-Selektoren

223 Klassen im `<style>`. Abgleich gegen Markup und dynamisch erzeugte HTML-Strings.

| Selektor | Befund | Fix |
|---|---|---|
| `.cat-after`, `.cat-bh`, `.cat-misc` | dynamisch erzeugt über `cat-${n.category}` (Notiz-Kategorien) | behalten |
| `.confirm-overlay` | nur in `<style>`, kein Markup | GRÜN entfernt |
| `.lang-toggle` | nur in `<style>`, kein Markup | GRÜN entfernt |
| `.preview-zoom-wrap` (+ Kind-Selektor) | nur in `<style>`, kein Markup | GRÜN entfernt |

### B4 Doppelte DOM-IDs

5 statische IDs erscheinen mehrfach im Quelltext, jeweils in sich gegenseitig ausschließenden Render-Zweigen, daher KEIN Laufzeit-Konflikt:

| ID | Kontext | Bewertung |
|---|---|---|
| `qa-datum` | Legacy-QuickAdd-Modal vs. Termin-Modal (`renderQuickAddModal` gibt genau eines zurück) | kein Laufzeit-Duplikat, belassen |
| `qa-uhrzeit`, `qa-art`, `qa-notiz` | unterschiedliche `kind`-Zweige (thera/bhtermine/sozial) desselben Modals, nur einer aktiv | kein Laufzeit-Duplikat, belassen |
| `timeline-today` | durch `injectedToday`-Flag gesteuert: Marker wird genau einmal eingefügt (im Loop ODER als Fallback) | kein Laufzeit-Duplikat, belassen |

Eine Vereindeutigung würde die `getElementById`-Leselogik (`quickAddSubmit`, Scroll-to-today) ohne Nutzen gefährden. Fail-safe vor Kosmetik: belassen und dokumentiert.

### B5 State-Konsistenz

Default-State hat die Top-Level-Schlüssel view, activeDocId, shared, theme, printWithAttachments, printLanguage, rowSearch, notes, inbox, pinLocked, lastBackupAt, lastChangeAt, backupReminderSnoozedUntil, settings, docs. Laufzeit-Felder (contacts, customTemplates, briefHistory, terminPrep, timelineFilter) werden in `loadAllState` aus localStorage gefüllt und in jedem Renderer defensiv mit `if (!state.x) state.x = ...` bzw. `state.x || []` abgesichert. Test mit nacktem Default-State (ohne diese Felder): alle 11 Views und 10 Wizards rendern ohne Crash. Kein toter State-Zugriff gefunden.

### B6 Debug-Reste

`console.log`: 0, `console.debug`: 0, `console.info`: 0, `TODO`/`FIXME`/`XXX`: 0. Nichts zu entfernen. `console.error`/`console.warn` für echte Fehlerpfade bleiben erhalten.

### B7 Verschluckte Fehler (leere catch-Blöcke)

Leere `catch`-Blöcke wurden mit `console.warn` ergänzt, damit Fehler nicht mehr still verschluckt werden:

| Ort | Ergänzung |
|---|---|
| Clipboard-Fallback (`execCommand copy`) | `console.warn` plus Nutzerhinweis (alert) bei Fehlschlag |
| `syncSharedToContacts`/`reconcileAllSyncGroups` (Onboarding, Adressbuch, Wizard) | `console.warn` mit Kontext |
| `propagateFieldChange` (Kontaktfeld) | `console.warn` |
| Termin-Benachrichtigung, Install-Banner-Render, PIN-Status-Lesen (2x), Speicherverbrauch-Berechnung | `console.warn` mit Kontext |

Die `catch`-Blöcke rund um `localStorage.setItem` und `JSON.parse` werden in Paket D (Robustheit) mit Quota-Behandlung bzw. Parse-Guards plus Nutzermeldung behandelt, nicht nur mit `console.warn`.

### Cleanup-Zusammenfassung Paket B

- 7 tote Funktionen plus 1 tote Variable entfernt
- 3 tote CSS-Regeln entfernt
- 1 kaputter Handler repariert (GRÜN)
- 11 leere catch-Blöcke mit aussagekräftigem `console.warn` versehen
- 0 verbleibende verwaiste Handler (per Regressionstest abgesichert)

Tests: `smoke_v339_logik.js` (24 Asserts, grün).
