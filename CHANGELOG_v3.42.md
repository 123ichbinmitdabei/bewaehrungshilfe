# Changelog v3.42

**Datum:** 2026-06-19
**Art:** Paket D (kosmetische Touch-Targets) plus Paket L (eingebauter, interaktiver Test-Modus).
**Ausgangsstand:** v3.41 (677 Asserts gruen). **Zielstand:** v3.42 (732 Asserts gruen).

## Paket D, Touch-Targets (kosmetisch, GELB, kleiner Diff)

- Geteilte Button-Klasse `.btn` bekommt `min-height: 44px` (Apple HIG). Die Schrift bleibt unveraendert, die Trefferflaeche waechst ueber die Hoehe. Buttons zentrieren ihren Inhalt weiterhin selbst.
- Reine Icon-Buttons in der Startseiten-Kopfzeile (`.home-header-actions .btn-icon`) auf `min-width: 44px` und `min-height: 44px` angehoben. Icon-Groesse unveraendert.
- Branding und Layout bleiben intakt. Mini-Check in `smoke_v342_testmodus.js` (`.btn` hat `min-height: 44px`, Icon-Buttons mind. 44x44).
- Bewusst NICHT erzwungen: tabelleninterne Mini-Controls (`.row-delete`, `.row-calendar-btn`) wuerden in dichten Tabellen die Zeilenhoehe sprengen. Siehe `DEFERRED_v3.42.md`.

## Paket L, interaktiver Test-Modus (GRUEN, isoliert)

- Erreichbar ueber einen Knopf in den Einstellungen (`🧪 Test-Modus, strukturiertes Durchtesten`) und ueber `#testmodus` im URL-Hash.
- Eigene Vollbild-Ansicht (`#testmodusRoot`), die die App-Ansicht ausblendet statt sie zu ueberdecken. Schliessen ueber `← Zurueck zur App`.
- `TEST_CASES`: 62 strukturierte Faelle ueber alle Bereiche (Stammdaten/Onboarding, die 10 Wizards, Adressbuch/Sync, Briefe/Vorlagen, Signatur, Drucken, Inbox/Belege/OCR, Backup, Timeline, Setup-Checkliste, Achievements, Suche, Kalender/ICS, Validierung, Dialoge, Modal-Nebenlaeufigkeit, Reset, UI/Touch, PWA/Offline, Datensicherheit/PIN). Jeder Fall: `id`, `bereich`, `titel`, `schritte`, `erwartung`.
- Erfassung je Fall: Status (Bestanden / Fehler / Uebersprungen / Blockiert, Default offen), freie Notiz, Bild-Anhang (mehrere, vor dem Speichern per Canvas heruntergerechnet, max. Kante 1000 px, JPEG 0.7).
- Sofort-Persistenz: jede Aenderung wird sofort unter `bh_test_results_v1` gespeichert. Fortschrittsanzeige und Filter (alle / offen / Fehler / bestanden).
- Auswertung und Export: `bh_testbericht.json` (alle Antworten, Notizen, Bilder als Base64) und ein lesbarer HTML-Bericht (`bh_testbericht.html`, eingebettete Bilder, Zusammenfassung oben, Fehler/Blockierte zuerst). `Ergebnisse loeschen` ueber das vorhandene `confirmAsync`.
- Dummy-Daten: `tmBuildTestdaten()` erzeugt eine gueltige Backup-Datei im vorhandenen Format (Version 4), nur synthetische Daten. Knopf `Dummy-Testdaten herunterladen` bietet `testdaten.json` als Download an. KEIN In-Place-Laden. `testdaten.json` liegt auch als Datei im Repo.

## HARTE REGELN (eingehalten)

- Eigener Namespace: ausschliesslich `bh_test_`-Keys. Smoke-Test prueft, dass nach einem simulierten Test-Lauf KEIN App-Daten-Key beschrieben wurde.
- Kein In-Place-Laden von Dummy-Daten (nur Download plus Anleitung fuer privates Fenster).
- Kein Schema-/Backup-Format-Eingriff. `tmBuildTestdaten` bildet nur das vorhandene Format nach.
- Inert: nur ueber bewussten Knopf bzw. `#testmodus` erreichbar.
- Sauber entfernbar: CSS-Block, JS-Block und Settings-Knopf mit `=== TESTMODUS START/ENDE ===` umschlossen. Anleitung in `TESTMODUS_v3.42.md`.

## Tests und Release

- Neuer Smoke-Test `smoke_v342_testmodus.js` (55 Asserts): Wohlgeformtheit/Vollstaendigkeit der `TEST_CASES`, Namespace-Invariante, Export-Builder (JSON + HTML), reine Downscale-Funktion, `testdaten.json` (gueltig, Backup-Format, nur synthetische Daten), Touch-Target-Mini-Check, Marker-Pruefung, em-dash-Scan.
- `smoke_v338_full.js`: der Personendaten-Scan erlaubt jetzt reservierte Beispiel-Domains (RFC 2606: `example.com/.org/.net`). Assert-Anzahl unveraendert.
- Voll-Gate gruen, Gesamt-Asserts 732 (677 plus 55), nicht gesunken.
- `APP_VERSION = "v3.42"`, README-Footer v3.42.
- Service-Worker-Registrierung bleibt auskommentiert (unveraendert).
