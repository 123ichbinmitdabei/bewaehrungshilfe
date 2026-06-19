# Deferred v3.42 (offene Punkte und ROT-Zone)

Stand: 2026-06-19. Fortschreibung von `DEFERRED_v3.41.md` nach Paket D (Touch-Targets) und Paket L (Test-Modus).

## In v3.42 erledigt

| Punkt | Status |
|---|---|
| Touch-Targets (kosmetisch, war D in v3.41 deferred) | **Teilweise erledigt:** `.btn` mit `min-height: 44px`, Icon-Buttons der Kopfzeile auf 44x44. Mini-Check in `smoke_v342_testmodus.js`. |
| Eingebauter Test-Modus | **Erledigt (L):** strukturierter Durchlauf, 62 Faelle, Status/Notiz/Bild, Export JSON plus HTML, `testdaten.json`. Test: `smoke_v342_testmodus.js`. |

## Bewusst nicht erzwungen (Paket D, Layout-Risiko)

- **Tabelleninterne Mini-Controls** (`.row-delete`, `.row-calendar-btn`): liegen in dichten Tabellenzeilen. Ein `min-height: 44px` wuerde die Zeilenhoehe deutlich vergroessern und das Tabellenlayout sprengen. Per Work-Order D4 nicht erzwungen. Moeglicher spaeterer Weg: groessere Hit-Area allein ueber Padding mit negativem Margin, nur nach gezieltem Real-Geraete-Test.
- Die zentralen, haeufig genutzten Buttons (`.btn`, Kopf-Icon-Buttons) erfuellen 44 px. Die mobilen Media-Queries setzten fuer `.nav .btn`, Eingabefelder und Checkboxen schon vorher 44 px plus.

## Weiter deferred (ROT-Zone, bewusst nicht angefasst)

### A. Service-Worker-AKTIVIERUNG (gestaged, nicht live)
- `sw.js` ist produktionsreif, die Registrierung in `index.html` bleibt auskommentiert. Aktivierung nur nach `SW_ACTIVATION_v3.40.md`. In v3.42 unveraendert.

### B. Speicher-Quota strukturell entschaerfen (ROT, Schema)
- Unveraendert deferred. Attachments nach IndexedDB oder Base64-Kompression wuerde das Schema aendern. Der Test-Modus verschaerft das nicht: Bilder werden vor dem Speichern verkleinert, der Quota-Hinweis greift, Export wird empfohlen.

### C. Backup-Format-Versionierung (ROT, Backup-Format)
- Unveraendert deferred. Der Test-Modus fasst das Backup-Format NICHT an, `testdaten.json` bildet nur das vorhandene Format (Version 4) nach.

## Hinweis zum Test-Modus-Scan

`smoke_v338_full.js` erlaubt jetzt reservierte Beispiel-Domains (RFC 2606: `example.com/.org/.net`) im Quelltext, weil die synthetischen Dummy-Daten solche Adressen verwenden. Reale Emails wuerden weiterhin gemeldet. Details in `PERSONENDATEN_AUDIT_v3.42.md`.
