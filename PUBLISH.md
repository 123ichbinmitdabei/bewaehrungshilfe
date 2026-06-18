# PUBLISH, v3.38

**Live-URL:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/
**Datum:** 2026-06-18
**Bundle:** ~788 KB (`index.html`)

## Was in v3.38 gemacht wurde

### Verifikation der v3.37-Fixes (Aufgabe A)
- Adressbuch-Sync: alle 14 `DATA_SYNC_GROUPS` zeigen auf existierende Doc-Felder, kein Mapping-Fix noetig.
- Zweistufiger Loesch-Klick (Kontakt + Vorlage) verifiziert (Toggle + 3-Sekunden-Timeout).
- Print-Reflow verifiziert (`void offsetHeight` + `requestAnimationFrame` + `setTimeout(100)` + try/catch + `alert()`).
- FIX: leerer Brief-Container im Brief-Druck loest jetzt explizit `alert()` aus.

### Personendaten-Audit (Aufgabe B)
- 1 Fund gefixt: realer Arbeitgebername `Mariana Cannabis e.V.` im Platzhalter ersetzt durch `Muster GmbH`.
- 5 akzeptable Vorkommen dokumentiert (Regex-Beispiele, Standard-Platzhalter, oeffentliche Institutionen, Deploy-URL).
- Keine echten E-Mails, keine IBAN im Quelltext.
- Bericht: `PERSONENDATEN_AUDIT.md`.

### Cross-Browser-Audit (Aufgabe C)
- Statische Analyse iOS Safari, Chrome Android, Firefox, Desktop, Tablets.
- Kein Service Worker, kein crypto.randomUUID, navigator.share mit Fallback, Inline-Print.
- Offener Punkt (nur dokumentiert): 18 confirm() + 2 prompt() verbleiben (fail-safe), Migration als v3.39 vorgemerkt.
- Live-Symptome dokumentiert (PC-Sync, Drucken Handy+PC).
- Bericht: `CROSS_BROWSER_REPORT.md`, Endnutzer-Hilfe: `TROUBLESHOOTING.md`.

### Vollstaendiger Selbsttest (Aufgabe D)
- `smoke_v338_full.js`: 206 Asserts, alle gruen.
- `smoke_v338_sync.js`: 105 Asserts, alle gruen.
- Lauf-Harness: `smoke_bootstrap.js` (gemockte Browser-Globals), `check_js.js` (Parse-Check).

### Roadmap v4 (Aufgabe E)
- `ROADMAP_v4.md`: PDF-Annotation, E2E-Cloud-Sync, KI-Brief, plus Service Worker mit Versions-Hash.

## Deploy-Schritte
1. `node check_js.js` (Parse OK).
2. `node smoke_v338_sync.js` und `node smoke_v338_full.js` (alle gruen).
3. `APP_VERSION = "v3.38"` gesetzt.
4. Commit + Push auf `main`, GitHub Pages baut automatisch.

## Nach dem Deploy (wichtig)
- Auf Test-Geraeten einen Hard-Reload machen (siehe `TROUBLESHOOTING.md`), sonst bleibt am PC eventuell die alte Version aktiv.
- Live-URL pruefen: Footer zeigt `v3.38`.
- Drucken auf Handy und PC nach Hard-Reload erneut testen.
