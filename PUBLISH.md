# PUBLISH, v3.42

**Live-URL:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/
**Datum:** 2026-06-19
**Bundle:** `index.html` (Single-File, plus `sw.js` separat und NICHT registriert)

## Was in v3.42 gemacht wurde

### Paket D, Touch-Targets (kosmetisch, GELB)
- `.btn` mit `min-height: 44px`, Kopf-Icon-Buttons auf 44x44. Schrift und Branding unveraendert, kleiner Diff. Mini-Check im Smoke.

### Paket L, eingebauter Test-Modus (GRUEN, isoliert)
- Strukturierter Test-Durchlauf, erreichbar ueber Einstellungen und `#testmodus`. Eigene Vollbild-Ansicht.
- 62 Test-Faelle ueber alle Bereiche, je Fall Status, Notiz und Screenshots (auto-verkleinert), Sofort-Persistenz unter `bh_test_`-Keys, Fortschritt und Filter.
- Export als JSON und als lesbarer HTML-Bericht (Fehler zuerst). Dummy-Daten als Download (`testdaten.json`), kein In-Place-Laden.
- HARTE REGELN eingehalten: nur `bh_test_`-Keys, kein Schema-/Backup-Format-Eingriff, sauber entfernbar (Marker). Details in `TESTMODUS_v3.42.md`.

## Was live geht / was NICHT
- **Live:** Touch-Targets, Test-Modus, `testdaten.json`, Tests, Doku, Version v3.42.
- **NICHT live:** die Service-Worker-Registrierung bleibt auskommentiert (Aktivierung nur nach `SW_ACTIVATION_v3.40.md`).

## Deploy-Schritte
1. `node check_js.js` (Parse OK).
2. Voll-Gate: `node smoke_v338_sync.js`, `node smoke_v338_full.js`, alle `node smoke_v339_*.js`, `smoke_v340_*.js`, `smoke_v341_*.js`, `smoke_v342_*.js` (732 Asserts gruen).
3. `APP_VERSION = "v3.42"` gesetzt, README-Footer v3.42.
4. Commit (Message via `-F`) plus `git push origin main`, NUR bei gruenem Gate. KEIN force-push. SW-Registrierung bleibt auskommentiert.

## Nach dem Deploy (wichtig)
- Auf Test-Geraeten Hard-Reload; Footer muss `v3.42` zeigen.
- Test-Modus oeffnen (Einstellungen oder `#testmodus`), mit `testdaten.json` im privaten Fenster gegentesten (siehe `TESTMODUS_v3.42.md`).
- Service Worker erst nach `SW_ACTIVATION_v3.40.md` aktivieren, nicht vorher.
