# WORK ORDER für Claude Code — Bewährungshilfe-Assistent v3.37 → v3.38

**Repo**: `123ichbinmitdabei/bewaehrungshilfe`
**Datei**: `index.html` (single-file HTML PWA, ~800 KB)
**Aktuelle Version**: v3.37 (lokal vorhanden, muss kopiert werden)
**Ziel-Version**: v3.38

**Auftraggeber**: Andre (CM-Lead Mariana Cannabis, DSGVO-Verantwortlicher)
**Live-URL**: https://123ichbinmitdabei.github.io/bewaehrungshilfe/

---

## Mission

Folgende Live-Tester-Bugs sind in v3.34/35/36 NICHT überzeugend gelöst worden, in v3.37 mit „direkten" Lösungen wiederholt angegangen worden. Dein Auftrag:

1. **Verifizieren** dass v3.37-Fixes funktionieren (Sync-Knopf, zweistufiger Lösch-Klick, Print-Reflow)
2. **Personendaten-Audit**: Alle Brief- und Doc-Vorlagen prüfen — keine hardcoded Namen/Adressen/Aktenzeichen mehr, nur Platzhalter
3. **Cross-Browser/Cross-Platform-Audit**: PC (Chrome/Firefox/Safari/Edge), Mobile (iOS Safari, Chrome Android), Tablet (iPad Safari, Android Tablet)
4. **Vollständiger Selbsttest**: Neue umfassende Suite die ALLE kritischen Funktionen prüft
5. **Architekturvorschläge** für die 3 offenen Pakete (PDF-Annotation, E2E-Cloud-Sync, KI-Brief-Verbesserung)
6. **Release v3.38**: Version bump, Commit, Push

---

## Constraints (NICHT VERHANDELBAR)

- **Single-file HTML PWA**: ALLE Änderungen in `index.html`. Nichts auslagern.
- **node --check nach JEDEM JS-Edit**: Parse-Fehler sofort sehen.
- **Kein em-dash (—)** in deutschem Output. Stattdessen Kommas. Auch in PUBLISH.md und Commit-Messages.
- **Deutsche Anführungszeichen**: `„…"` (Unicode `\u201E` / `\u201C`), nicht `"…"`. In JS-Strings als `\u201E` und `\u201C` schreiben.
- **Dark forest-green Branding**: Hintergrund `#08100b`, Primär `#4caf6a`, Akzent `#f9c74f`. Keine anderen Farb-Themen.
- **Offline-first**: Keine externen Scripts (CDNs), keine Fetch-Calls außer denen die schon da sind.
- **Smoke-Tests mit mocked browser globals**: explicit `function(){}`-Syntax, keine pfeil-functions in den globals.
- **Andre's Stil**: terse, bullet-point, em-dashes → commas. Im Code-Comment ist em-dash OK, in Prosa-Output nicht.
- **Push erst nach allen grünen Tests**. Falls Test-Suite fehlschlägt: fixen, nicht skippen.

---

## Aufgabe A: Verifikation v3.37-Fixes

### A1. Sync-Knopf
- Suche `function manualSyncFromDocs` und `function syncSharedToContacts`
- Verifiziere: `DATA_SYNC_GROUPS` enthält die korrekten Feld-Pfade
- Vergleiche jedes Mapping mit der echten Doc-Struktur in `const DOCS = {…}`:
  - `thera/briefkopf/name|tel|email|praxis` — verifiziere Feld-Existenz
  - `kosten/verfahren/behoerde_sta|behoerde_kasse|az_sta|az_gericht|az_landesjustizkasse` — verifizieren
  - `kosten/anwaltskosten/verteidiger_name` — verifizieren
  - `kosten/erklaerung_wirtschaft/arbeitgeber` — verifizieren
  - `ear/arbeit/lohn` — verifizieren
- Falls ein Mapping auf nicht-existierende Felder zeigt: FIX im DATA_SYNC_GROUPS-Array
- Schreibe neue Smoke-Asserts in `smoke_v338_sync.js`:
  - Lege state.docs.thera.answers["briefkopf.name"] auf "Dr. Test" → reconcileAllSyncGroups → state.shared.therapeut sollte "Dr. Test" sein
  - syncSharedToContacts → state.contacts sollte einen therapeut-Kontakt mit name="Dr. Test" enthalten
  - Analog für alle 14 Sync-Gruppen

### A2. Zweistufiger Lösch-Klick
- `deleteContact` und `deleteCustomTemplate` müssen `state.pendingDeleteContactId` bzw. `state.pendingDeleteTplKey` als Toggle nutzen
- Render-Logik in `renderContactsView` und Brief-Editor zeigt rot-markierten Knopf wenn pending
- 3-Sekunden-Timeout resettet automatisch
- Smoke-Asserts: erster Klick → pending; zweiter Klick → gelöscht

### A3. Print-Reflow
- `openPrintWindow` und `_doPrintAnschreiben` müssen `void container.offsetHeight` + `requestAnimationFrame` + `setTimeout(100)` vor `window.print()` haben
- Bei leerem Container: explizites `alert()`
- Bei `window.print()`-Fehler: `alert()` mit Fehler

---

## Aufgabe B: Personendaten-Audit

**KRITISCH wegen DSGVO und weil die App auf GitHub Pages public deployed wird.**

Durchsuche `index.html` nach folgenden Patterns (RegEx-Empfehlung):

```
# Namen-Pattern (Vor- und Nachname)
\b[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+\b

# E-Mail-Pattern
[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}

# Telefon-Pattern (DE)
\b0\d{2,5}[-\s]?\d{4,}\b

# IBAN
\bDE\d{20}\b

# Aktenzeichen-Pattern
\b\d+\s?(?:Cs|Ds|Ls|Ns|Ws|StA)\s?\d+(?:/\d+)?\b

# Adresse-Pattern (Straße + Nummer)
\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|weg|allee|platz|gasse)\s+\d+[a-z]?\b

# Postleitzahl + Ort
\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+\b
```

**Erlaubte Vorkommen** (ignorieren — das sind Platzhalter):
- `state.shared?.name`, `state.shared.bewaehrungshelfer`, etc. (dynamische Zugriffe)
- Platzhalter wie `____`, `[Name]`, `<Name>`, `${d.…}`
- Beispiele in `placeholder`-Attributen wie `placeholder="z.B. Mariana Cannabis e.V."` (die sind OK, aber **Mariana Cannabis e.V.** ist Andre's Arbeitgeber-Realname; ersetzen durch generisches Beispiel)
- Hint-Texte mit Beispielen wie "Hauptstraße 12" (akzeptabel als Beispiel)
- Test-Daten in Smoke-Files (`smoke_*.js`) — nicht relevant, werden nicht deployed

**Verbotene Vorkommen** (FIX):
- Echte Namen in `body: () => "Sehr geehrter Herr Schmidt, ..."` Vorlagen
- Hardcoded Adressen in Brief-Templates
- E-Mails wie `andre@example.com`, `mariana@…`, `123ichbinmitdabei@…` außerhalb von Platzhalter-Kontexten
- Aktenzeichen wie `123 Cs 456/24` in Vorlagen-Texten
- Telefon-Nummern in Beispielen wenn sie Andre's eigene sind

**Konkrete Bekannte Stellen die zu prüfen sind**:
- `ANSCHREIBEN_TEMPLATES` — alle Body-Funktionen
- `DOCS.*.sections.*.fields.*.placeholder` — Beispiel-Werte
- README-Inhalte
- Default-Texte für eigene Vorlagen (in `addCustomTemplate`/`confirmAddCustomTpl`)

**Output**: 
- Generiere `PERSONENDATEN_AUDIT.md` mit Liste aller Funde + Status (gefixt / akzeptabel / offen)
- Fixe alle „verbotenen" Vorkommen direkt in `index.html`

---

## Aufgabe C: Cross-Browser/Cross-Platform-Audit

**CC kann keine echten Browser-Tests laufen lassen — aber statische Code-Analyse und bekannte Inkompatibilitäten prüfen.**

### Prüfe folgende Bekannte Issues:

1. **iOS Safari / PWA-Modus**:
   - `confirm()` und `prompt()` sind unzuverlässig → bestätigen dass v3.37 sie nicht mehr nutzt
   - `window.open("", "_blank")` blockiert → bestätigen dass Inline-Print überall genutzt wird
   - LocalStorage in private mode begrenzt → Fehlerbehandlung in Storage-Wrappern prüfen
   - Touch-Targets mindestens 44×44 px (Apple HIG)
   - `position: fixed` + Keyboard kann Layout zerstören → Wizard-Eingabefelder testen
   - 100vh-Bug (Safari rechnet UI-Chrome anders)

2. **Chrome Android**:
   - PWA-Install via `beforeinstallprompt`-Event — vorhanden?
   - Address-Bar-Hide ändert Viewport-Höhe
   - File-Input für Belege funktioniert?

3. **Firefox**:
   - `inputmode`-Attribute werden anders interpretiert
   - PWA-Install nicht (außer Android)

4. **Desktop alle**:
   - Strg+P / Cmd+P sollte Inline-Print triggern
   - Keyboard-Navigation (Tab) durch Felder
   - Print-Vorschau mit `@media print`

5. **Allgemein**:
   - Keine `optional chaining` in CSS-Selektoren oder regex
   - `?.` in JS — IE11 nicht unterstützt, aber IE11 ist tot, OK
   - Async/Await — OK ab IE-tot
   - `crypto.randomUUID()` — fallback für ältere Browser? Prüfen
   - Service Worker registriert? Wenn ja: cache-busting korrekt? Sonst stuck-version-Problem

**Output**:
- Generiere `CROSS_BROWSER_REPORT.md`
- Tabelle Browser × OS mit Status + Issues + Workarounds
- Falls Fixes nötig: in `index.html` umsetzen
- Manuelle Test-Checkliste für Andre

---

## Aufgabe D: Vollständiger Selbsttest

Neue Smoke-Suite `smoke_v338_full.js` die FOLGENDES prüft:

### D1. Render-Stabilität (kein Crash)
- Alle 12 DOCS rendern: `state.activeDocId = id; state.view = "wizard"; renderWizard()`
- Alle Anschreiben-Templates rendern
- Alle Hauptansichten: home, contacts, briefHistory, timeline, settings, anschreiben, belege, inbox, import, help, preview

### D2. DATA_SYNC_GROUPS-Validität
- Für jedes Mapping: prüfen ob die Doc-Section und Field-ID in der entsprechenden Doc-Definition existiert
- Falls nicht: FAIL mit Pfadangabe

### D3. Storage-Konsistenz
- Schreibe jedes Storage-Key, lese zurück, vergleiche
- KEYS: SHARED_STORAGE_KEY, CONTACTS_STORAGE_KEY, BRIEF_HISTORY_KEY, CUSTOM_TEMPLATES_KEY, TERMIN_PREP_KEY, BACKUP_REMINDER_KEY, NOTIF_ENABLED_KEY, NOTIF_SHOWN_KEY, alle DOCS[id].storageKey

### D4. Sync-Zyklen
- Doc → shared → Adressbuch (für alle 14 Sync-Gruppen)
- Adressbuch → shared → Doc (für alle 10 mappten Rollen)
- Round-Trip: setze in Doc → in shared → in Kontakt → ändere in Kontakt → zurück in Doc

### D5. Brief-Druck-Pipeline
- ANSCHREIBEN_TEMPLATES[key].body() returnt String
- printAnschreiben (gemockt) erstellt inline-print-container
- Doc-Print via openPrintWindow erstellt Container

### D6. Achievements-Check
- collectAchievements läuft ohne Crash
- Achievements werden korrekt freigeschaltet bei Daten-Eintrag

### D7. Notification-Logik
- notifSupported, notifIsEnabled
- scheduleNotifChecks läuft

### D8. Export/Import-Roundtrip
- exportAllData → JSON → Import → state ist identisch

### D9. Setup-Checkliste
- computeSetupChecklist liefert 8 Items
- Korrekte done-Berechnung bei verschiedenen state-Zuständen

### D10. Timeline
- collectTimelineEvents sammelt Events aus allen Quellen
- renderTimelineView ohne Crash mit verschiedenen Filter-Werten

### Erfolgskriterium
- **MINDESTENS 100 Asserts in smoke_v338_full.js**
- **ALLE bestehenden Smoke-Suites bleiben grün**
- Output: einfache Summary-Tabelle pro Modul

---

## Aufgabe E: Architekturvorschläge für offene Pakete

In Datei `ROADMAP_v4.md` schreiben:

### E1. PDF-Annotation
- Anforderung: Belege als PDF — User kann darauf zeichnen/markieren
- Vorschlag: Canvas-Layer über PDF (pdf.js für Render), Touch+Mouse-Events, Stift/Marker/Text-Modi, Speicherung als zusätzlicher PNG-Layer in den Doc-Attachments
- Bibliotheken: pdf.js (offline-fähig?), fabric.js für Canvas-Manipulation
- Größe-Impact: ~300 KB
- Aufwand-Schätzung: 1-2 Sessions

### E2. E2E-Cloud-Sync
- Anforderung: Daten zwischen Geräten synchronisieren ohne Anbieter-Zugriff
- Vorschlag: Supabase als Backend (Andre hat schon Setup für Sessions-PWA — Frankfurt-Region, DSGVO-konform), libsodium-wrappers für Client-Side E2E-Verschlüsselung
- Schema: tabellen `user_data` mit `user_id`, `encrypted_blob`, `updated_at`
- Konflikt-Resolution: Last-Write-Wins + Timestamp + manuelle Konflikt-Lösung
- DSGVO-Konzept: Andre als Verantwortlicher, DPA mit Supabase, AGB-Erweiterung, Opt-In für Sync
- Aufwand: 3-4 Sessions

### E3. KI-Brief-Verbesserung
- Anforderung: Brief-Vorlagen mit KI verfeinern (Tonfall, Grammatik, juristische Korrektheit)
- Vorschlag: Anthropic API (Claude Haiku für Kosten-Optimierung), API-Key in User-Settings
- Kostenkontrolle: Token-Budget pro Tag/Monat, Anzeige der bisherigen Kosten
- DSGVO: Brieftext wird an Anthropic gesendet — Opt-In + Datenschutz-Hinweis, Daten anonymisieren bevor sie gesendet werden (Namen durch Platzhalter ersetzen)
- Aufwand: 1-2 Sessions

---

## Aufgabe F: Release

Wenn ALLE Tests grün:

1. Version bump in `index.html`: `const APP_VERSION = "v3.38"`
2. Update `PUBLISH.md` mit allem was in v3.38 gemacht wurde (inkl. Personendaten-Audit-Ergebnissen)
3. Aktualisiere `README.md` falls relevante Änderungen (z.B. neue Notes zu Browser-Kompatibilität)
4. Erstelle `CHANGELOG_v3.38.md` mit präziser Auflistung
5. Git workflow:
   ```bash
   git add index.html PUBLISH.md README.md PERSONENDATEN_AUDIT.md CROSS_BROWSER_REPORT.md ROADMAP_v4.md CHANGELOG_v3.38.md smoke_v338_*.js
   git commit -F commit-message-v3.38.txt
   git push origin main
   ```
6. Bestätige Push erfolgreich + zeige Live-URL

**Commit-Message Schablone** (in `commit-message-v3.38.txt`):
```
v3.38: Vollstaendige Validierung + Personendaten-Audit + Cross-Browser-Check

Verifizierung der v3.37-Fixes:
  * Adressbuch-Sync-Knopf: getestet, DATA_SYNC_GROUPS-Pfade verifiziert
  * Zweistufiger Loesch-Klick: Contact + Template, Smoke-Tests
  * Print-Reflow: Brief- und Doc-Druck mit requestAnimationFrame

Personendaten-Audit:
  * RegEx-Scan auf Namen, Adressen, IBAN, Aktenzeichen, Telefon, Email
  * X Funde gefixt, Y akzeptable Platzhalter dokumentiert
  * PERSONENDATEN_AUDIT.md mit Liste

Cross-Browser-Audit:
  * Statische Analyse iOS Safari, Chrome Android, Desktop alle
  * CROSS_BROWSER_REPORT.md mit Kompatibilitaetsmatrix
  * Fixes fuer (Liste der konkreten Fixes)

Vollstaendiger Selbsttest:
  * smoke_v338_full.js mit X Asserts
  * Alle Render-Stellen, Storage-Roundtrips, Sync-Zyklen, Druck-Pipeline
  * Gesamt: X/X gruen ueber Y Suites

Roadmap v4:
  * PDF-Annotation, Cloud-Sync, KI-Brief - Architekturvorschlaege
  * ROADMAP_v4.md mit Aufwand- und DSGVO-Bewertung

Bundle: ~XXX KB
```

---

## Akzeptanzkriterien

- [ ] Alle Smoke-Suites (alt + neu) grün
- [ ] smoke_v338_full.js hat mindestens 100 Asserts
- [ ] PERSONENDATEN_AUDIT.md vorhanden mit konkreten Funden
- [ ] CROSS_BROWSER_REPORT.md vorhanden mit Kompatibilitätsmatrix
- [ ] ROADMAP_v4.md mit 3 Paket-Architekturen
- [ ] `index.html` enthält v3.38
- [ ] Git push erfolgreich
- [ ] Live-URL liefert v3.38 nach max. 2 Min Cache-Refresh

## Wenn was schiefgeht

- **node --check Fail** → Sofort fixen, Parse-Fehler nicht ignorieren
- **Test-Fail** → Diagnose im Test-Output, Fix in index.html, retesten
- **Sync-Mapping zeigt auf nicht-existierendes Feld** → fix DATA_SYNC_GROUPS auf echtes Feld
- **Personendaten gefunden in Vorlagen** → durch Platzhalter ersetzen, niemals echte Daten committen
- **Git Push schlägt fehl** → Andre informieren, NICHT force-push

## Wichtige Pfade

- Hauptdatei: `index.html`
- Smoke-Tests: `smoke_*.js` (alle bestehenden + die neuen v338)
- Reports: `PERSONENDATEN_AUDIT.md`, `CROSS_BROWSER_REPORT.md`, `ROADMAP_v4.md`
- Doku: `PUBLISH.md`, `README.md`, `CHANGELOG_v3.38.md`, `commit-message-v3.38.txt`

Viel Erfolg.
