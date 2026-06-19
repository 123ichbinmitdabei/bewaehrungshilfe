# WORK ORDER v3.39 — Nachtlauf (Vollaudit, Auto-Fix, Cleanup)

**Projekt:** Bewährungshilfe-Assistent (Single-File PWA)
**Hauptdatei:** `index.html`
**Live:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/
**Repo:** https://github.com/123ichbinmitdabei/bewaehrungshilfe (Owner `123ichbinmitdabei`)
**Ausgangsstand:** v3.38, 311 Smoke-Asserts grün (`smoke_v338_sync.js` 105 + `smoke_v338_full.js` 206), Parse-Check via `check_js.js` OK
**Zielversion:** v3.39
**Art:** Härtungs- und Aufräum-Release. KEINE neuen Endnutzer-Features (die bleiben in `ROADMAP_v4.md`). Fokus: alles prüfen, sicher fixen, aufräumen.

Dieser Lauf ist autonom über Nacht. Es gibt keinen menschlichen Ansprechpartner. Wenn du normalerweise fragen würdest, gilt: nicht implementieren, sondern in `DEFERRED_v3.39.md` dokumentieren und weiterarbeiten.

---

## 0. Sicherheits-Setup (zuerst, zwingend)

1. Arbeitsverzeichnis prüfen, Branch `main`, working tree clean.
2. Rollback-Anker setzen, bevor irgendetwas geändert wird:
   ```bash
   git tag pre-v3.39-nachtlauf
   ```
   (Tag bleibt lokal, nicht pushen. Dient nur als Rückfallpunkt: `git reset --hard pre-v3.39-nachtlauf`.)
3. Baseline-Gate laufen lassen und Ergebnis notieren (muss grün sein, sonst stoppen und in `DEFERRED_v3.39.md` vermerken, NICHT weitermachen):
   ```bash
   node check_js.js
   node smoke_v338_sync.js
   node smoke_v338_full.js
   ```

---

## 1. Autonomie-Zonen (verbindlich)

**GRÜN, frei auto-fixen** (nach Fix sofort Voll-Gate, siehe Abschnitt 9):
- Bugs mit eindeutig korrektem Fix, der durch einen neuen oder bestehenden Smoke-Test abgesichert ist.
- Toter Code mit NULL Referenzen im gesamten `index.html` (inkl. String-Kontext, siehe Warnung unten).
- Formatierung, deutsche Anführungszeichen `„…“`, em-dashes zu Kommas, Whitespace, doppelte DOM-IDs.
- Fehlende Schutz-Guards (try/catch, Null-Checks, Parse-Guards).
- Kaputte Handler (onclick zeigt auf nicht existierende Funktion).

**GELB, konservativ fixen plus starkes Testen:**
- Kontrollfluss-Refactors (confirm/prompt-Migration, Paket C).
- Logikänderungen, die State oder Sync berühren.
- Bei jedem GELB-Fix: vorher und nachher Voll-Gate, plus gezielter Smoke-Test, der das geänderte Verhalten beweist. Im Zweifel nativen Code lassen und dokumentieren.

**ROT, NICHT ändern, nur in `DEFERRED_v3.39.md` als Vorschlag dokumentieren:**
- Alles, was das Format der in `localStorage` gespeicherten Daten ändert (Schema, Keys, Struktur).
- Jede Daten-Migration bestehender Nutzerdaten.
- Jede Änderung am Export-/Import-/Backup-Format (würde bestehende Backups der Nutzer brechen).
- Single-File-Architektur aufbrechen (Ausnahme: Paket G erzeugt eine separate Datei NUR als nicht aktivierter Prototyp).
- Auth, Sicherheit, Krypto.
- Service-Worker-Aktivierung (siehe Paket G).

Begründung ROT-Zone: Die App speichert reale, sensible Daten von Menschen in Bewährung lokal. Ein fehlerhafter Auto-Eingriff in Speicher- oder Backup-Format kann Nutzerdaten zerstören. Über Nacht ohne Kontrolle ist das Risiko nicht vertretbar.

**WARNUNG toter Code:** Eine Funktion gilt nur dann als tot, wenn sie NIRGENDS referenziert wird, auch nicht in `onclick="foo()"`-Attributstrings, Template-Literalen oder dynamisch zusammengebauten HTML-Strings. Vor jeder Entfernung: über die gesamte Datei nach dem Funktionsnamen greppen (Code UND String). Bei der kleinsten Unsicherheit: nicht entfernen, in `DEFERRED_v3.39.md` als „Verdacht tot, Referenzprüfung unsicher“ listen.

---

## 2. Standing Constraints

- Single-File: alle App-Änderungen ausschließlich in `index.html` (Ausnahme nur Paket G, dort separater, NICHT eingebundener Prototyp).
- `node check_js.js` nach JEDEM JS-Edit. Parse-Fehler sofort fixen, nie ignorieren.
- Keine em-dashes in deutschem Text, Kommas verwenden.
- Deutsche Anführungszeichen `„…“`, nie ASCII `"`.
- Keine personenbezogenen Daten im Quelltext (Namen, Adressen, IBAN, Aktenzeichen, Telefon, Mail). Platzhalter verwenden.
- Branding unverändert: `#08100b` Hintergrund, `#4caf6a` Grün, `#f9c74f` Akzent.
- Kein force-push. Niemals.
- Commit-Message via `-F datei.txt` (Datei ausserhalb des Repos oder vor dem finalen Add wieder löschen).

---

## Paket A — Funktions-Vollaudit

Ziel: jede Funktion der App einmal verifizieren, nicht stichprobenartig.

A1. Inventar erstellen: alle `DOCS` (Wizards), alle Sektionen je Wizard, alle Felder, alle Buttons mit Handler, alle Tabs/Ansichten, alle Modals.

A2. Render-Vollabdeckung: jeden Wizard und jede Hauptansicht unter dem gemockten Harness rendern, Assertion „kein Crash, erwartete Kern-Elemente vorhanden“. Auch Leerzustand (frischer State) und gefüllter Zustand.

A3. Feld-Roundtrip je Wizard: Wert setzen, State lesen, neu rendern, Wert noch da. Für mindestens je ein Text-, Zahl-, Datum-, Auswahl- und dynamisches Zeilenfeld pro Wizard-Typ.

A4. Sync-Vollabdeckung: alle 14 `DATA_SYNC_GROUPS` bidirektional (Doc zu Shared, Shared zu Adressbuch, und zurück). Jeder Mapping-Pfad muss auf ein existierendes Feld zeigen (Regression zu v3.36 verhindern). Bei totem Pfad: GRÜN-Fix auf das echte Feld, plus Test.

A5. Pipelines durchtesten: Brief-Erstellung mit Vorlage, Signatur-Einbettung, Druck-Container-Aufbau, ICS/Kalender-Export (gültiges VCALENDAR), Achievements-Trigger, Timeline-Filter, Setup-Checkliste-Fortschritt, globale Suche, Backup-Export plus Re-Import mit Identitätsprüfung (exportieren, in frischen State importieren, beide States tief gleich).

A6. Ergebnis als `FUNKTIONS_AUDIT_v3.39.md`: Tabelle Funktion | geprüft (ja/nein) | Ergebnis (ok/bug) | Fix (GRÜN gefixt / GELB gefixt / ROT deferred).

Neue Tests in `smoke_v339_funktion.js`.

---

## Paket B — Logik, Dead-Code, Konsistenz

B1. Handler-Integrität: jeden `onclick`, `onchange`, `oninput` etc. im HTML-String einsammeln, prüfen ob die referenzierte Funktion existiert. Verwaiste Handler GRÜN-fixen (auf richtige Funktion zeigen lassen) oder, wenn die Funktion fehlt und Zweck unklar ist, dokumentieren.

B2. Tote Funktionen: alle Funktionsdefinitionen einsammeln, Referenzzählung über gesamte Datei (Code plus Strings, siehe Warnung Abschnitt 1). Nur bei NULL Referenzen entfernen, danach Voll-Gate.

B3. Tote CSS-Selektoren: Klassen/IDs im `<style>`, die nirgends im Markup oder in erzeugten HTML-Strings vorkommen, sammeln. Nur eindeutig tote entfernen. Im Zweifel behalten.

B4. Doppelte DOM-IDs: scannen, auflösen (eindeutig machen), Handler entsprechend nachziehen.

B5. State-Konsistenz: alle Zugriffe `state.xyz` und `state.docs[id].…` gegen die Default-State-Struktur prüfen. Zugriffe auf nicht existierende Felder finden (häufige Fehlerquelle). GRÜN-fixen wo eindeutig, sonst dokumentieren.

B6. Debug-Reste: `console.log`/`console.debug` entfernen, `console.error`/`console.warn` für echte Fehlerpfade behalten. `TODO`/`FIXME`/`XXX` einsammeln und in `FUNKTIONS_AUDIT_v3.39.md` listen.

B7. Verschluckte Fehler: leere `catch {}`-Blöcke finden, mindestens `console.warn` ergänzen, kritische Pfade dem Nutzer melden.

Befunde und Fixes in `FUNKTIONS_AUDIT_v3.39.md` (Abschnitt „Logik und Cleanup“). Tests in `smoke_v339_logik.js`.

---

## Paket C — Cross-Platform plus gezielte Fixes

C1. Statische Plattform-Analyse erneut, diesmal mit Fix-Mandat:
- iOS Safari PWA standalone: `100vh`-Fallen, `env(safe-area-inset-*)`, `-webkit-`-Präfixe, Input-Zoom (Font mindestens 16px bei Eingaben), `position: sticky`, Date/File-Inputs, Clipboard, Druckverhalten.
- Chrome Android, Desktop (Chrome/Edge/Firefox).
- A3-Druck-Fix gegen das Live-Symptom „Drucken reagiert nicht“ im Code-Pfad nachvollziehen und bestätigen, dass `window.open` nirgends mehr im Druckpfad steckt.
- Desktop-Sync-Symptom: bestätigen, dass es ein Cache-Symptom ist und kein Logikfehler (Sync-Code ist in v3.38 getestet grün). Falls doch ein Code-Pfad gefunden wird, der am Desktop anders läuft: GELB-fixen plus Test.

C2. Native Dialoge migrieren (GELB, mit hartem Sicherheits-Invariant):
- Die verbliebenen `prompt()`-Aufrufe auf ein wiederverwendbares Input-Modal umstellen (nutze die vorhandene `confirmAction`-Modal-Infrastruktur als Vorlage, baue analog ein `inputModal(text, {default, onOk})`).
- `confirm()`-Aufrufe auf `confirmAction` umstellen, wo die Folgelogik sauber in eine `onConfirm`-Closure passt.
- HARTES INVARIANT: Eine destruktive Aktion (Löschen, Zurücksetzen, Import-Überschreiben) darf NIE ausgelöst werden, ohne dass der Nutzer bestätigt hat. Wenn ein Aufrufort nicht sicher migrierbar ist, ohne dieses Invariant zu riskieren: nativen Aufruf lassen und dokumentieren. Fail-safe vor Vollständigkeit.
- Jede Migration braucht einen Smoke-Test: Bestätigen führt die Aktion aus, Abbrechen führt sie NICHT aus.

C3. `CROSS_BROWSER_REPORT_v3.39.md`: aktualisierte Matrix, Liste der tatsächlich migrierten Dialoge, Liste der bewusst nativ belassenen mit Begründung. Abschnitt „Bekannte Live-Symptome“ aus v3.38 übernehmen und Status aktualisieren.

Tests in `smoke_v339_dialoge.js`.

---

## Paket D — Robustheit

D1. Storage-Quota: alle `localStorage.setItem`-Pfade kapseln, `QuotaExceededError` abfangen, dem Nutzer eine verständliche Meldung zeigen („Speicher voll, bitte alte Daten exportieren und löschen“), App darf nicht still scheitern. Achtung ROT-Zone: KEINE Änderung am Speicher-Schema, nur Fehlerbehandlung drumherum.

D2. Lade-Guards: jeder `JSON.parse` beim App-Start gegen korrupte/teilweise `localStorage`-Inhalte absichern (try/catch, bei Fehler auf sauberen Default für genau diesen Key zurückfallen, NICHT die ganze App weiss werden lassen, andere Keys nicht anfassen). Eine korrupte Datei darf nicht alle Daten unbrauchbar machen.

D3. Eingabe-Validierung (nur Anzeige/Warnung, keine Datenumformung): IBAN-Format, Datumsplausibilität, Beträge numerisch. Bei Ungültigkeit dezenter Hinweis, kein Blockieren der Eingabe, keine stille Korrektur gespeicherter Werte.

Tests in `smoke_v339_robust.js` (Quota-Mock wirft, Parse-Guard bekommt Schrott-JSON, Validatoren mit gültig/ungültig).

---

## Paket E — Aufräumen (Repo)

E1. Einmal-Scratch entfernen: `commit-message-v3.38.txt` löschen (Commit-Messages künftig über temporäre Datei ausserhalb des Repos erzeugen).
E2. Alte Work Orders archivieren: `WORK_ORDER_v3.38.md` und dieses `WORK_ORDER_v3.39_NACHTLAUF.md` per `git mv` nach `work-orders/` verschieben. Kein Code-Pfad hängt davon ab.
E3. `.gitignore` anlegen/erweitern: `node_modules/`, `*.log`, `.DS_Store`, `Thumbs.db`, etwaige temporäre Build-Dateien.
E4. Test-Harness und Smoke-Dateien bleiben im Repo getrackt und im Root liegen (die Pfadlogik in `smoke_bootstrap.js`/`check_js.js` liest `index.html` über `__dirname`, NICHT verschieben, sonst bricht der Pfad).
E5. Reports dieser Release liegen im Root wie gehabt.
E6. In `index.html`: Ergebnisse aus B2/B3 anwenden (toter Code/CSS bereits dort entfernt), zusätzlich Whitespace und Einrückung im `<script>` konsistent halten, ohne Logik zu ändern.
E7. README nur anpassen, falls sich Dateipfade durch E2 ändern (Verweise korrigieren). Sonst README unverändert (ist nach dem Merge-Fix sauber auf v3.38-Stand, Footer dann auf v3.39 ziehen, siehe Paket F).

---

## Paket F — Regressionssuite plus Release

F1. Personendaten-Audit erneut über `index.html` (RegEx wie v3.38). Funde fixen. `PERSONENDATEN_AUDIT_v3.39.md`.
F2. Volles Gate grün: `node check_js.js`, alle `smoke_v338_*.js` UND alle neuen `smoke_v339_*.js`. Summe der Asserts muss mindestens 311 plus die neuen sein, kein Rückgang.
F3. Em-dash-Scan über alle erzeugten/geänderten `.md` und über deutsche Strings in `index.html`: U+2014 darf nicht vorkommen.
F4. Version-Bump: `APP_VERSION = "v3.39"`, README-Footer auf v3.39.
F5. `CHANGELOG_v3.39.md` und `PUBLISH.md` aktualisieren (präzise Auflistung aller Fixes, getrennt nach GRÜN gefixt / GELB gefixt / ROT deferred).
F6. Bundle-Größe protokollieren.
F7. Commit (eine logische Release, Message via `-F`), dann `git push origin main`, NUR wenn alles grün ist. Bei rotem Gate: nicht pushen, lokal lassen, in `DEFERRED_v3.39.md` festhalten was offen blieb.

---

## Paket G (optional, gated) — Service-Worker-Proposal, NICHT aktivieren

Hintergrund: Das Desktop-Cache-Symptom (alte Version bleibt hängen) wäre mit einem Service Worker mit Versions-Hash und Network-First-Strategie sauber lösbar. ABER: ein fehlerhafter Service Worker kann Nutzer dauerhaft auf einer kaputten Version einsperren. Das über Nacht ohne Kontrolle scharfzuschalten ist zu riskant, und es bricht die Single-File-Idee (ein SW muss eine eigene Datei sein).

Auftrag:
- `sw.js` als Prototyp erstellen: Network-First für `index.html`, Cache-Name mit Versions-Hash, sauberer `activate`-Handler der alte Caches löscht, `skipWaiting`/`clients.claim`-Strategie dokumentiert.
- Die Registrierung in `index.html` NUR als auskommentierten Block plus Kommentar einfügen, NICHT aktiv.
- `SW_PROPOSAL_v3.39.md`: wie aktivieren, Risiken, Test-Plan (5 Schritte: deployen, alte Version cachen lassen, neue Version deployen, prüfen ob Update durchkommt, Notfall-Deregistrierung), und eine „Kill-Switch“-Anleitung (wie man einen ausgelieferten SW wieder los wird).
- Kein automatisches Scharfschalten. Aktivierung erfordert ausdrückliche menschliche Freigabe.

Wenn G zeitlich nicht mehr passt: überspringen, in `DEFERRED_v3.39.md` notieren.

---

## 9. Voll-Gate (nach jedem Paket auszuführen)

```bash
node check_js.js && \
node smoke_v338_sync.js | tail -2 && \
node smoke_v338_full.js | tail -2 && \
for f in smoke_v339_*.js; do echo "== $f =="; node "$f" | tail -2; done
```
Regel: grün, dann weiter. Rot, dann den Fix dieses Pakets reparieren bis grün. Lässt sich ein Paket nicht grün bekommen: betroffene Änderungen mit `git checkout -- <datei>` zurücksetzen, Paket als deferred dokumentieren, mit dem nächsten Paket weitermachen. Ein kaputtes Paket darf den Rest nicht blockieren.

---

## Akzeptanzkriterien

- [ ] `git tag pre-v3.39-nachtlauf` gesetzt
- [ ] `FUNKTIONS_AUDIT_v3.39.md` mit vollständiger Funktions-Matrix
- [ ] `CROSS_BROWSER_REPORT_v3.39.md` aktualisiert
- [ ] `PERSONENDATEN_AUDIT_v3.39.md` vorhanden
- [ ] `CHANGELOG_v3.39.md` und `PUBLISH.md` aktuell
- [ ] `DEFERRED_v3.39.md` listet alle ROT-Zone-Vorschläge und nicht abgeschlossene Pakete
- [ ] neue `smoke_v339_*.js`, Gesamt-Asserts nicht gesunken
- [ ] `node check_js.js` OK, alle Smoke-Suites grün
- [ ] kein U+2014 in deutschem Output
- [ ] `APP_VERSION = "v3.39"`, README-Footer v3.39
- [ ] kein Storage-Schema-, Backup-Format- oder Auth-Eingriff (nur dokumentiert)
- [ ] Push erfolgt nur bei grünem finalem Gate, kein force-push
- [ ] Paket G (falls gemacht): `sw.js` existiert, Registrierung NICHT aktiv

---

## Was bei Problemen

- Parse-Fail: sofort fixen, Ursache im `check_js.js`-Output.
- Test-Fail: diagnostizieren, in `index.html` fixen, neu testen. Nicht skippen.
- Unklarheit oder ROT-Zone: nicht raten, nicht implementieren, in `DEFERRED_v3.39.md` als Vorschlag.
- Etwas droht Nutzerdaten oder Backup-Format zu berühren: Finger weg, dokumentieren.
- Alles drohte schiefzulaufen: `git reset --hard pre-v3.39-nachtlauf`, Lage in `DEFERRED_v3.39.md` schildern, nicht pushen.

---

## Reihenfolge

0 (Setup) → A → B → E6 (Code-Cleanup aus A/B) → C → D → E (Repo-Cleanup) → F (Release) → G (optional). Nach jedem Buchstaben Voll-Gate.

Los.
