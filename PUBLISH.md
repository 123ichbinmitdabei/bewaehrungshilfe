# PUBLISH, v3.39

**Live-URL:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/
**Datum:** 2026-06-19
**Bundle:** ~797 KB (`index.html`, 815807 Bytes)

## Was in v3.39 gemacht wurde (Härtung und Aufräumen, keine neuen Features)

### Paket A, Funktions-Vollaudit
- Jeder Wizard und jede Hauptansicht im leeren und gefuellten Zustand gerendert (kein Crash).
- Feld-Roundtrip je Wizard, Sync bidirektional (14 Gruppen plus 10 Kontakt-Rollen).
- Pipelines: ICS/VCALENDAR, globale Suche, Achievements, Timeline, Setup-Checkliste, Backup-Export plus Re-Import-Identitaet.
- Bericht: `FUNKTIONS_AUDIT_v3.39.md`. Test: `smoke_v339_funktion.js` (149 Asserts).

### Paket B, Logik / Dead-Code / Konsistenz
- 1 kaputter Handler gefixt, 7 tote Funktionen plus 1 Variable und 3 tote CSS-Regeln entfernt, 11 leere catch-Blöcke mit `console.warn` versehen.
- Test: `smoke_v339_logik.js` (25 Asserts, inkl. Handler-Integritaet und em-dash-Guard).

### Paket C, Cross-Platform und Dialoge
- `inputModal` als prompt-Ersatz, 5 destruktive confirm plus 1 prompt migriert (Invariant: keine destruktive Aktion ohne Bestaetigung).
- `printFormular` Reflow ergaenzt, kein `window.open` mehr im Druckpfad.
- Bericht: `CROSS_BROWSER_REPORT_v3.39.md`. Test: `smoke_v339_dialoge.js` (40 Asserts).

### Paket D, Robustheit
- Storage-Quota-Behandlung mit Nutzerhinweis, `safeJsonParse`-Lade-Guards, Eingabe-Validatoren (IBAN/Datum/Betrag, nur Hinweis).
- Test: `smoke_v339_robust.js` (40 Asserts).

### Paket E, Repo-Aufräumen
- Scratch-Datei entfernt, Work Orders nach `work-orders/`, `.gitignore` angelegt.

### Paket F, Regression und Release
- `PERSONENDATEN_AUDIT_v3.39.md` (sauber), em-dash-Scan (0 U+2014), Version-Bump v3.39.

### Paket G, Service-Worker-Vorschlag (NICHT aktiviert)
- `sw.js` Prototyp plus `SW_PROPOSAL_v3.39.md`. Registrierung in `index.html` nur auskommentiert. Aktivierung erfordert ausdrueckliche menschliche Freigabe.

## Deploy-Schritte
1. `node check_js.js` (Parse OK).
2. `node smoke_v338_sync.js`, `node smoke_v338_full.js`, alle `node smoke_v339_*.js` (565 Asserts gruen).
3. `APP_VERSION = "v3.39"` gesetzt, README-Footer v3.39.
4. Commit (Message via `-F`) plus Push auf `main`, GitHub Pages baut automatisch. KEIN force-push.

## Nach dem Deploy (wichtig)
- Auf Test-Geraeten Hard-Reload (siehe `TROUBLESHOOTING.md`), sonst bleibt am PC eventuell die alte Version aktiv.
- Live-URL pruefen: Footer zeigt `v3.39`.
- Drucken auf Handy und PC nach Hard-Reload erneut testen (alle Druckpfade haben jetzt Reflow).
- Destruktive Aktionen (Loeschen, Reset, Zahlung-bezahlt) zeigen jetzt In-App-Modals statt nativer Dialoge.
