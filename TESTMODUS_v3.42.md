# Test-Modus v3.42

Eingebauter, strukturierter Test-Modus zum manuellen Durchtesten aller Funktionen.

## Was ist das?

Ein gefuehrter Test-Durchlauf mit 62 Test-Faellen ueber alle Bereiche der App. Du gehst Fall fuer Fall durch, setzt je Fall einen Status (Bestanden / Fehler / Uebersprungen / Blockiert), schreibst eine Notiz und haengst bei Bedarf Screenshots an. Am Ende exportierst du eine Auswertung als JSON und als lesbaren HTML-Bericht.

## Datensicherheit (wichtig)

Diese App enthaelt reale, sensible Daten. Der Test-Modus gefaehrdet sie NICHT:

- Er speichert ausschliesslich unter dem Schluessel `bh_test_results_v1` (Praefix `bh_test_`). Er liest und schreibt NIE die App-Daten-Keys.
- Er hat KEINEN Knopf, der Dummy-Daten in dein aktuelles Profil schreibt. Die Dummy-Daten gibt es nur als Download.
- Er aendert weder das Daten-Schema noch das Backup-/Import-Format.

## Aufrufen

- Einstellungen, Abschnitt `🧪 Test-Modus`, Knopf `🧪 Test-Modus, strukturiertes Durchtesten`, oder
- die App-Adresse mit `#testmodus` am Ende oeffnen (z.B. `.../bewaehrungshilfe/#testmodus`).

Schliessen ueber `← Zurueck zur App`.

## Mit Dummy-Daten testen (privates Fenster)

Damit deine echten Daten unberuehrt bleiben, NIE im normalen Fenster Dummy-Daten importieren. Stattdessen:

1. Im Test-Modus auf `📦 Dummy-Testdaten herunterladen` tippen (`testdaten.json`).
2. Ein privates Fenster bzw. ein separates Browser-Profil oeffnen.
3. Dort die App-Adresse laden.
4. In der App die Daten importieren (Einstellungen / Startseite, Import).
5. Funktionen durchtesten und im Test-Modus Status/Notiz/Bild erfassen.
6. VOR dem Schliessen des privaten Fensters die Ergebnisse exportieren (JSON und/oder HTML). Ein privates Fenster verliert beim Schliessen seinen Speicher.

## Erfassung und Export

- Status je Fall, freie Notiz, mehrere Screenshots je Fall (werden vor dem Speichern automatisch verkleinert, max. Kante ca. 1000 px).
- Alles wird sofort gespeichert. Fortschrittsanzeige und Filter (alle / offen / Fehler / bestanden).
- `⬇️ Ergebnisse als JSON`: `bh_testbericht.json` mit allen Antworten, Notizen und Bildern (Base64).
- `⬇️ Bericht als HTML`: `bh_testbericht.html`, lesbar, mit eingebetteten Bildern, Zusammenfassung oben und den Fehler-/Blockiert-Faellen zuerst.
- `🗑️ Ergebnisse loeschen`: loescht nur die Test-Ergebnisse (nach Rueckfrage), nie die App-Daten.

## Speicher voll?

Screenshots sind der groesste Posten. Bilder werden automatisch verkleinert. Bei vollem Speicher den vorhandenen Speicher-voll-Hinweis beachten, Ergebnisse exportieren und sparsam mit Bildern umgehen.

## Spaeter wieder entfernen (in einem Schritt)

Der gesamte Test-Modus ist mit Markern umschlossen und laesst sich vollstaendig entfernen:

1. In `index.html` den CSS-Block zwischen `/* === TESTMODUS START === */` und `/* === TESTMODUS ENDE === */` loeschen.
2. In `index.html` den JS-Block zwischen `// === TESTMODUS START ===` und `// === TESTMODUS ENDE ===` loeschen.
3. In `renderSettingsView` den HTML-Block zwischen `<!-- === TESTMODUS START === -->` und `<!-- === TESTMODUS ENDE === -->` loeschen.
4. Optional: den Test-Smoke `smoke_v342_testmodus.js`, die Datei `testdaten.json` und den Testmodus-Export in `smoke_bootstrap.js` (eigener `try`-Block mit `__APP.testmodus`) entfernen.
5. Optional: in `smoke_v338_full.js` die Beispiel-Domain-Ausnahme zuruecknehmen, falls keine Beispiel-Emails mehr im Quelltext stehen.
6. Beim Nutzer verbleibt nur der Key `bh_test_results_v1`, der gefahrlos geloescht werden kann.
