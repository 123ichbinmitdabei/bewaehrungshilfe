# Personendaten-Audit v3.38

**Datum:** 2026-06-18
**Datei:** `index.html` (Single-File PWA, public auf GitHub Pages)
**Anlass:** DSGVO-Pflicht, da die App oeffentlich deployed wird. Keine echten Namen, Adressen, Aktenzeichen, IBANs oder Telefonnummern duerfen im Quelltext stehen.

## Methodik

RegEx-Scan ueber `index.html` nach den im Work Order definierten Mustern:

| Muster | Treffer | Bewertung |
|---|---|---|
| E-Mail (`...@....`) | 0 echte (nur `@media`/`@page` CSS) | sauber |
| IBAN (`DE\d{20}`) | 0 | sauber |
| Telefon (DE) | 1 (Kommentar, Regex-Beispiel) | akzeptabel |
| Aktenzeichen (`\d+ Cs|Ds|Js... \d+/\d+`) | 2 (Kommentare, Regex-Beispiele) | akzeptabel |
| Strasse + Hausnummer | 0 | sauber |
| PLZ + Ort | 0 | sauber |
| Anrede + Eigenname | 1 (Platzhalter „Dr. Mueller, Max Mustermann") | akzeptabel |
| Arbeitgeber-Realname | 1 (`Mariana Cannabis e.V.`) | **GEFIXT** |

## Funde im Detail

### 1. GEFIXT, Arbeitgeber-Realname in Platzhalter
- **Stelle:** `DOCS.kosten`, Section `erklaerung_wirtschaft`, Feld `arbeitgeber` (vormals Zeile 1989)
- **Vorher:** `placeholder: "z.B. Mariana Cannabis e.V."`
- **Nachher:** `placeholder: "z.B. Muster GmbH"`
- **Grund:** „Mariana Cannabis e.V." ist der reale Arbeitgeber des Auftraggebers, kein generisches Beispiel. Ersetzt durch neutralen Platzhalter.

### 2. AKZEPTABEL, Aktenzeichen-Beispiele in Code-Kommentar
- **Stelle:** Beleg-Parser, Kommentar zur Regex (Zeile ~2674)
- **Inhalt:** `"1 Js 9771/21", "5 Ds 123/22"`
- **Grund:** Reine Dokumentation des Regex-Musters im Kommentar, keine echte Fallakte. Generisch wirkende Beispielwerte, kein Personenbezug. Werden nicht im UI angezeigt.

### 3. AKZEPTABEL, Kassenzeichen-Beispiel in Code-Kommentar
- **Stelle:** Beleg-Parser, Kommentar zur Regex (Zeile ~2679)
- **Inhalt:** `00001312288708` (Format-Beispiel Hessen)
- **Grund:** Format-Illustration im Kommentar, kein realer Bezug, nicht im UI.

### 4. AKZEPTABEL, Platzhalter-Namen im Unterschrift-Dialog
- **Stelle:** Signatur-Modal, `placeholder="z.B. Dr. Mueller, Caritas Marburg, Max Mustermann"`
- **Grund:** „Max Mustermann" ist der deutsche Standard-Platzhaltername. „Dr. Mueller" und „Caritas Marburg" sind generische Beispiele ohne Bezug zum Auftraggeber. Bleibt als Beispiel erhalten.

### 5. AKZEPTABEL, regionale Behoerden-Beispiele in Platzhaltern
- **Stelle:** `DOCS.kosten`, Section `verfahren`
- **Inhalt:** `"z.B. Staatsanwaltschaft Frankfurt am Main"`, `"z.B. Landesjustizkasse Hessen"`
- **Grund:** Oeffentliche Institutionen als regionales Beispiel, kein Personenbezug. Hilft dem Nutzer beim Verstaendnis. Bleibt erhalten.

### 6. AKZEPTABEL, Live-URL im Settings-Fallback
- **Stelle:** App-URL-Anzeige, Fallback `https://123ichbinmitdabei.github.io/bewaehrungshilfe/`
- **Grund:** Das ist die oeffentliche Deploy-URL der App selbst, keine geschuetzten Personendaten.

## Template-Bodies (ANSCHREIBEN_TEMPLATES)

Alle Body-Funktionen verwenden ausschliesslich dynamische Platzhalter (`${d.name}`, `${d.az}`, `____`, `(Unterschrift)`). Keine hardcodierten Empfaenger-Namen, Adressen oder Aktenzeichen. Salutationen sind generisch („Sehr geehrte Damen und Herren", „An die Bewaehrungshilfe").

## Default-Texte fuer eigene Vorlagen

`confirmAddCustomTpl` erzeugt: „Sehr geehrte Damen und Herren, [hier deinen Brieftext eingeben] ... " plus `state.shared?.name`. Nur dynamischer Nutzername, keine festen Personendaten.

## Ergebnis

- **1 verbotenes Vorkommen gefixt** (Arbeitgeber-Realname).
- **5 akzeptable Vorkommen dokumentiert** (Regex-Beispiele in Kommentaren, Standard-Platzhalter, oeffentliche Institutionen, Deploy-URL).
- **Keine offenen Funde.** Der Quelltext enthaelt nach dem Fix keine echten Personendaten mehr.

Automatisierte Re-Pruefung: siehe Assert-Gruppe „Personendaten" in `smoke_v338_full.js`.
