# Deferred v3.41 (offene Punkte und ROT-Zone)

Stand: 2026-06-19. Fortschreibung von `DEFERRED_v3.40.md` nach den v3.41-Robustheits-Fixes.

## In v3.41 erledigt

| Punkt | Status |
|---|---|
| Reset-Button origin-weit (löschte fremde Caches/SWs) | **Erledigt (J1):** `resetAppCache` löscht nur `bh-cache-*` und deregistriert nur Service Worker mit Scope `/bewaehrungshilfe/`. Fremde Pages-Projekte derselben Origin bleiben unberührt. `localStorage` weiterhin nie angefasst. Test: `smoke_v341_reset.js`. |
| Modal-Überschreiben bei Nebenläufigkeit | **Erledigt (J2):** leichte FIFO-Warteschlange (`modalQueue`, transient). Ein zweites Modal während eines offenen wird eingereiht statt still überschrieben. Fail-safe und `confirmAsync` intakt. Test: `smoke_v341_modal.js`. |

## Weiter deferred (ROT-Zone, bewusst nicht angefasst)

### A. Service-Worker-AKTIVIERUNG (gestaged, nicht live)
- `sw.js` ist produktionsreif (seit v3.40), die Registrierung in `index.html` bleibt auskommentiert.
- **Warum:** Ein SW lässt sich nur im echten Browser/HTTPS testen, nicht in der CI. Ein fehlerhafter SW kann Nutzer dauerhaft einsperren.
- **Nächster Schritt:** Runbook `SW_ACTIVATION_v3.40.md` (5-Schritte-Real-Browser-Test plus Kill-Switch). Der in v3.41 abgesicherte Reset-Button (nur eigene App) ist Teil der Recovery-Absicherung VOR einer Aktivierung.

### B. Speicher-Quota strukturell entschärfen (ROT, Schema)
- Unverändert deferred. Vorschlag: Attachments nach IndexedDB oder Base64-Kompression. Ändert Speicher-Schema, braucht Daten-Migration.

### C. Backup-Format-Versionierung (ROT, Backup-Format)
- Unverändert deferred. Robuste Migrationskette würde das Import-/Backup-Format berühren.

### D. Touch-Targets (kosmetisch)
- Einige sekundäre Buttons knapp unter 44x44 px (Apple HIG). Kein Funktionsfehler, reines Styling.

## Nicht offen / in v3.41 erledigt

Reset-Scope-Begrenzung, Modal-FIFO-Queue, Regressionssuite erweitert (`smoke_v341_reset.js`, `smoke_v341_modal.js`), Testplan-Nachtrag (`TESTPLAN_v3.41_NACHTRAG.md`), Personendaten-Audit, em-dash-Bereinigung, Version-Bump v3.41.
