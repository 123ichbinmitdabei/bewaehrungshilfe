# PUBLISH, v3.41

**Live-URL:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/
**Datum:** 2026-06-19
**Bundle:** ~804 KB (`index.html`, 823577 Bytes)

## Was in v3.41 gemacht wurde (Robustheits-Nachzug)

Zwei gezielte GELB-Fixes, die das Dialog- und Reset-System absichern, bevor der Service Worker jemals aktiviert wird. Kein Eingriff in Storage-Schema, Backup-Format oder Auth.

### J1, Reset-Button auf eigene App begrenzt
- `resetAppCache` löscht nur eigene Caches (`bh-cache-*`) und deregistriert nur Service Worker mit Scope `/bewaehrungshilfe/`. Fremde Pages-Projekte derselben Origin bleiben unberührt. `localStorage` weiterhin nie angefasst. Test: `smoke_v341_reset.js` (24).

### J2, Modal-Nebenläufigkeit (FIFO-Warteschlange)
- Ein zweites Modal während eines offenen wird eingereiht statt still überschrieben. Fail-safe und `confirmAsync` bleiben intakt, kein destruktiver Pfad ohne Bestätigung. Test: `smoke_v341_modal.js` (34).

## Was live geht / was NICHT
- **Live:** die beiden Robustheits-Fixes, die Tests, die Doku, Version v3.41.
- **NICHT live:** die Service-Worker-Registrierung (bleibt auskommentiert, Aktivierung nur nach `SW_ACTIVATION_v3.40.md`).

## Deploy-Schritte
1. `node check_js.js` (Parse OK).
2. `node smoke_v338_sync.js`, `node smoke_v338_full.js`, alle `node smoke_v339_*.js`, `node smoke_v340_*.js`, `node smoke_v341_*.js` (677 Asserts gruen).
3. `APP_VERSION = "v3.41"` gesetzt, README-Footer v3.41.
4. Commit (Message via `-F`) plus `git push origin main`, NUR bei grünem Gate. KEIN force-push. SW-Registrierung bleibt auskommentiert.

## Nach dem Deploy (wichtig)
- Auf Test-Geräten Hard-Reload (siehe `TROUBLESHOOTING.md`); Footer muss `v3.41` zeigen.
- `TESTPLAN_v3.41_NACHTRAG.md` durchgehen: Reset-Button (Nutzerdaten bleiben, fremde Apps unberührt) und zwei Modals nacheinander (erstes verschwindet nicht).
- Service Worker erst nach `SW_ACTIVATION_v3.40.md` aktivieren, nicht vorher.
