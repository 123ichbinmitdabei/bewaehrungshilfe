# Deferred v3.40 (offene Punkte und ROT-Zone)

Stand: 2026-06-19. Einordnung aller in `DEFERRED_v3.39.md` offenen Punkte plus neue Lage nach v3.40.

## Aus v3.39 übernommen und jetzt erledigt

| v3.39-Punkt | Status in v3.40 |
|---|---|
| 1. Service-Worker-Aktivierung | `sw.js` produktionsreif gebaut (Cache-Name aus `?v=`), In-App-Reset-Button live, Runbook `SW_ACTIVATION_v3.40.md`. Aktivierung GESTAGED (Registrierung bleibt auskommentiert, siehe unten). |
| 4. Mehrstufige native Dialoge | ALLE migriert. Mit dem neuen Promise-Modal `confirmAsync` (inkl. `onCancel`) wurden sämtliche verbliebenen `confirm()` auf In-App-Modals umgestellt: `confirmAppointment`, `confirmPayment` (postponed), `handleSozialDone`, `triggerImport`, OCR-Abfragen, PDF-Größen-Warnungen (in Schleifen), Share-Fallback, Notiz-Vorschlag. 0 native `confirm()`/`prompt()` mehr. Invariant durch `smoke_v340_dialoge.js` abgesichert. |
| 5. `100dvh` (iOS) | Erledigt: `min-height: 100vh; min-height: 100dvh;` (Progressive Enhancement, Fallback bleibt). |
| 6. `printFormular`/Druck | War schon in v3.39 erledigt. |

## Weiter deferred (ROT-Zone, bewusst nicht angefasst)

### A. Service-Worker-AKTIVIERUNG (gestaged, nicht live)
- `sw.js` ist fertig und getestet (reine Logik in `smoke_v340_sw.js`), aber die Registrierung in `index.html` bleibt auskommentiert.
- **Warum:** Ein SW lässt sich nur im echten Browser/HTTPS testen, nicht in der CI. Ein fehlerhafter SW kann Nutzer dauerhaft einsperren. Aktivierung erfordert den menschlichen Real-Browser-Test nach `SW_ACTIVATION_v3.40.md` (5 Schritte plus Kill-Switch).
- **Nächster Schritt:** Runbook abarbeiten, dann separat aktivieren und pushen.

### B. Speicher-Quota strukturell entschärfen (ROT, Schema)
- Unverändert deferred. Vorschlag bleibt: Attachments nach IndexedDB auslagern oder Base64-Bilder komprimieren. Ändert das Speicher-Schema und braucht Daten-Migration. v3.40 hat (seit v3.39) nur die Fehlerbehandlung (Quota-Hinweis), nicht die Ursache.

### C. Backup-Format-Versionierung (ROT, Backup-Format)
- Unverändert deferred. Robuste Migrationskette v1..v4 mit Feld-Validierung wäre sauberer, würde aber das Import-/Backup-Format berühren. Risiko für bestehende Nutzer-Backups.

### D. Touch-Targets (kosmetisch)
- Einige sekundäre Buttons knapp unter 44x44 px (Apple HIG). Kein Funktionsfehler. Reines Styling, jederzeit nachziehbar. Nicht erzwungen, um Branding/Layout nicht im Härtungslauf zu verändern.

## Nicht offen / in v3.40 erledigt

Dialog-Vollmigration, Promise-Modal-Infrastruktur, `sw.js` produktionsreif, In-App-Reset-Button, `100dvh`, Regressionssuite erweitert (`smoke_v340_dialoge.js`, `smoke_v340_sw.js`), manuelles Testprotokoll (`TESTPLAN_v3.40.md`), Personendaten-Audit, em-dash-Bereinigung, Version-Bump v3.40.
