# Personendaten-Audit v3.40

**Datum:** 2026-06-19
**Geprüft:** `index.html` und `sw.js` (gesamter Quelltext: Code, Strings, Kommentare)
**Methode:** RegEx-Scan wie v3.38/v3.39, erneut ausgefuehrt nach allen v3.40-Aenderungen.

## Ergebnis: sauber

Keine echten personenbezogenen Daten im Quelltext. Die v3.39-Bereinigung (synthetische Beispiel-Identifikatoren) bleibt erhalten. In v3.40 wurden keine neuen personenbezogenen Daten eingefuehrt.

## Geprüfte Muster

| Muster | Fund | Bewertung |
|---|---|---|
| E-Mail-Adressen (ohne `@media`/`@page`/`@keyframes`/`@font`) | keine | ok |
| Deutsche IBAN (`DE` + 20 Ziffern) | keine in `index.html`/`sw.js` | ok |
| Telefonnummern | nur Byte-Mathematik und CSS-Werte | ok (Falsch-Positive) |
| Aktenzeichen (Strafverfahren) | nur synthetische Beispiele im Kommentar (`1 Js 1234/21`, `5 Ds 123/22`) | ok |
| Kassenzeichen | nur Null-Platzhalter im Kommentar | ok |
| Bekannter Realname (`Mariana Cannabis`) | keiner | ok (bleibt entfernt) |

## v3.40-spezifisch geprüft

- **`sw.js`:** enthaelt nur technische Cache-/Versions-Logik, keine Personendaten, keine echten URLs ausser der Live-Origin-Logik (relativ, `./`).
- **`resetAppCache` und Reset-Button:** fassen `localStorage` NICHT an, lesen/schreiben keine personenbezogenen Daten, loeschen nur den Netz-Cache.
- **Dialog-Migration:** die Modal-Texte enthalten Platzhalter-Formulierungen, keine realen Namen/Adressen.

## Hinweis zu Test-Dateien

`smoke_v339_robust.js` enthaelt weiterhin die oeffentlich bekannte Test-IBAN `DE89370400440532013000` (Standard-Beispiel, kein realer Kontoinhaber) zur Pruefziffern-Validierung. Steht in der Test-Datei, nicht in `index.html`.

## Abgleich mit Smoke-Test

`smoke_v338_full.js` (Modul Personendaten) prueft automatisch: kein `Mariana Cannabis`, keine hardcoded E-Mails, keine hardcoded IBAN. Alle drei Asserts gruen.
