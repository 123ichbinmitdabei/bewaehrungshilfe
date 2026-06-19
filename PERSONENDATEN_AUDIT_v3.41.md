# Personendaten-Audit v3.41

**Datum:** 2026-06-19
**Geprüft:** `index.html` und `sw.js` (gesamter Quelltext: Code, Strings, Kommentare)
**Methode:** RegEx-Scan wie v3.38 bis v3.40, erneut nach allen v3.41-Aenderungen.

## Ergebnis: sauber

Keine echten personenbezogenen Daten im Quelltext. In v3.41 wurden keine neuen personenbezogenen Daten eingefuehrt.

## Geprüfte Muster

| Muster | Fund | Bewertung |
|---|---|---|
| E-Mail-Adressen (ohne `@media`/`@page`/`@keyframes`/`@font`) | keine | ok |
| Deutsche IBAN (`DE` + 20 Ziffern) | keine in `index.html`/`sw.js` | ok |
| Telefonnummern | nur Byte-Mathematik/CSS-Werte | ok (Falsch-Positive) |
| Aktenzeichen | nur synthetische Beispiele im Kommentar (`1 Js 1234/21`, `5 Ds 123/22`) | ok |
| Kassenzeichen | nur Null-Platzhalter im Kommentar | ok |
| Bekannter Realname (`Mariana Cannabis`) | keiner | ok |

## v3.41-spezifisch geprüft

- **`resetAppCache` (J1):** arbeitet nur mit Cache-Namen (`bh-cache-*`) und Service-Worker-Scopes (`/bewaehrungshilfe/`), keine personenbezogenen Daten. `localStorage` wird weiterhin nie angefasst.
- **Modal-Queue (J2):** `modalQueue` haelt nur transiente UI-Anfragen (Titel, Nachricht, Callbacks), keine Personendaten, und wird nie nach `localStorage` geschrieben.
- Die Modal-Texte enthalten Platzhalter-Formulierungen, keine realen Namen/Adressen.

## Hinweis zu Test-Dateien

`smoke_v339_robust.js` enthaelt weiterhin die oeffentlich bekannte Test-IBAN `DE89370400440532013000` (Standard-Beispiel, kein realer Kontoinhaber) zur Pruefziffern-Validierung. In der Test-Datei, nicht in `index.html`.

## Abgleich mit Smoke-Test

`smoke_v338_full.js` (Modul Personendaten) prueft automatisch: kein `Mariana Cannabis`, keine hardcoded E-Mails, keine hardcoded IBAN. Alle drei Asserts gruen.
