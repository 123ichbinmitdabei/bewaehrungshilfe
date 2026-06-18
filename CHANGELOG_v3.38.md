# Changelog v3.38

**Datum:** 2026-06-18
**Vorgaenger:** v3.37
**Bundle:** ~788 KB (`index.html`, Single-File PWA)
**Art:** Validierungs-Release (Verifikation, Audit, Tests), plus ein gezielter Druck-Fix.

## Highlights

- Personendaten-Audit bestanden: ein Arbeitgeber-Realname aus einem Platzhalter entfernt, sonst keine echten Personendaten im Quelltext.
- Cross-Browser-Audit dokumentiert, inklusive der vom Tester gemeldeten Live-Symptome (PC-Sync, Drucken).
- Neue Selbsttest-Suite mit 206 Asserts, plus Sync-Suite mit 105 Asserts, alle gruen.
- Druck-Pipeline robuster: leerer Brief-Container meldet sich jetzt explizit.
- Endnutzer-Hilfe `TROUBLESHOOTING.md` und Roadmap `ROADMAP_v4.md` ergaenzt.

## Aufgabe A, Verifikation der v3.37-Fixes

- **Adressbuch-Sync:** `DATA_SYNC_GROUPS` geprueft, alle 14 Gruppen zeigen auf existierende Doc-Felder (`thera/briefkopf.*`, `kosten/verfahren.*`, `kosten/anwaltskosten.verteidiger_name`, `kosten/erklaerung_wirtschaft.arbeitgeber`, `ear/arbeit.lohn`). Kein Mapping-Fix noetig.
- **Zweistufiger Loesch-Klick:** `deleteContact` und `deleteCustomTemplate` nutzen `pendingDeleteContactId` / `pendingDeleteTplKey` als Toggle mit 3-Sekunden-Timeout. Verifiziert.
- **Print-Reflow:** `openPrintWindow` und `_doPrintAnschreiben` nutzen `void offsetHeight` + `requestAnimationFrame` + `setTimeout(100)` vor `window.print()`, mit try/catch und `alert()`. Verifiziert.
- **FIX:** `_doPrintAnschreiben` meldet jetzt bei leerem Brief-Container (kein Text, keine Signatur, keine Anhaenge) explizit per `alert()`, statt eine leere Seite zu drucken (vorher nur im Doc-Druck vorhanden).

## Aufgabe B, Personendaten-Audit

- RegEx-Scan auf Namen, Adressen, IBAN, Aktenzeichen, Telefon, E-Mail.
- **1 Fund gefixt:** Platzhalter `z.B. Mariana Cannabis e.V.` (realer Arbeitgeber) ersetzt durch `z.B. Muster GmbH`.
- **5 akzeptable Vorkommen dokumentiert:** Regex-Beispiele in Code-Kommentaren, Standard-Platzhalter (`Max Mustermann`), oeffentliche Institutionen als Beispiel, Deploy-URL.
- Keine echten E-Mails, keine IBAN im Quelltext.
- Details: `PERSONENDATEN_AUDIT.md`.

## Aufgabe C, Cross-Browser-Audit

- Statische Analyse fuer iOS Safari (Tab + PWA), Chrome Android, Firefox, Desktop (Chrome/Edge/Firefox/Safari), Tablets.
- Kein Service Worker registriert, daher kein stuck-version-Cache-Problem im klassischen Sinn (aber Roadmap-Punkt fuer kontrolliertes Caching).
- `crypto.randomUUID()` wird nicht genutzt (IDs ueber `Date.now()` + `Math.random()`), kein Fallback noetig.
- `navigator.share` mit Fallback, Inline-Print statt `window.open`, Safe-Area-Handling vorhanden.
- **Bekannter offener Punkt (nur dokumentiert, mit Andre abgestimmt):** 18 `confirm()` + 2 `prompt()` verbleiben, im iOS-PWA-Standalone-Modus unzuverlassig, aber fail-safe. Migration auf das vorhandene `confirmAction`-Modal ist als v3.39-Aufgabe vorgemerkt.
- **Live-Symptome dokumentiert:** PC-Sync (alte gecachte Version, Hard-Reload-Anleitung), Drucken auf Handy+PC (A3-Fix plus Hard-Reload).
- Details: `CROSS_BROWSER_REPORT.md`, Endnutzer-Anleitung in `TROUBLESHOOTING.md`.

## Aufgabe D, Vollstaendiger Selbsttest

- `smoke_v338_full.js`: **206 Asserts**, alle gruen, ueber 12 Module:
  - D1 Render-Stabilitaet (alle 10 DOCS im Wizard, 11 Hauptansichten, alle 13 Anschreiben-Templates).
  - D2 DATA_SYNC_GROUPS-Validitaet (14 Gruppen, Mapping-Ziele existieren).
  - D3 Storage-Konsistenz (Roundtrip aller Storage-Keys + DOCS-storageKeys, del-Test).
  - D4 Sync-Zyklen (Doc->shared, shared->Doc, Kontakt->shared fuer alle Rollen).
  - D5 Brief-Druck-Pipeline (alle Template-Bodies liefern String, Signatur-Logik).
  - D6 Achievements (computeAchievements, Freischaltung bei Eintrag).
  - D7 Notification-Logik (Support/Enabled-Checks, scheduleNotifChecks).
  - D8 Export.
  - D9 Setup-Checkliste (8 Items, korrekte done-Berechnung).
  - D10 Timeline (collectTimelineEvents, renderTimelineView mit Filtern).
  - Personendaten-Re-Pruefung und A3-Print-Reflow-Struktur.
- `smoke_v338_sync.js`: **105 Asserts** fuer A1 (Doc<->shared<->Adressbuch, Round-Trip, propagateFieldChange), alle gruen.
- Hinweis: Der Work Order nannte „12 DOCS", tatsaechlich sind es 10 (`ear, zeit, thera, schadens, sozial, uebersicht, bhtermine, kosten, asservate, ziele`). Tests iterieren dynamisch ueber die echten DOCS-Keys.

## Aufgabe E, Roadmap v4

- `ROADMAP_v4.md` mit Architekturvorschlaegen fuer PDF-Annotation, E2E-Cloud-Sync, KI-Brief-Verbesserung, plus neuem Paket 0: Service Worker mit Versions-Hash fuer Cache-Invalidation.

## Aufgabe F, Release

- `APP_VERSION` auf `v3.38` gesetzt.
- Neue / aktualisierte Dateien: `PERSONENDATEN_AUDIT.md`, `CROSS_BROWSER_REPORT.md`, `ROADMAP_v4.md`, `TROUBLESHOOTING.md`, `CHANGELOG_v3.38.md`, `PUBLISH.md`, `README.md`, `smoke_v338_sync.js`, `smoke_v338_full.js`, `smoke_bootstrap.js`, `check_js.js`.

## Constraints eingehalten

- Single-File (alle App-Aenderungen in `index.html`).
- Keine em-dashes im deutschen Output (Kommas), deutsche Anfuehrungszeichen in neuen App-Strings.
- `node`-Parse-Check nach jedem JS-Edit.
- Keine externen Scripts / CDNs hinzugefuegt.
- Branding unveraendert.
