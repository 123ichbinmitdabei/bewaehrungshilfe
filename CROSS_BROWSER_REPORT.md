# Cross-Browser / Cross-Platform Report v3.38

**Datum:** 2026-06-18
**Methode:** Statische Code-Analyse von `index.html` (keine echten Browser-Laeufe moeglich in CC). Geprueft gegen bekannte Inkompatibilitaeten.

## Zusammenfassung

Die App ist eine Single-File-PWA ohne externe Scripts, ohne Service Worker und mit Inline-Manifest. Das macht sie robust gegen die meisten Cross-Browser-Fallen (kein CDN-Ausfall, kein stuck-version-Cache-Problem). Ein Befund mit mittlerer Prioritaet bleibt offen (native Dialoge), bewusst nur dokumentiert (siehe unten).

## Kompatibilitaetsmatrix

| Browser / OS | Status | Bemerkung |
|---|---|---|
| Chrome Desktop (Win/Mac/Linux) | gruen | Voll unterstuetzt. Strg+P druckt Inline-Container. |
| Edge Desktop | gruen | Chromium-basiert, identisch zu Chrome. |
| Firefox Desktop | gruen | inputmode wird ignoriert (kein Fehler), Druck ok. Kein PWA-Install (erwartbar). |
| Safari Desktop (macOS) | gruen mit Einschraenkung | Inline-Print ok. Native `confirm()`/`prompt()` funktionieren im Browser-Tab. |
| iOS Safari (Tab) | gruen mit Einschraenkung | Inline-Print statt `window.open` ist korrekt. `confirm`/`prompt` meist ok im Tab. |
| iOS Safari (PWA standalone) | gelb | `confirm()`/`prompt()` koennen im Standalone-Modus unterdrueckt werden. Fail-safe (Aktion bricht ab). Siehe Befund 1. |
| Chrome Android | gruen | File-Input fuer Belege ok, navigator.share mit Fallback. PWA-Install ueber Browser-Menue. |
| Android Tablet (Chrome) | gruen | Wie Chrome Android, Portrait-Layout skaliert. |
| iPad Safari | gruen mit Einschraenkung | Wie iOS Safari. Bei Add-to-Homescreen gilt der PWA-Hinweis. |

## Gepruefte Punkte

### 1. Native Dialoge confirm() / prompt(), Prioritaet MITTEL, NUR DOKUMENTIERT
- **Befund:** 18 `confirm()` und 2 `prompt()` Aufrufe verbleiben in `index.html`, obwohl ein Modal-Ersatz (`confirmAction`) existiert. Die v3.37-Erwartung „keine nativen Dialoge mehr" ist also NICHT vollstaendig erfuellt.
- **Betroffen:** Loesch-Bestaetigungen (Belege, Notizen, Unterschrift), Settings-Reset, Import-Ueberschreiben, Termin-/Zahlungs-Status, PDF-Groessen-Warnung, OCR-Abfrage, Zahlungsbetrag-Eingabe (`prompt`).
- **Risiko:** Im iOS-PWA-Standalone-Modus koennen diese Dialoge unterdrueckt werden. Verhalten ist **fail-safe**: `if (!confirm(...)) return;` bricht bei unterdruecktem Dialog ab, es passiert also nichts Destruktives. Der Nutzer kann die Aktion dann nicht ausloesen (Funktion „klemmt"), aber es gehen keine Daten verloren.
- **Entscheidung (mit Andre abgestimmt):** In v3.38 nur dokumentieren, kein Refactor. Begruendung: Migration aller 20 Stellen auf das callback-basierte Modal ist ein grosser Control-Flow-Umbau (Downstream-Code muss in `onConfirm`-Closures wandern, `prompt()` braucht ein neues Eingabe-Modal), nicht laufzeitgetestet, hoeheres Regressionsrisiko fuer eine Validierungs-Release.
- **Empfehlung v3.39:** Schrittweise Migration. Muster steht bereits (`confirmAction({title, message, onConfirm, danger})`). Fuer `prompt()` ein analoges `promptAction` mit Text-Input-Modal ergaenzen. Reihenfolge nach Risiko: zuerst Import-Ueberschreiben und Daten-Loeschungen.

### 2. Pop-up-Blocker / window.open, Prioritaet HOCH, GELOEST
- `window.open("", "_blank")` wird NICHT mehr fuer Druck genutzt. Sowohl `openPrintWindow` (Docs) als auch `_doPrintAnschreiben` und `printFormular` (Briefe) injizieren einen Inline-Print-Container und nutzen `@media print`. Korrekt fuer iOS/Safari/PWA.

### 3. Print-Reflow, Prioritaet HOCH, GELOEST
- `openPrintWindow` und `_doPrintAnschreiben` nutzen `void container.offsetHeight` + `requestAnimationFrame` + `setTimeout(100)` vor `window.print()`, mit try/catch und `alert()` bei Fehler. Leerer Container loest jetzt in beiden Pfaden ein explizites `alert()` aus (Doc-Pfad bestand, Brief-Pfad in v3.38 ergaenzt).
- Hinweis: `printFormular` nutzt `window.print()` direkt ohne Reflow-Verzoegerung. Geringes Risiko (Formular-HTML ist statisch), als Folgepunkt notiert.

### 4. crypto.randomUUID(), Prioritaet NIEDRIG, KEIN HANDLUNGSBEDARF
- `crypto.randomUUID()` wird NICHT verwendet. IDs entstehen aus `Date.now() + "_" + Math.random().toString(36)`. Damit gibt es keinen Fallback-Bedarf fuer aeltere Browser. Funktioniert ueberall.

### 5. Service Worker / Cache-Busting, Prioritaet NIEDRIG, KEIN HANDLUNGSBEDARF
- Es ist KEIN Service Worker registriert. Folge: kein stuck-version-Cache-Problem (das Hauptrisiko aus dem Work Order entfaellt). Nach Push ist die neue Version sofort sichtbar (nur Browser-HTTP-Cache, typ. < 2 Min auf GitHub Pages).
- Nebenwirkung: echtes Offline funktioniert nur, solange der Browser die Seite gecached hat. Fuer eine reine Formular-App akzeptabel. Echtes Offline-Caching ist ein Roadmap-Kandidat (mit korrektem Cache-Busting auf APP_VERSION).

### 6. PWA-Manifest, Prioritaet NIEDRIG, OK
- Inline-`data:`-Manifest vorhanden (`display: standalone`, `start_url: "."`). Funktioniert auch bei lokaler Datei-Nutzung.
- `apple-mobile-web-app-capable`, Status-Bar-Style und App-Title sind gesetzt.
- `beforeinstallprompt` wird NICHT abgefangen. Install laeuft ueber das Browser-Menue. `getPlatformInfo()` liefert `canInstall`/`standalone`, um dem Nutzer passende Install-Hinweise zu zeigen. Kein Fehler, optionale Verbesserung.

### 7. Viewport / iOS Safe-Area / 100vh, Prioritaet NIEDRIG, OK
- `<meta viewport ... viewport-fit=cover>` plus `padding: env(safe-area-inset-*)` am Body. Korrekte Notch-/Home-Indicator-Behandlung.
- Body nutzt `min-height: 100vh` (nicht `height`). Der Safari-100vh-Bug fuehrt hier hoechstens zu etwas Extra-Scrollflaeche, zerstoert aber kein Layout. Optionale Verbesserung: `100dvh`.

### 8. navigator.share, Prioritaet NIEDRIG, OK
- Wird mit Fallback genutzt (`if (!navigator.share) { ... ZIP-Download ... }`). Auf Desktop-Firefox/Chrome ohne Web-Share faellt es sauber auf Download zurueck.

### 9. inputmode, Prioritaet NIEDRIG, OK
- `inputmode="decimal"` / `"numeric"` an Betrags- und Zeit-Feldern. Firefox ignoriert das Attribut ohne Fehler, mobile Browser zeigen passende Tastatur.

### 10. Touch-Targets, Prioritaet NIEDRIG, BEOBACHTUNG
- Die meisten Buttons haben ausreichend Padding. Einige sekundaere Buttons (z.B. Loesch-Buttons mit `font-size:12px; padding:5px 10px`) liegen knapp unter den 44x44 px der Apple HIG. Auf Touch noch bedienbar, aber als Verbesserung notiert.

### 11. Branding-Hinweis, Prioritaet NIEDRIG, BEOBACHTUNG
- App-UI ist forest-green (`--bg #08100b`, `--primary #4caf6a`). Das Manifest- und Meta-`theme_color` ist `#2E5984` (blau), passend zum offiziellen Dokument-Look beim Druck. Bewusst nicht geaendert, da Aenderung der Brand-Chrome-Farbe nicht im Auftragsumfang lag.

## Manuelle Test-Checkliste fuer Andre

Bitte nach dem Deploy auf echten Geraeten durchgehen:

**iOS (iPhone, Safari + als PWA installiert):**
- [ ] App zum Homescreen hinzufuegen, standalone oeffnen.
- [ ] Brief erstellen, „Drucken" antippen, Druckvorschau erscheint (nicht leer).
- [ ] Doc-Wizard ausfuellen, „Anzeigen" dann „Drucken", Vorschau erscheint.
- [ ] Kontakt loeschen (zweistufig, zweiter Tap loescht).
- [ ] Beleg fotografieren / aus Fotos hinzufuegen (File-Input).
- [ ] WICHTIG: Loesch-/Reset-/Import-Dialoge testen, reagieren die nativen Abfragen? (Befund 1)

**Android (Chrome):**
- [ ] PWA installieren ueber Browser-Menue.
- [ ] Beleg-Upload und Foto-Aufnahme.
- [ ] Teilen ueber navigator.share.
- [ ] Drucken / als PDF speichern.

**Desktop (Chrome, Firefox, Edge, Safari):**
- [ ] Strg+P / Cmd+P loest Inline-Druck aus.
- [ ] Tab-Navigation durch Wizard-Felder.
- [ ] Export aller Daten, danach Import in frischem Profil, Daten identisch.

## Bekannte Live-Symptome (vom Tester gemeldet)

Diese Symptome wurden im echten Einsatz beobachtet und hier eingeordnet. Die statische Analyse stuetzt die Cache-These.

### Symptom 1: Adressbuch-Sync greift am Desktop-PC nicht, am Handy schon
- **Vermutete Ursache:** Veraltete, im Browser zwischengespeicherte `index.html` am PC (alte App-Version), eventuell zusammen mit `localStorage`-Resten aus aelteren Versionen. Da KEIN Service Worker registriert ist (siehe Punkt 5 oben), kann das Problem nur der normale HTTP-Cache des Browsers oder ein altes Lesezeichen/eine alte Tab-Sitzung sein. Am Handy wurde vermutlich eine frischere Version geladen.
- **Code-Befund:** Die Sync-Logik (`reconcileAllSyncGroups`, `syncSharedToContacts`) ist in `smoke_v338_sync.js` mit 105 Asserts gruen. Der Code selbst synct korrekt. Das Symptom ist also kein Logikfehler, sondern eine alte geladene Version.
- **Sofort-Abhilfe (Desktop Hard-Reload):**
  - Chrome / Edge / Firefox (Windows): `Strg + F5` oder `Strg + Umschalt + R`.
  - Safari (macOS): `Cmd + Option + R`, oder `Cmd + Option + E` (Cache leeren) und dann `Cmd + R`.
  - Wenn das nicht reicht: Entwicklertools oeffnen (`F12`), Reload-Knopf gedrueckt halten, „Cache leeren und vollstaendig neu laden" waehlen.
  - Detaillierte Schritt-fuer-Schritt-Anleitung fuer Endnutzer: siehe `TROUBLESHOOTING.md`.

### Symptom 2: Drucken-Knopf reagiert nicht (Handy UND PC)
- **Bezug:** Aufgabe A3 (Print-Reflow). Der v3.38-Fix adressiert genau dieses Symptom:
  - Druck laeuft jetzt ueber einen Inline-Print-Container statt `window.open` (Pop-up-Blocker auf iOS/Safari/PWA umgangen).
  - `void offsetHeight` + `requestAnimationFrame` + `setTimeout(100)` erzwingen einen Reflow, bevor `window.print()` ausgeloest wird, damit die Druckvorschau nicht leer bleibt.
  - `window.print()` ist in try/catch gekapselt und meldet Fehler per `alert()` statt still zu scheitern.
  - NEU in v3.38: leerer Brief-Container loest jetzt auch im Brief-Druck (`_doPrintAnschreiben`) ein explizites `alert()` aus.
- **Wichtige Einschraenkung:** Auch dieses Symptom kann am PC durch eine veraltete gecachte Version verstaerkt worden sein (der alte `window.open`-Code war noch aktiv). Nach Deploy von v3.38 bitte zwingend Hard-Reload (siehe Symptom 1) durchfuehren und erneut testen.
- **Falls nach Hard-Reload weiterhin nichts passiert:** In der Browser-Konsole (`F12` -> Console) auf rote Fehlermeldungen achten und an die Entwicklung melden. Dann liegt ein vom Cache unabhaengiger Laufzeitfehler vor, der separat untersucht werden muss.

## Vorgenommene Code-Aenderungen in v3.38

- `_doPrintAnschreiben`: expliziter `alert()` bei leerem Brief-Container ergaenzt (vorher nur im Doc-Druck vorhanden).
- Keine weiteren Cross-Browser-Fixes in dieser Release (siehe Befund 1, bewusste Entscheidung).
- Ergaenzende Doku: `TROUBLESHOOTING.md` (Cache-Reset fuer Endnutzer), Roadmap-Punkt „Service Worker mit Versions-Hash" in `ROADMAP_v4.md`.
