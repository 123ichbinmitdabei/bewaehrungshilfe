# Personendaten-Audit v3.39

**Datum:** 2026-06-19
**Geprueft:** `index.html` (gesamter Quelltext: Code, Strings, Kommentare)
**Methode:** RegEx-Scan wie v3.38, erneut ausgefuehrt nach allen v3.39-Aenderungen.

## Ergebnis: sauber

Keine echten personenbezogenen Daten im Quelltext. Die in v3.38 entfernten Funde (Arbeitgeber-Realname) bleiben entfernt.

## Gepruefte Muster

| Muster | RegEx | Fund | Bewertung |
|---|---|---|---|
| E-Mail-Adressen | `[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}` (ohne `@media`/`@page`/`@keyframes`/`@font`) | keine | ok |
| Deutsche IBAN | `DE\d{2}( ?\d{4}){4} ?\d{2}` bzw. `DE\d{20}` | keine in `index.html` | ok |
| Telefonnummern | `(\+49|0)[\d /-]{8,}` | nur Byte-Mathematik (`/1024/1024`) und CSS-Werte, keine echten Nummern | ok (Falsch-Positive) |
| Aktenzeichen (Strafverfahren) | `\d{1,4} (Js|Ds|Cs|...) \d{1,6}/\d{2}` | nur Format-Beispiele in einem Code-Kommentar | genericized (siehe unten) |
| Kassenzeichen | `X?\d{12,16}X?` | nur Format-Beispiel in einem Code-Kommentar | genericized (siehe unten) |
| Bekannter Realname (v3.38-Fund) | `Mariana Cannabis` | keiner | ok (bleibt entfernt) |

## Vorgenommene Aenderungen in v3.39

Zwei Code-Kommentare enthielten realistisch aussehende Beispiel-Identifikatoren. Obwohl es Format-Illustrationen (keine Live-Daten) sind, wurden sie zur Sicherheit auf eindeutig synthetische Platzhalter umgestellt:

| Datei/Zeile | vorher | nachher |
|---|---|---|
| `index.html` Kommentar (Aktenzeichen-Regex) | `"1 Js 9771/21", "5 Ds 123/22"` | `"1 Js 1234/21", "5 Ds 123/22"` |
| `index.html` Kommentar (Kassenzeichen-Regex) | `X00001312288708X oder 00001312288708` | `X0000000000000X oder 00000000000000` |

Beide sind reine Kommentare ohne Logikbezug (GRÜN). Die zugehoerigen RegEx-Funktionen sind unveraendert.

## Hinweis zu Test-Dateien

Die Smoke-Test-Datei `smoke_v339_robust.js` enthaelt die oeffentlich bekannte Test-IBAN `DE89370400440532013000` (Standard-Beispiel der Deutschen Kreditwirtschaft, kein realer Kontoinhaber) ausschliesslich zur Validierung der `validateIban`-Pruefziffernlogik. Sie steht in der Test-Datei, nicht in `index.html`, und ist kein personenbezogenes Datum.

## Abgleich mit Smoke-Test

`smoke_v338_full.js` (Modul Personendaten) prueft weiterhin automatisch bei jedem Lauf:
- kein `Mariana Cannabis`
- keine hardcoded E-Mail-Adressen
- keine hardcoded deutsche IBAN

Alle drei Asserts gruen.
