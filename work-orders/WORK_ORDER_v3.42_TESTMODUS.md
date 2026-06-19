# WORK ORDER v3.42 — Touch-Targets plus interaktiver Test-Modus

**Projekt:** Bewährungshilfe-Assistent (Single-File PWA)
**Hauptdatei:** `index.html` (plus `sw.js`, nicht aktiviert)
**Live:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/
**Repo:** https://github.com/123ichbinmitdabei/bewaehrungshilfe (Owner `123ichbinmitdabei`)
**Ausgangsstand:** v3.41, 677 Smoke-Asserts grün, Parse-Check OK, live deployed. SW gebaut, NICHT registriert.
**Zielversion:** v3.42
**Art:** Paket D (kosmetische Touch-Targets) plus ein eingebauter, interaktiver Test-Modus zum strukturierten manuellen Durchtesten aller Funktionen, mit Dummy-Daten-Paket.

Autonom über Nacht, kein menschlicher Ansprechpartner. Wo du fragen würdest: nicht implementieren, in `DEFERRED_v3.42.md` dokumentieren, weiter.

---

## 0. Sicherheits-Setup (zuerst, zwingend)

1. Branch `main`, working tree clean prüfen.
2. Rollback-Anker:
   ```bash
   git tag pre-v3.42-testmodus
   ```
3. Baseline-Gate (muss grün, sonst stoppen und in `DEFERRED_v3.42.md` vermerken):
   ```bash
   node check_js.js
   node smoke_v338_sync.js
   node smoke_v338_full.js
   for f in smoke_v339_*.js smoke_v340_*.js smoke_v341_*.js; do node "$f" | tail -1; done
   ```

---

## 1. Autonomie-Zonen

- **GRÜN:** neuer, isolierter Code mit Test (der Test-Modus ist GRÜN, solange er die harten Regeln unten einhält), Touch-Target-Styling.
- **GELB:** Touch-Target-Änderungen die Layout berühren, konservativ, kleiner Diff, nach jeder Änderung Voll-Gate.
- **ROT, nur dokumentieren:** alles was App-Daten-Keys, Speicher-Schema, Backup-/Export-Format oder Auth verändert.

## 2. HARTE REGELN für den Test-Modus (Datensicherheit, nicht verhandelbar)

Diese App enthält reale, sensible Daten von Menschen in Bewährung. Der Test-Modus darf diese NIEMALS gefährden:

1. **Eigener Namespace.** Der Test-Modus speichert ausschließlich unter Keys mit Präfix `bh_test_`. Er liest und schreibt NIE die App-Daten-Keys (`ear_wizard_v1`, `*_wizard_v1`, `bh_shared`, `bh_notes`, `bh_inbox`, `bh_contacts`, `bh_brief_history`, `bh_custom_templates`, `bh_termin_prep`, Settings, PIN, Backup-Reminder usw.).
2. **Kein In-Place-Laden von Dummy-Daten.** Der Test-Modus hat KEINEN Knopf, der Dummy-Daten in das aktuelle Profil schreibt. Er stellt die Dummy-Daten nur als Download (`testdaten.json`) bereit. Anleitung im UI: in einem privaten Fenster bzw. separaten Browser-Profil importieren, damit die echten Daten unberührt bleiben.
3. **Kein Schema-/Format-Eingriff.** Der Test-Modus ändert weder das App-Daten-Schema noch das Backup-/Import-Format.
4. **Inert für normale Nutzer.** Der Test-Modus ist nur über einen bewussten Knopf (Einstellungen) bzw. `#testmodus` erreichbar, niemals automatisch aktiv.
5. **Sauber entfernbar.** Der gesamte Test-Modus-Code ist mit klaren Markern umschlossen (`// === TESTMODUS START ===` / `// === TESTMODUS ENDE ===`), Button und Keys inklusive, plus Entfern-Anleitung in `TESTMODUS_v3.42.md`, damit er später in einem Schritt entfernt werden kann.

## 3. Standing Constraints

Single-File (`index.html`, `sw.js` separat und unregistriert). `node check_js.js` nach JEDEM JS-Edit. Keine em-dashes (U+2014), Kommas. Deutsche Anführungszeichen `„…“`. Keine personenbezogenen Daten im Quelltext, auch nicht in den Dummy-Daten (siehe L5). Branding unverändert. Kein force-push. Commit via `-F`.

---

## Paket D — Touch-Targets (kosmetisch)

D1. Kandidaten finden: interaktive Elemente (Buttons, Icon-Buttons, kleine Toggles, Lösch-/Edit-Icons in Zeilen) mit effektiver Trefferfläche unter 44x44 px (Apple-Richtlinie). Vor allem die in `DEFERRED` genannten sekundären Buttons.

D2. Konservativ anheben: betroffenen geteilten Button-Klassen ein `min-height: 44px` und ausreichendes Tap-Padding geben, bei reinen Icon-Buttons auch `min-width: 44px`. Visuelles Gewicht und Branding möglichst unverändert lassen (z.B. über Padding/Hit-Area statt größerer Schrift). Kleiner Diff, kein Layout-Umbau.

D3. Verifikation: `node check_js.js`, bestehende Suite grün. Statischer Mini-Check als Teil der Tests (Paket M): die relevante Button-Klasse hat `min-height` gesetzt. Pixel-genaue Prüfung bleibt manuell (im Test-Modus, Bereich „UI/Touch“).

D4. Wenn ein Element nicht ohne Layout-Risiko vergrößerbar ist: nicht erzwingen, in `DEFERRED_v3.42.md` notieren.

---

## Paket L — Interaktiver Test-Modus

Ziel: ein eingebauter, geführter Test-Durchlauf, in dem du Schritt für Schritt durch alle Funktionen geführt wirst, jede Frage beantwortest (Bestanden / Fehler / Übersprungen / Blockiert), Notizen und Screenshots anhängst, und am Ende eine saubere, exportierbare Auswertung bekommst.

### L1. Einstieg und Rahmen
- Erreichbar über einen Knopf in den Einstellungen („🧪 Test-Modus, strukturiertes Durchtesten“) und über `#testmodus` im URL-Hash.
- Eigene Vollbild-Ansicht (wie die anderen Views), NICHT über die App-Inhalte gelegt, damit nichts verdeckt wird.
- Oben ein deutlicher Hinweis-Block: „Test-Modus. Speichert nur Test-Ergebnisse, fasst deine echten Daten nicht an. Zum Testen mit Dummy-Daten bitte ein privates Fenster nutzen, Anleitung unten.“

### L2. Test-Fall-Struktur (Inhalt)
- Die Test-Fälle aus `TESTPLAN_v3.40.md`, `TESTPLAN_v3.41_NACHTRAG.md` und dem Funktions-Inventar (`FUNKTIONS_AUDIT_v3.39.md`) ableiten und strukturiert als Daten-Array im Code hinterlegen (`TEST_CASES`), gruppiert nach Bereich, z.B.: Stammdaten/Onboarding, die 10 Wizards (je öffnen/Feld/Speichern/Reload), Adressbuch und Sync, Briefe und Vorlagen, Signatur (Pad UND Bild-Upload UND 1-Klick), Drucken (alle Pfade), Inbox/Belege/OCR, Backup Export plus Re-Import, Timeline, Setup-Checkliste, Achievements, Suche, Kalender/ICS, Eingabe-Validierung, Dialoge (jeweils Bestätigen UND Abbrechen), Modal-Nebenläufigkeit, Reset-Button, Touch-Targets, PWA/Offline.
- Jeder Test-Fall: eindeutige `id`, `bereich`, `titel`, `schritte` (nummerierte, exakte Schritt-für-Schritt-Anleitung), `erwartung` (was korrekt passieren muss). Vollständig, systematisch, kein Bereich ausgelassen.
- Schätzwert anstreben: mindestens 60 Test-Fälle, lieber gründlich als knapp.

### L3. Antwort- und Erfassungs-UI je Test-Fall
- Status-Auswahl: Bestanden / Fehler / Übersprungen / Blockiert (Default: offen).
- Notiz-Textfeld (frei).
- Bild-Anhang: `<input type="file" accept="image/*">`, mehrere Bilder pro Fall möglich. Jedes Bild VOR dem Speichern herunterskalieren (max. Kante ca. 1000 px, JPEG ca. 0.7) per Canvas, damit der Speicher nicht überläuft.
- Sofort-Persistenz: jede Antwort/Notiz/Bild sofort unter `bh_test_*` speichern, damit beim Navigieren nichts verloren geht.
- Fortschrittsanzeige (x von n beantwortet) und Filter (alle / offen / Fehler / bestanden).

### L4. Auswertung und Export
- „Ergebnisse exportieren“: erzeugt (a) eine `bh_testbericht.json` mit allen Antworten, Notizen und Bildern (Base64), und (b) einen lesbaren Bericht als eigenständige HTML-Datei mit eingebetteten Bildern, gruppiert nach Bereich, mit Zusammenfassung oben (Anzahl bestanden/Fehler/offen) und allen Fehler-Fällen zuerst, damit Korrekturen leicht abzuarbeiten sind.
- „Ergebnisse löschen“ (mit Bestätigung über das vorhandene `confirmAsync`).
- Quota-sicher: bei vollem Speicher den vorhandenen Quota-Hinweis nutzen und zum Export raten. Bilder sind der große Posten, daher Downscaling (L3) und Hinweis, Screenshots sparsam einzusetzen.

### L5. Dummy-Daten-Paket
- Eine `testdaten.json` erzeugen: eine GÜLTIGE Backup-Datei im aktuellen Export-Format (Format NICHT ändern, nur die vorhandene Struktur nachbilden), gefüllt mit realistischen aber rein synthetischen Dummy-Daten über alle Wizards, Kontakte, Notizen, ein paar Termine, eine EAR mit Beispielwerten, eine Beispiel-Zahlung. Ausschliesslich erfundene Daten, klar als Dummy erkennbar (z.B. „Max Mustermann“, „Erika Beispiel“, Test-IBAN, Beispiel-Aktenzeichen `1 Js 1234/21`). KEINE echten Personendaten.
- Im Test-Modus ein Knopf „Dummy-Testdaten herunterladen“, der `testdaten.json` als Download anbietet. KEIN In-Place-Laden.
- Klare Schritt-für-Schritt-Anleitung im UI und in `TESTMODUS_v3.42.md`: privates Fenster öffnen, App-URL laden, Daten importieren, testen, am Ende Ergebnisse exportieren bevor das Fenster geschlossen wird (privates Fenster verliert beim Schliessen seinen Speicher).
- `testdaten.json` auch als Datei ins Repo legen, damit du sie direkt hast.

### L6. Entfernbarkeit
- Gesamter Test-Modus-Code mit `// === TESTMODUS START ===` / `// === TESTMODUS ENDE ===` umschlossen, ebenso der Einstellungen-Knopf und etwaige CSS-Blöcke.
- `TESTMODUS_v3.42.md`: was der Test-Modus ist, wie man ihn nutzt (inkl. privates-Fenster-Workflow), und wie man ihn später in einem Schritt wieder entfernt (Marker-Blöcke, Button, `bh_test_*`-Keys).

---

## Paket M — Test plus Release

M1. Smoke-Tests für das, was in Node prüfbar ist (`smoke_v342_testmodus.js`):
- `TEST_CASES` ist wohlgeformt: jede Case hat id (eindeutig), bereich, titel, schritte, erwartung. Mindestanzahl erfüllt.
- Die Ergebnis-Speicherung nutzt ausschliesslich `bh_test_`-Keys: gegen einen Mock prüfen, dass beim Speichern eines Test-Ergebnisses KEIN App-Daten-Key beschrieben wird und nach einem simulierten Test-Lauf alle App-Daten-Keys unverändert sind.
- Der Export-Builder erzeugt gültiges JSON und einen nicht-leeren HTML-Bericht aus Beispiel-Ergebnissen.
- Die Bild-Downscale-Funktion ist als reine Funktion vorhanden und gibt bei zu grosser Eingabe eine verkleinerte Ausgabe zurück (gegen ein Canvas-Mock).
- `testdaten.json` ist gültiges JSON, entspricht dem Backup-Format und enthält keine Muster echter Personendaten (gleicher RegEx-Scan wie Personendaten-Audit).

M2. Touch-Target-Mini-Check (Paket D): relevante Button-Klasse hat `min-height` gesetzt.

M3. Voll-Gate grün inkl. `smoke_v342_*.js`. Gesamt-Asserts nicht gesunken (Basis 677 plus neu).

M4. Personendaten-Audit über `index.html`, `sw.js` UND `testdaten.json` (`PERSONENDATEN_AUDIT_v3.42.md`). Em-dash-Scan 0 U+2014 in allen neuen Deliverables.

M5. `APP_VERSION = "v3.42"`, README-Footer v3.42.

M6. `CHANGELOG_v3.42.md`, `PUBLISH.md`, `TESTMODUS_v3.42.md`, `DEFERRED_v3.42.md`. Work Order nach `work-orders/` archivieren.

M7. Commit (Message via `-F`), `git push origin main`, NUR bei grünem Gate, KEIN force-push. **SW-Registrierung bleibt auskommentiert.**

---

## Voll-Gate (nach jedem Paket)

```bash
node check_js.js && \
node smoke_v338_sync.js | tail -1 && \
node smoke_v338_full.js | tail -1 && \
for f in smoke_v339_*.js smoke_v340_*.js smoke_v341_*.js smoke_v342_*.js; do echo "== $f =="; node "$f" | tail -1; done
```
Grün, dann weiter. Rot, dann fixen bis grün. Ein Paket nicht grün zu bekommen: betroffene Änderungen mit `git checkout -- <datei>` zurücksetzen, deferred dokumentieren, weiter.

---

## Akzeptanzkriterien

- [ ] `git tag pre-v3.42-testmodus` gesetzt
- [ ] D: kleine Touch-Targets auf mindestens 44 px Trefferfläche, Branding/Layout intakt, Mini-Check
- [ ] L: Test-Modus erreichbar (Einstellungen plus `#testmodus`), eigene Ansicht, mind. 60 strukturierte Test-Fälle über alle Bereiche
- [ ] L: Status plus Notiz plus Bild-Anhang je Fall, sofort persistiert, Fortschritt plus Filter
- [ ] L: Export als JSON UND lesbarer HTML-Bericht (Fehler zuerst), Ergebnisse-löschen
- [ ] L: `testdaten.json` als Download und im Repo, nur synthetische Daten, privates-Fenster-Workflow dokumentiert
- [ ] HARTE REGELN eingehalten: nur `bh_test_*`-Keys, kein In-Place-Dummy-Load, kein Schema-/Format-Eingriff, sauber entfernbar (Marker)
- [ ] `smoke_v342_testmodus.js` plus Touch-Target-Check, Gesamt-Asserts nicht gesunken
- [ ] `PERSONENDATEN_AUDIT_v3.42.md` (inkl. `testdaten.json` sauber), 0 U+2014
- [ ] `APP_VERSION = "v3.42"`, README-Footer v3.42, Doku-Dateien angelegt
- [ ] Push nur bei grünem Gate, kein force-push, SW-Registrierung bleibt auskommentiert

---

## Was bei Problemen

- Parse/Test-Fail: fixen, neu testen, nicht skippen.
- Test-Modul wird zu gross/komplex: lieber weniger Schnickschnack, aber die harten Regeln und die saubere Erfassung plus Export müssen stehen.
- Irgendwas droht echte App-Daten-Keys, Schema oder Backup-Format zu berühren: sofort stoppen, dokumentieren, nicht umsetzen.
- Alles droht schiefzulaufen: `git reset --hard pre-v3.42-testmodus`, Lage in `DEFERRED_v3.42.md`, nicht pushen.

---

## Reihenfolge

0 (Setup) → D → L → M (Test/Release). Nach jedem Paket Voll-Gate.

Los.
