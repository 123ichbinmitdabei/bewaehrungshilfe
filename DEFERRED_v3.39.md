# Deferred v3.39 (ROT-Zone-Vorschläge und offene Punkte)

Stand: 2026-06-19. Diese Punkte wurden im Nachtlauf BEWUSST NICHT implementiert, weil sie in die ROT-Zone fallen (Speicher-Schema, Backup-Format, Auth, Service-Worker-Aktivierung) oder nicht ohne Risiko fuer das Bestaetigungs-Invariant migrierbar waren. Sie sind als Vorschlag fuer eine spaetere, kontrollierte Release dokumentiert.

Es wurden KEINE Pakete abgebrochen. Alle Pakete A bis G sind abgeschlossen, das Gate ist gruen.

---

## 1. Service-Worker-Aktivierung (ROT)

- **Was:** Echtes Offline-Caching und sauberes Cache-Busting gegen das Desktop-"alte-Version-haengt"-Symptom.
- **Status:** Prototyp `sw.js` erstellt, Registrierung in `index.html` nur als auskommentierter Block. NICHT aktiviert.
- **Warum deferred:** Ein fehlerhafter SW kann Nutzer dauerhaft auf einer kaputten Version einsperren. Ueber Nacht ohne Kontrolle nicht vertretbar. Bricht zudem die Single-File-Idee.
- **Naechster Schritt:** Manuelle Aktivierung nach dem Test-Plan in `SW_PROPOSAL_v3.39.md` (5 Schritte plus Kill-Switch), nur mit menschlicher Freigabe.

## 2. Speicher-Quota strukturell entschaerfen (ROT, Schema)

- **Was:** `localStorage` ist auf ca. 5 bis 10 MB begrenzt. Base64-Belege fuellen das schnell. v3.39 faengt den Quota-Fehler ab und warnt (GELB, in Paket D umgesetzt), loest aber nicht die Ursache.
- **Vorschlag:** Migration der Belege/Attachments nach IndexedDB (deutlich groesseres Limit) oder Kompression der Base64-Bilder beim Speichern.
- **Warum deferred:** Aendert das Speicher-Schema und erfordert eine Daten-Migration bestehender Nutzerdaten. ROT-Zone, Risiko fuer reale Daten.

## 3. Backup-Format-Versionierung (ROT, Backup-Format)

- **Was:** Import prueft `version <= 4` und merged. Eine robustere Migrationskette (v1..v4 -> aktuell) mit Validierung pro Feld waere sauberer.
- **Warum deferred:** Aenderung am Import-/Backup-Format kann bestehende Nutzer-Backups brechen. ROT-Zone.

## 4. Mehrstufige native Dialoge (GELB, bewusst belassen)

In Paket C wurden alle einfachen destruktiven `confirm()` und der einzige `prompt()` migriert. Bewusst nativ belassen, da fail-safe und nicht ohne Risiko fuer das Invariant migrierbar:

| Aufrufer | Grund |
|---|---|
| `confirmAppointment` (missed/cancelled plus Ersatz-Termin) | mehrstufig, `setTimeout`, native confirm ist fail-safe |
| `confirmPayment` postponed-Zweig (plus Folgetermin) | mehrstufig, fail-safe |
| `handleSozialDone` | Abbrechen MUSS trotzdem Status setzen, passt nicht ins verwerfen-bei-Abbruch-Modal |
| `triggerImport` (2 confirms, Ueberschreiben) | destruktiv, aber native confirm ist fail-safe; async-File-Flow-Migration zu riskant |
| OCR-/PDF-Groessen-/Share-Fallback-Dialoge | nicht destruktiv, teils in Schleifen, Boolean synchron gebraucht |

- **Vorschlag spaeter:** Diese Stellen schrittweise und einzeln getestet migrieren, sobald ein async-faehiges Modal-Pattern (Promise-basiert) eingefuehrt ist.

## 5. Optionale CSS-/UX-Verbesserungen (GRÜN, aber kein Bug, daher nicht erzwungen)

- `min-height: 100vh` -> `100dvh` fuer iOS (kosmetisch, aktuell nur Extra-Scrollflaeche, kein Layout-Bruch).
- Einige sekundaere Buttons leicht unter 44x44 px (Apple HIG). Auf Touch bedienbar.
- **Warum deferred:** Kein Funktionsfehler, nicht im Haerungsumfang notwendig. Kann jederzeit als reines Styling nachgezogen werden.

## 6. `printFormular` und Druck (erledigt, kein offener Punkt mehr)

- Der in v3.38 notierte Folgepunkt (printFormular ohne Reflow) wurde in v3.39 GELB-gefixt. Kein offener Druck-Punkt mehr.

---

## Nicht offen / erledigt

- Funktions-Vollaudit, Logik/Dead-Code, Dialog-Migration (einfache Faelle), Storage-Quota-Behandlung, Lade-Guards, Eingabe-Validierung, Repo-Aufraeumen, Personendaten-Audit, em-dash-Bereinigung, Version-Bump: alle erledigt und getestet.
