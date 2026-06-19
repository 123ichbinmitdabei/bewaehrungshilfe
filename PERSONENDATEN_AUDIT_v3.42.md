# Personendaten-Audit v3.42

**Datum:** 2026-06-19
**Geprueft:** `index.html`, `sw.js` UND `testdaten.json` (gesamter Inhalt: Code, Strings, Kommentare, Daten).
**Methode:** RegEx-Scan wie v3.38 bis v3.41, erweitert um die neuen Test-Modus-Deliverables.

## Ergebnis: sauber

Keine echten personenbezogenen Daten. Die in v3.42 neu eingefuehrten Werte sind ausschliesslich synthetische, klar als Beispiel erkennbare Dummy-Daten.

## Gepruefte Muster

| Muster | index.html | sw.js | testdaten.json | Bewertung |
|---|---|---|---|---|
| E-Mail-Adressen (ohne `@media`/`@page`/`@keyframes`/`@font`) | nur `@example.com`/`@example.org` | keine | nur `@example.com`/`@example.org` | ok (reservierte Beispiel-Domains, RFC 2606) |
| Echte E-Mail (nicht example) | keine | keine | keine | ok |
| Deutsche IBAN (`DE` + 20 Ziffern) | keine | keine | keine | ok |
| Bekannter Realname (`Mariana Cannabis`) | keiner | keiner | keiner | ok |
| Aktenzeichen | nur synthetisch (`1 Js 1234/21`) | keine | nur synthetisch (`1 Js 1234/21`) | ok |
| em-dash (U+2014) | 0 | 0 | 0 | ok |

## Synthetische Dummy-Daten (bewusst, erlaubt)

Die Dummy-Daten des Test-Modus (`tmBuildTestdaten` in `index.html`, gespiegelt in `testdaten.json`) verwenden ausschliesslich frei erfundene Werte:

- Namen: `Mustermann, Max`, `Erika Beispiel`, `Rechtsanwaeltin Test`, `Test Therapeut`.
- E-Mail: `max.mustermann@example.com`, `erika.beispiel@example.org`, `kanzlei@example.com` (RFC 2606 reservierte Domains, technisch nicht zustellbar).
- Telefon: Platzhalter (`0151 0000000`, `030 0000000`, `030 0000001`).
- Aktenzeichen: `1 Js 1234/21` (synthetisches Standard-Beispiel).
- Adressen: `Beispielstrasse 1, 12345 Musterstadt` und aehnlich.

Keine echten Personen, Konten, Adressen oder Aktenzeichen.

## Anpassung am Scan

`smoke_v338_full.js` (Modul Personendaten) erlaubt jetzt reservierte Beispiel-Domains (`example.com/.org/.net`), damit die synthetischen Dummy-Emails nicht faelschlich als Personendaten gemeldet werden. Reale Domains wuerden weiterhin gemeldet. Die Assert-Anzahl bleibt unveraendert.

`smoke_v342_testmodus.js` prueft zusaetzlich automatisiert: alle Emails in `testdaten.json` liegen auf Beispiel-Domains, keine echte IBAN, kein bekannter Realname, 0 em-dashes.

## Test-Dateien

`smoke_v339_robust.js` enthaelt weiterhin die oeffentlich bekannte Test-IBAN `DE89370400440532013000` (Standard-Beispiel, kein realer Kontoinhaber), nur in der Test-Datei, nicht in den ausgelieferten Dateien.
