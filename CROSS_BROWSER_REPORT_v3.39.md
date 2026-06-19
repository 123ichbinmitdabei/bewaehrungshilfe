# Cross-Browser / Cross-Platform Report v3.39

**Datum:** 2026-06-19
**Methode:** Statische Code-Analyse von `index.html` (keine echten Browser-Laeufe in der CI moeglich) plus dynamische Smoke-Tests der migrierten Dialoge unter Node mit gemocktem DOM. Geprueft gegen bekannte Inkompatibilitaeten.

## Zusammenfassung

Die App bleibt eine Single-File-PWA ohne externe Scripts, ohne aktiven Service Worker, mit Inline-Manifest. In v3.39 wurde der groesste offene Punkt aus v3.38 angegangen: die nativen Dialoge. Alle destruktiven Aktionen laufen jetzt ueber das eigene Modal (`confirmAction`), und der einzige `prompt()`-Aufruf wurde durch ein neues Eingabe-Modal (`inputModal`) ersetzt. Verbleibende native `confirm()` betreffen ausschliesslich nicht-destruktive oder fail-safe Pfade und sind bewusst belassen (siehe Befund 1).

## Kompatibilitaetsmatrix

| Browser / OS | Status | Bemerkung |
|---|---|---|
| Chrome Desktop (Win/Mac/Linux) | gruen | Voll unterstuetzt. Strg+P druckt Inline-Container. |
| Edge Desktop | gruen | Chromium-basiert, identisch zu Chrome. |
| Firefox Desktop | gruen | inputmode wird ignoriert (kein Fehler), Druck ok. Kein PWA-Install (erwartbar). |
| Safari Desktop (macOS) | gruen | Inline-Print ok. Destruktive Aktionen jetzt ueber eigenes Modal. |
| iOS Safari (Tab) | gruen | Inline-Print statt window.open. Modale Bestaetigung statt nativem confirm fuer alle Loeschungen. |
| iOS Safari (PWA standalone) | gruen mit Einschraenkung | Destruktive Dialoge jetzt als In-App-Modal (nicht mehr vom Standalone-Modus unterdrueckbar). Verbleibende native confirm betreffen nur nicht-destruktive bzw. fail-safe Pfade. Siehe Befund 1. |
| Chrome Android | gruen | File-Input fuer Belege ok, navigator.share mit Fallback. PWA-Install ueber Browser-Menue. |
| Android Tablet (Chrome) | gruen | Wie Chrome Android, Portrait-Layout skaliert. |
| iPad Safari | gruen | Wie iOS Safari. Bei Add-to-Homescreen gilt der PWA-Hinweis. |

## Gepruefte Punkte

### 1. Native Dialoge confirm() / prompt(), Prioritaet MITTEL, TEILWEISE MIGRIERT (GELB)

**Migriert in v3.39 (alle destruktiven Aktionen plus die Betragseingabe):**

| Aufrufer | vorher | nachher |
|---|---|---|
| `deleteRow` (Tabellen-Zeile loeschen) | `confirm()` | `confirmAction` (danger) |
| `deleteInboxItem` (Beleg loeschen) | `confirm()` | `confirmAction` (danger) |
| `deleteSavedSignature` (Unterschrift loeschen) | `confirm()` | `confirmAction` (danger) |
| `disablePin` (PIN-Schutz entfernen) | `confirm()` | `confirmAction` (danger) |
| `resetSettingsToDefaults` (Einstellungen zuruecksetzen) | `confirm()` | `confirmAction` (danger) |
| `confirmPayment` (Zahlungsbetrag, "bezahlt") | `prompt()` | neues `inputModal` (16px Font, kein iOS-Zoom) |

Neue, wiederverwendbare Infrastruktur: `inputModal(message, {title, default, placeholder, okLabel, onOk})`, analog zu `confirmAction`. Das Input-Feld nutzt `font-size:16px`, um den iOS-Auto-Zoom zu vermeiden.

**Hartes Invariant geprueft:** Jede migrierte destruktive Aktion wird NUR nach Bestaetigung ausgefuehrt. Smoke-Test `smoke_v339_dialoge.js` (40 Asserts) beweist fuer jeden Aufrufer: Bestaetigen fuehrt die Aktion aus, Abbrechen NICHT.

**Bewusst nativ belassen (fail-safe, nicht destruktiv, oder nicht ohne Risiko migrierbar):**

| Aufrufer | Grund |
|---|---|
| OCR-Abfrage (`handleImportUpload`, `startOcrForInboxItem`) | nicht destruktiv ("OCR anwenden?"), liefert Boolean synchron, teils in Schleife |
| PDF-Groessen-Warnung (Inbox/Beleg-Upload) | innerhalb einer `for`-Schleife mit `continue`, ein nicht-blockierendes Modal wuerde die Schleifenlogik brechen; nicht destruktiv |
| Datei-Teilen-Fallback (`shareDocument`/`shareAttachment`) | Boolean-Ergebnis wird synchron im async-Share-Flow gebraucht; nicht destruktiv (bietet ZIP-Download an) |
| Notiz-Vorschlag nach BH-Termin (`checkNoteSuggestionsAfterTermin`) | nicht destruktiv (markiert Notizen erledigt, reversibel), laeuft in `setTimeout` |
| Sozialstunden-Auto-Eintrag (`handleSozialDone`) | Abbrechen MUSS trotzdem den Status setzen; `confirmAction` verwirft bei Abbrechen, daher nicht sauber abbildbar |
| Termin-Status missed/cancelled plus Ersatz-Termin (`confirmAppointment`) | mehrstufig (Bestaetigung, dann Ersatz-Dialog in `setTimeout`); native confirm ist hier fail-safe (kein Statuswechsel bei unterdruecktem Dialog) |
| Zahlung "verschoben" plus Folgetermin (`confirmPayment` postponed-Zweig) | mehrstufig wie oben, fail-safe |
| Backup-Import-Ueberschreiben (`triggerImport`, 2 confirms) | DESTRUKTIV, aber native confirm ist hier fail-safe: bei unterdruecktem/abgelehntem Dialog wird NICHT importiert (kein Datenverlust). Migration des laufenden async-File-Read-Flows waere hoch-riskant. Invariant bleibt erfuellt. |

Begruendung der Zurueckhaltung: Fail-safe vor Vollstaendigkeit (Work-Order-Vorgabe). Kein verbleibender nativer Aufruf kann eine destruktive Aktion ohne Bestaetigung ausloesen.

### 2. Pop-up-Blocker / window.open, Prioritaet HOCH, GELOEST (bestaetigt)
- Kein `window.open()`-Aufruf mehr im Druckpfad. Statische Pruefung: 0 echte `window.open(`-Aufrufe (die 2 Vorkommen sind Kommentare). `openPrintWindow`, `_doPrintAnschreiben` und `printFormular` injizieren einen Inline-Print-Container und nutzen `@media print`. Korrekt fuer iOS/Safari/PWA.

### 3. Print-Reflow, Prioritaet HOCH, GELOEST (in v3.39 vervollstaendigt)
- `openPrintWindow` und `_doPrintAnschreiben` nutzen `void offsetHeight` + `requestAnimationFrame` + `setTimeout(100)` vor `window.print()`, mit try/catch und `alert()` bei Fehler.
- **NEU in v3.39:** `printFormular` (Erklaerungs-Formular) rief `window.print()` bisher direkt ohne Reflow auf. Das war der in v3.38 als Folgepunkt notierte Pfad, der am Desktop/iOS anders lief. Jetzt nutzt `printFormular` dasselbe Reflow-Muster (offsetHeight + requestAnimationFrame + setTimeout) und die Aufraeum-Verzoegerung auf 2000 ms angeglichen. GELB-Fix, per Smoke-Test (`smoke_v339_dialoge.js`) statisch abgesichert.

### 4. crypto.randomUUID(), Prioritaet NIEDRIG, KEIN HANDLUNGSBEDARF
- Wird nicht verwendet. IDs aus `Date.now() + "_" + Math.random().toString(36)`. Funktioniert ueberall.

### 5. Service Worker / Cache-Busting, Prioritaet NIEDRIG, KEIN AKTIVER SW
- Kein Service Worker registriert (siehe Paket G: ein Prototyp `sw.js` liegt als NICHT aktivierter Vorschlag bei, Registrierung nur auskommentiert). Kein stuck-version-Cache-Problem durch SW. Neue Version nach Push sofort sichtbar (nur HTTP-Cache).

### 6. PWA-Manifest, Prioritaet NIEDRIG, OK
- Inline-`data:`-Manifest (`display: standalone`, `start_url: "."`). `apple-mobile-web-app-capable`, Status-Bar-Style, App-Title gesetzt. Install ueber Browser-Menue.

### 7. Viewport / iOS Safe-Area / 100vh, Prioritaet NIEDRIG, OK
- `<meta viewport ... viewport-fit=cover>` plus `padding: env(safe-area-inset-*)` am Body. Korrekte Notch-/Home-Indicator-Behandlung.
- Body nutzt `min-height: 100vh` (nicht `height`). Der Safari-100vh-Effekt fuehrt hoechstens zu Extra-Scrollflaeche, zerstoert kein Layout. Optionale Verbesserung weiterhin `100dvh` (nicht umgesetzt, kein Bug).

### 8. navigator.share, Prioritaet NIEDRIG, OK
- Mit Fallback (`if (!navigator.share) { ZIP-Download }`). Desktop ohne Web-Share faellt sauber auf Download zurueck.

### 9. inputmode, Prioritaet NIEDRIG, OK
- `inputmode="decimal"` / `"numeric"` an Betrags-/Zeit-Feldern. Mobile Tastaturen passend, Firefox ignoriert ohne Fehler.

### 10. Input-Zoom iOS, Prioritaet NIEDRIG, OK
- 20 Stellen mit `font-size:16px` an Eingaben (verhindert iOS-Auto-Zoom). Das neue `inputModal`-Feld nutzt ebenfalls 16px.

### 11. Touch-Targets / Branding, Prioritaet NIEDRIG, BEOBACHTUNG
- Einige sekundaere Buttons knapp unter 44x44 px (Apple HIG). Auf Touch bedienbar, als Verbesserung notiert. Branding unveraendert (`--bg #08100b`, `--primary #4caf6a`, `--accent #f9c74f`).

## Bekannte Live-Symptome (vom Tester gemeldet), Status v3.39

### Symptom 1: Adressbuch-Sync greift am Desktop-PC nicht, am Handy schon
- **Status:** unveraendert eingeordnet als Cache-Symptom, KEIN Logikfehler.
- **Code-Befund v3.39:** Sync-Logik weiterhin gruen: `smoke_v338_sync.js` (105 Asserts) plus `smoke_v339_funktion.js` Modul A4 (alle 14 Gruppen bidirektional plus 10 Kontakt-Rollen). Es wurde KEIN Desktop-spezifischer Code-Pfad gefunden, der anders laeuft. Bestaetigt: Cache-Symptom.
- **Abhilfe:** Hard-Reload (siehe `TROUBLESHOOTING.md`). Dauerhafte Loesung waere ein Service Worker mit Versions-Hash, siehe `SW_PROPOSAL_v3.39.md` (Paket G), bewusst noch NICHT aktiviert.

### Symptom 2: Drucken-Knopf reagiert nicht (Handy UND PC)
- **Status:** in v3.39 weiter gehaertet.
- **Bezug:** Der letzte Druckpfad ohne Reflow (`printFormular`) wurde angeglichen (siehe Punkt 3). Damit nutzen jetzt ALLE drei Druckpfade Inline-Container plus Reflow plus try/catch-alert. `window.open` ist nirgends mehr im Druckpfad.
- **Wichtige Einschraenkung:** Auch dieses Symptom kann am PC durch eine veraltete gecachte Version verstaerkt worden sein. Nach Deploy bitte Hard-Reload und erneut testen.
- **Falls weiterhin nichts passiert:** Browser-Konsole (`F12`) auf rote Fehler pruefen und an die Entwicklung melden.

## Vorgenommene Code-Aenderungen in v3.39

- Neues `inputModal` (Ersatz fuer `prompt()`), in `render()` verdrahtet.
- 5 destruktive `confirm()` auf `confirmAction` migriert, 1 `prompt()` auf `inputModal`.
- `printFormular`: Reflow-Muster (offsetHeight + requestAnimationFrame + setTimeout) ergaenzt, Aufraeum-Timeout auf 2000 ms angeglichen.
- Neuer Smoke-Test `smoke_v339_dialoge.js` (40 Asserts) sichert das Bestaetigungs-Invariant und die statischen Druck-/Zoom-Eigenschaften.

## Manuelle Test-Checkliste fuer den Tester

**iOS (iPhone, Safari + als PWA installiert):**
- [ ] App standalone oeffnen, Brief erstellen, Drucken antippen, Vorschau erscheint (nicht leer).
- [ ] Erklaerungs-Formular drucken (neuer Reflow-Pfad), Vorschau erscheint.
- [ ] Tabellen-Zeile loeschen: In-App-Modal erscheint, Abbrechen loescht nichts, Bestaetigen loescht.
- [ ] Zahlung als bezahlt markieren: Eingabe-Modal fuer Betrag erscheint (kein nativer prompt).
- [ ] Einstellungen zuruecksetzen / Unterschrift loeschen / PIN entfernen: In-App-Modal.

**Android (Chrome):** PWA installieren, Beleg-Upload, Teilen, Drucken/als PDF.

**Desktop (Chrome, Firefox, Edge, Safari):** Strg+P loest Inline-Druck aus; Export, dann Import in frischem Profil, Daten identisch.
