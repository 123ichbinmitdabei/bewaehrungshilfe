# Changelog v3.39

**Art:** Härtungs- und Aufräum-Release (Nachtlauf). Keine neuen Endnutzer-Features.
**Datum:** 2026-06-19
**Basis:** v3.38 (311 Smoke-Asserts)
**Ergebnis:** 565 Smoke-Asserts gruen (311 Basis plus 254 neu), `node check_js.js` OK.

Aufteilung nach Autonomie-Zone: GRÜN frei gefixt, GELB konservativ mit Test, ROT nur dokumentiert (siehe `DEFERRED_v3.39.md`).

---

## GRÜN gefixt

### Logik / kaputte Handler
- **Verwaister Handler `openSavedSignaturePad()`** an 2 Buttons ("Unterschrift bearbeiten", "Jetzt einrichten") zeigte auf eine nicht existierende Funktion. Korrigiert auf die existierende `openSavedSignatureEditor()`. Per Handler-Integritaets-Regressionstest abgesichert.

### Toter Code entfernt (7 Funktionen, 1 Variable)
- `isIosSafari`, `isAndroidChrome` (Legacy-Helper, 0 Referenzen)
- `debouncedSaveInbox` plus `inboxSaveTimer` (nie aufgerufen; `saveInbox` wird direkt genutzt)
- `unDismissSetupChecklist` (nie verdrahtet)
- `tdEmpty`, `sectionIfHasContent`, `docxBlankCell` (0 Referenzen)

### Tote CSS-Regeln entfernt (3)
- `.confirm-overlay`, `.lang-toggle`, `.preview-zoom-wrap` (nur im `<style>`, kein Markup). Dynamisch erzeugte `.cat-*`-Klassen bewusst behalten.

### Verschluckte Fehler (leere catch-Blöcke)
- 11 leere `catch`-Blöcke mit aussagekräftigem `console.warn` versehen (Sync, Clipboard, Notification, Install-Banner, PIN-Status, Speicherverbrauch). Clipboard-Fallback meldet Fehlschlag jetzt auch dem Nutzer.

### Formatierung
- **90 em-dashes (U+2014) entfernt.** Prosa/Kommentare auf Kommas, Platzhalter-Glyphen auf en-dash (U+2013), in den Datums-Range-RegEx wurde das literale em-dash durch die Unicode-Escape-Sequenz (Backslash-u-2014) ersetzt (Funktion erhalten, kein literales U+2014 mehr). Regressionstest stellt 0 U+2014 in `index.html` sicher.

### Personendaten
- 2 Code-Kommentare mit realistisch aussehenden Beispiel-Identifikatoren (Aktenzeichen, Kassenzeichen) auf eindeutig synthetische Platzhalter umgestellt. Siehe `PERSONENDATEN_AUDIT_v3.39.md`.

### Testbarkeit
- `exportAllData` liefert das gebaute Dump-Objekt zurück (nicht-brechend, nur Testbarkeit, Backup-Format unveraendert).

---

## GELB gefixt (konservativ, mit Test)

### Dialog-Migration (Paket C)
Hartes Invariant geprueft: jede destruktive Aktion wird NUR nach Bestaetigung ausgefuehrt (Test: Bestaetigen fuehrt aus, Abbrechen nicht).
- Neues wiederverwendbares **`inputModal`** (Ersatz fuer `prompt()`, 16px-Font gegen iOS-Zoom).
- 5 destruktive `confirm()` auf das In-App-Modal `confirmAction` migriert: `deleteRow`, `deleteInboxItem`, `deleteSavedSignature`, `disablePin`, `resetSettingsToDefaults`.
- 1 `prompt()` (Zahlungsbetrag in `confirmPayment`) auf `inputModal` migriert.
- Verbleibende native `confirm()` bewusst belassen (nicht destruktiv, in Schleifen, mehrstufig oder fail-safe). Begruendung je Stelle in `CROSS_BROWSER_REPORT_v3.39.md`.

### Druck-Pfad (Paket C)
- `printFormular` nutzt jetzt dasselbe Reflow-Muster (`offsetHeight` + `requestAnimationFrame` + `setTimeout`) wie die anderen Druckpfade. Das war der letzte Druckpfad ohne Reflow und ein moeglicher Mitausloeser des Symptoms "Drucken reagiert nicht". Kein `window.open` mehr in irgendeinem Druckpfad.

### Robustheit (Paket D)
- **Storage-Quota:** zentraler `Storage`-Wrapper faengt `QuotaExceededError` (browseruebergreifend) ab und zeigt einen verstaendlichen, einmaligen Nutzerhinweis ("Speicher voll, Backup erstellen und aufraeumen"). Daten bleiben in der Sitzung erhalten. Kein stilles Scheitern. Schema unveraendert.
- **Lade-Guards:** neuer `safeJsonParse(raw, fallback, label)`; alle Startup-Parses in `loadAllState` laufen darueber. Korrupte Daten in einem Key fallen auf den Default genau dieses Keys zurueck, loggen die Korruption und machen NICHT die ganze App unbrauchbar. Andere Keys unberuehrt.
- **Eingabe-Validierung (nur Hinweis):** `validateIban` (inkl. Mod-97), `validateGermanDate` (Plausibilitaet inkl. Schaltjahr), `validateAmount` (deutsches Zahlenformat). Bei Ungueltigkeit dezenter visueller Hinweis (Tooltip plus Randfarbe), kein Blockieren der Eingabe, keine stille Korrektur gespeicherter Werte.

---

## ROT deferred (nur dokumentiert, nicht implementiert)

Siehe `DEFERRED_v3.39.md`. Kurz:
- Service-Worker-Aktivierung (Prototyp `sw.js` liegt bei, NICHT aktiviert, siehe `SW_PROPOSAL_v3.39.md`).
- Speicher-Schema-/Backup-Format-Optimierungen (z.B. Attachment-Kompression, IndexedDB) gegen Quota.
- Mehrstufige native Dialoge (Termin-/Zahlungs-Status, Import-Ueberschreiben) bewusst nativ belassen (fail-safe).
- Optionale CSS-Verbesserungen (`100dvh`, groessere Touch-Targets).

---

## Repo-Aufräumen (Paket E)
- `commit-message-v3.38.txt` entfernt (Scratch).
- `WORK_ORDER_v3.38.md` und `WORK_ORDER_v3.39_NACHTLAUF.md` nach `work-orders/` verschoben.
- `.gitignore` angelegt (`node_modules/`, `*.log`, `.DS_Store`, `Thumbs.db`, Temp-Dateien, `commit-message-*.txt`).
- Test-Harness und Smoke-Dateien bleiben im Root (Pfadlogik unveraendert).

---

## Tests

| Suite | Asserts | Status |
|---|---|---|
| `smoke_v338_sync.js` | 105 | gruen |
| `smoke_v338_full.js` | 206 | gruen |
| `smoke_v339_funktion.js` (Paket A) | 149 | gruen |
| `smoke_v339_logik.js` (Paket B) | 25 | gruen |
| `smoke_v339_dialoge.js` (Paket C) | 40 | gruen |
| `smoke_v339_robust.js` (Paket D) | 40 | gruen |
| **Summe** | **565** | **gruen** |

`node check_js.js`: OK. Kein U+2014 in `index.html` oder in den v3.39-Reports.

## Berichte dieser Release
- `FUNKTIONS_AUDIT_v3.39.md` (Paket A plus B)
- `CROSS_BROWSER_REPORT_v3.39.md` (Paket C)
- `PERSONENDATEN_AUDIT_v3.39.md` (Paket F)
- `SW_PROPOSAL_v3.39.md` (Paket G)
- `DEFERRED_v3.39.md` (ROT-Zone und offene Punkte)

## Bundle
- `index.html`: 815807 Bytes (~797 KB). Leichtes Wachstum gegenueber v3.38 (~788 KB) durch neue Robustheits-/Dialog-Infrastruktur, teilweise kompensiert durch entfernten toten Code.
