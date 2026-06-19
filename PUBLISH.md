# PUBLISH, v3.40

**Live-URL:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/
**Datum:** 2026-06-19
**Bundle:** ~802 KB (`index.html`, 821230 Bytes)

## Was in v3.40 gemacht wurde (Restpakete plus ausführlicher Test)

### Phase 1, Restpakete
- **H0:** Alle Punkte aus `DEFERRED_v3.39.md` eingeordnet (erledigt / gestaged / weiter deferred), siehe `DEFERRED_v3.40.md`.
- **H1, Dialog-Vollmigration:** neues Promise-Modal `confirmAsync` (mit `onCancel`). ALLE verbliebenen nativen `confirm()` migriert (Termin-/Zahlungs-Status, Sozialstunden, Import-Überschreiben, OCR, PDF-Größe in Schleifen, Share-Fallback, Notiz-Vorschlag). 0 native `confirm()`/`prompt()` mehr. Invariant gewahrt. Test: `smoke_v340_dialoge.js` (31).
- **H2, Service Worker produktionsreif:** `sw.js` mit `?v=`-Cache-Namen, Network-First, Cleanup, Kill-Switch. In-App-Reset-Button (`resetAppCache`, fasst `localStorage` nie an). Registrierung bleibt auskommentiert. Runbook: `SW_ACTIVATION_v3.40.md`. Test: `smoke_v340_sw.js` (23).

### Phase 2, Test
- **I1:** Regressionssuite erweitert (siehe oben), Gesamt-Asserts 619 (vorher 565).
- **I2:** `TESTPLAN_v3.40.md` als abhakbare Geräte-Checkliste (echte Geräte nötig).
- **I3:** Personendaten-Audit (`PERSONENDATEN_AUDIT_v3.40.md`, sauber), em-dash-Scan 0 U+2014, Version-Bump v3.40.

## Was live geht / was NICHT
- **Live:** `sw.js` (produktionsreif, NICHT registriert), der In-App-Reset-Button, die migrierten Dialoge, die Tests, die Doku.
- **NICHT live:** die Service-Worker-Registrierung selbst (bleibt auskommentiert, Aktivierung nur nach `SW_ACTIVATION_v3.40.md`).

## Deploy-Schritte
1. `node check_js.js` (Parse OK).
2. `node smoke_v338_sync.js`, `node smoke_v338_full.js`, alle `node smoke_v339_*.js` und `node smoke_v340_*.js` (619 Asserts gruen).
3. `APP_VERSION = "v3.40"` gesetzt, README-Footer v3.40.
4. Commit (Message via `-F`) plus `git push origin main`, NUR bei grünem Gate. KEIN force-push. SW-Registrierung bleibt auskommentiert.

## Nach dem Deploy (wichtig)
- Auf Test-Geräten Hard-Reload (siehe `TROUBLESHOOTING.md`); Footer muss `v3.40` zeigen.
- `TESTPLAN_v3.40.md` auf echten Geräten durchgehen, besonders: alle Dialoge (jetzt In-App-Modals, kein nativer Browser-Dialog mehr) und alle Druckpfade.
- Reset-Button (Einstellungen, „Cache leeren und neu laden“) testen: lädt neu, Nutzerdaten bleiben erhalten.
- Service Worker erst nach `SW_ACTIVATION_v3.40.md` aktivieren, nicht vorher.
