# Changelog v3.40

**Art:** Restpakete plus ausführlicher Test. Zwei Phasen: Phase 1 arbeitet die in `DEFERRED_v3.39.md` offenen Punkte ab, Phase 2 erweitert die Tests und liefert ein manuelles Geräte-Testprotokoll.
**Datum:** 2026-06-19
**Basis:** v3.39 (565 Smoke-Asserts)
**Ergebnis:** 619 Smoke-Asserts gruen (565 Basis plus 54 neu), `node check_js.js` OK.

Aufteilung: erledigt / gestaged / weiter deferred (`DEFERRED_v3.40.md`).

---

## Erledigt

### H1, Vollständige Dialog-Migration (GELB, getestet)
Neue Promise-basierte Modal-Infrastruktur `confirmAsync` (mit `onCancel`-Unterstützung in `closeConfirmModal`). Damit liessen sich ALLE in v3.39 noch nativ belassenen `confirm()` sauber migrieren, auch die mit verschränktem Kontrollfluss, await-Ketten und Schleifen.

Migriert auf In-App-Modal:
- `confirmAppointment` (Termin verpasst/abgesagt, plus Ersatz-Termin-Angebot)
- `confirmPayment` (Zahlung verschoben, plus neues Fälligkeits-Datum)
- `handleSozialDone` (Sozialstunden, Abbrechen setzt korrekt trotzdem den Status)
- `triggerImport` (zwei Bestätigungen beim Überschreiben-Import)
- OCR-Abfragen (`handleImportUpload`, `startOcrForDocAttachment`)
- PDF-Größen-Warnungen in Upload-Schleifen (`handleInboxUpload`, `handleAttachmentUpload`)
- Datei-Teilen-Fallback (`shareDocument`)
- Notiz-Vorschlag nach BH-Termin

Ergebnis: **0 native `confirm()` und 0 native `prompt()`** mehr im Script. Hartes Invariant gewahrt (destruktive Aktion nur nach Bestätigung; bleibt das Modal unbeantwortet, läuft die Aktion nicht). Tests: `smoke_v340_dialoge.js` (31 Asserts).

### H2, Service Worker produktionsreif (Aktivierung gestaged)
- `sw.js` produktionsreif: Cache-Name leitet sich automatisch aus `?v=` ab (`bh-cache-<version>`), Registrierung gedacht als `register("./sw.js?v=" + APP_VERSION)`. Kein manuelles Hochzählen mehr.
- Network-First für HTML, `skipWaiting` + `clients.claim`, `activate` löscht nur eigene alte Caches (`bh-cache-*`), fremde Caches bleiben unberührt, alle Handler in try/catch, externe CDNs werden nie gecacht.
- Reine Logik (`deriveCacheName`, `selectCachesToDelete`) in Node testbar; `sw.js` ist so strukturiert, dass `require` in Node die SW-Laufzeit nicht startet.
- **In-App-Reset-Button** (Einstellungen, „Cache leeren und neu laden“): `resetAppCache` deregistriert alle Service Worker, löscht alle Caches, lädt neu. Fasst `localStorage` NIE an, Nutzerdaten bleiben erhalten. Defensiv bei fehlenden APIs.
- Tests: `smoke_v340_sw.js` (23 Asserts).

### Kleinere GRÜN-Fixes
- `min-height: 100vh; min-height: 100dvh;` (iOS dynamische Viewport-Höhe, Progressive Enhancement).

---

## Gestaged (gebaut und getestet, aber NICHT live aktiviert)

### Service-Worker-Registrierung
- Der Registrierungsblock in `index.html` ist auf das `?v=` + `APP_VERSION`-Muster aktualisiert, bleibt aber auskommentiert.
- Aktivierung nur nach menschlichem Real-Browser-Test: Runbook in `SW_ACTIVATION_v3.40.md` (5 Schritte plus Kill-Switch, inkl. leerer Ersatz-`sw.js` als serverseitiger Kill-Switch).
- **Begründung:** Ein SW lässt sich nicht autonom/headless real testen, und ein fehlerhafter SW kann Nutzer dauerhaft einsperren. Fail-safe vor Vollständigkeit.

---

## Weiter deferred (ROT-Zone)

Siehe `DEFERRED_v3.40.md`:
- SW-Aktivierung (gestaged, Runbook bereit).
- Speicher-Quota strukturell (IndexedDB/Kompression, Schema-Änderung).
- Backup-Format-Versionierung (Import-/Backup-Format).
- Touch-Target-Größen (kosmetisch).

---

## Phase 2, Tests

### I1, Regressionssuite erweitert
- `smoke_v340_dialoge.js` (31): jede migrierte Dialog-Stelle (bestätigen führt aus, abbrechen nicht), plus Gegenprobe „0 native confirm/prompt“.
- `smoke_v340_sw.js` (23): Cache-Namen-Ableitung, activate-Cleanup-Auswahl, `resetAppCache` gegen gemockte `serviceWorker`/`caches` (unregister + cache-delete aufgerufen, `localStorage` unberührt), SW-Registrierung statisch als nicht-aktiv geprüft.

### I2, Manuelles Testprotokoll
- `TESTPLAN_v3.40.md`: abhakbare Geräte-Checkliste (iPhone PWA, Android, Desktop-Browser) für Wizards, alle Dialoge, Drucken, Backup, Sync, Validierung, Reset-Button, optionale SW-Aktivierung.

---

## Tests gesamt

| Suite | Asserts | Status |
|---|---|---|
| `smoke_v338_sync.js` | 105 | gruen |
| `smoke_v338_full.js` | 206 | gruen |
| `smoke_v339_funktion.js` | 149 | gruen |
| `smoke_v339_logik.js` | 25 | gruen |
| `smoke_v339_dialoge.js` | 40 | gruen |
| `smoke_v339_robust.js` | 40 | gruen |
| `smoke_v340_dialoge.js` | 31 | gruen |
| `smoke_v340_sw.js` | 23 | gruen |
| **Summe** | **619** | **gruen** |

`node check_js.js`: OK. 0 U+2014 in `index.html`, `sw.js` und allen v3.40-Reports.

## Bundle
- `index.html`: 821230 Bytes (~802 KB). Wachstum gegenüber v3.39 (~797 KB) durch Promise-Modal, Reset-Funktion und Dialog-Migrationen.

## Kein Eingriff in
- localStorage-Schema, Backup-/Export-Format, Auth/Krypto. Der SW-Cache fasst nur Netz-Ressourcen an, nie `localStorage`.
