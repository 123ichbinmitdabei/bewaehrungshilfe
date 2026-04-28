# 📁 Bewährungshilfe-Assistent

> Eine kostenlose, lokale Web-App für Menschen in der Bewährungszeit. Hilft beim Strukturieren und Erstellen aller wichtigen Dokumente und Anschreiben – mit digitalen Unterschriften, Termin-Management, Kalender-Export und Erinnerungssystem.

🌐 **Live-Version:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/

📲 **Installierbar als App** auf iPhone, iPad, Android, Windows, macOS und Linux (PWA)

---

## ✨ Was kann die App?

Strukturierte Vorlagen für 9 zentrale Dokumente, dazu 9 vorgefertigte Anschreiben für typische Behördenkontakte – plus ein **digitales Unterschriften-System**, eine **Heute-Übersicht** mit Action-Buttons, und **Kalender-Export** für alle Termine.

### 📋 Die 9 Dokumente

| Icon | Dokument | Zweck |
|------|----------|-------|
| 📊 | **Status-Übersicht** | Auto-generiertes Deckblatt mit Snapshot aller Bereiche |
| 📞 | **BH-Termine & Gespräche** | Termin-Tracker mit Vorbereitungs-Notizen, Notiz-Spalte, Pro-Zeile-Unterschrift |
| 📋 | **Einnahmen-Ausgaben-Rechnung** | Komplette Finanzaufstellung |
| 💶 | **Schadenswiedergutmachung** | Tracker mit Zahlungsverlauf, Belegen, Quittungen |
| 💸 | **Verfahrenskosten & Geldstrafe** | Tracker für Gerichtskosten, Geldstrafe, Anwalt + Anträge |
| 🤝 | **Sozialstunden-Nachweis** | Stundenliste mit Bestätigung pro Einsatz, Notizen, Belegen |
| 🧠 | **Therapie-Bestätigung** | Termine mit Notizen (Hausaufgabe etc.), Pro-Termin-Unterschrift |
| 📅 | **Zeitstrahl / Lebensverlauf** | Wohnungen, Arbeit, Bildung, Therapie, Hilfen |
| 📦 | **Beweismittel & Asservate** | Doku beschlagnahmter Gegenstände + Antrag auf Herausgabe |

### ✉️ Die 9 Anschreiben-Vorlagen

- 📝 **Stundungsantrag (Geldauflage)** – an die Bewährungshilfe
- 🤒 **Krankmeldung** an die Bewährungshilfe
- 🧠 **Bitte um Therapiebestätigung** an Therapeut:in
- 🤝 **Bitte um Sozialstunden-Bestätigung** an Einrichtung
- 📋 **Antrag auf Lockerung der Bewährungsauflagen** an das Gericht
- 📦 **Antrag auf Herausgabe (§ 111n StPO)** an die StA
- ⏰ **Sachstandsanfrage Herausgabe**
- 💸 **Antrag auf Ratenzahlung** (§§ 459a, 459g StPO)
- ⏳ **Antrag auf Stundung**

---

## 📅 Heute-Übersicht mit Schnell-Aktionen

Auf der Startseite sammelt die App alle anstehenden Termine und Fristen aus allen Dokumenten:

- 📅 BH-Termine, 🧠 Therapie-Termine, 🤝 Sozialstunden-Einsätze
- 💶 Schadens-Zahlungen, 💸 Verfahrenskosten-Zahlungen
- ⏱ Auflage-Fristen mit Restbetrag/Reststunden

Sortiert nach Dringlichkeit (🔴 heute > 🟡 morgen > 🔵 nächste Tage) - mit direkten Action-Buttons:

| Button | Wirkung |
|--------|---------|
| ✅ **Erledigt** | Status setzen, bei Sozial: Stunden-Auto-Berechnung möglich |
| ⏭️ **Verpasst** | Status setzen, danach Frage nach Ersatz-Termin |
| ✕ **Abgesagt** | Status setzen, danach Frage nach Ersatz-Termin |
| 📅 **Verschieben** | Dialog mit neuem Datum + Wahl: neue Zeile oder Eintrag ändern |
| 📲 **Kalender** | Termin als .ics in den Handy-Kalender exportieren |

Bei Zahlungen statt „Erledigt": **💶 Bezahlt** (fragt nach Betrag) und **⏭️ Verschoben** (mit Folge-Dialog für neues Fälligkeitsdatum).

---

## 📲 Kalender-Export

Termine direkt in den Handy-Kalender (Apple, Google, Outlook):

- **Pro Zeile in der Tabelle:** kleiner „📲 Kalender"-Knopf neben dem Eintrag
- **Sammel-Export:** „📲 Alle Termine exportieren" über jeder Termin-Tabelle (z.B. alle 24 Therapie-Termine auf einmal)
- **Aus der Heute-Übersicht:** für anstehende Termine direkt

Die `.ics`-Dateien enthalten Erinnerungen 1 Tag und 1 Stunde vorher. Bei Sozialstunden wird die Einrichtung als Ort eingetragen.

---

## ✍️ Digitale Unterschriften – drei Wege

Bei Sozialstunden, Therapie, Schadenswiedergutmachung und BH-Terminen kannst du Bestätigungen auf drei Wegen einsammeln:

1. **Digital direkt in der App** – mit Finger oder Stylus auf dem Bildschirm. Mit Zeitstempel und Geräte-Info dokumentiert.
2. **Klassisch auf Papier + Foto** – ausdrucken, unterschreiben/stempeln lassen, abfotografieren und als Beleg an die Zeile anhängen.
3. **Stempel-Foto** – manche Einrichtungen haben einen offiziellen Stempel der mehr zählt als die Unterschrift.

Pro Zeile UND/ODER als Sammel-Unterschrift am Ende möglich. Im Druck und Word-Dokument erscheinen digitale Unterschriften als Bild mit Zeitstempel. Wenn nicht digital signiert wurde, bleiben die Unterschriftslinien für handschriftliche Eintragungen frei.

**📋 Verifikations-Seite:** Am Ende des Ausdrucks erscheint eine Übersicht aller digital erfassten Unterschriften – mit Zeitpunkt, Gerät und Zeitzone.

> ⚖️ **Rechtlicher Hinweis:** Eine digitale Unterschrift in dieser App ist *keine qualifizierte elektronische Signatur* im Sinne der eIDAS-Verordnung. Sie hat aber Beweiswert (vergleichbar mit einer Unterschrift auf einem DHL-Paket-Tablet). Für förmliche Anträge bei Gericht ist weiterhin eine handschriftliche Papier-Unterschrift erforderlich.

---

## 📝 Notizen pro Termin / Eintrag

Jeder Termin oder Einsatz hat ein eigenes mehrzeiliges Notiz-Feld:

- **Therapie-Termine:** „Notiz / Hausaufgabe / Themen" – z.B. „Hausaufgabe: täglich 5 Min Atemübung"
- **Sozialstunden:** „Notiz / Bemerkung" – z.B. „Hecke geschnitten, Werkstatt aufgeräumt"
- **BH-Termine:** „Eigene Notiz" – persönliche Eindrücke und Bemerkungen

Notizen erscheinen im Druck (klein neben dem jeweiligen Eintrag) und im Word-Export.

---

## 💾 Backup & Wiederherstellung

> **Ja, ALLES wird gesichert.** Auch Bilder, Unterschriften, Termine, Notizen und Status.

Klick auf „💾 Sichern" lädt eine JSON-Datei runter, die enthält:
- ✅ Alle Stammdaten und Antworten
- ✅ Alle Tabellen (Termine, Stunden, Zahlungen)
- ✅ **Alle Belege (Fotos, PDFs als Base64)**
- ✅ **Alle digitalen Unterschriften (Bild + Zeitstempel + Geräte-Info)**
- ✅ Alle Notizen und Status-Einträge
- ✅ Theme-Einstellung

Klick auf „📥 Laden" stellt das komplette Backup wieder her. Funktioniert auch zwischen Geräten – Backup auf dem Handy machen, am PC einspielen.

---

## 📤 Dokumente versenden – mit Belegen

In der Druckansicht jedes Dokuments stehen je nach Gerät verschiedene Versand-Optionen zur Verfügung:

- **📤 Teilen** (auf iPhone, iPad, Android): System-Teilen-Menü mit Dokument *und allen Belegen als einzelne Dateien*
- **📦 ZIP mit Belegen** (auf jedem Gerät): ZIP-Datei mit Dokument plus allen Belegen
- **🖨 Drucken / als PDF**: Klassische Druckansicht – Belege werden auf Folge-Seiten angehängt
- **📝 Word-Dokument (.docx)**: Mit eingebetteten Unterschriften

---

## 🔒 Datenschutz & Sicherheit

- ✅ **Daten bleiben auf deinem Gerät** (im Browser-Speicher / localStorage)
- ✅ **Keine Anmeldung, keine Konten, kein Login**
- ✅ **Funktioniert komplett offline** nach erstem Laden
- ✅ **Optionaler PIN-Schutz**
- ✅ **Sicher exportierbar** als JSON-Backup
- ✅ **Open Source** – jeder kann den Code prüfen
- ✅ **Unterschriften komprimiert gespeichert** (~5 KB pro Unterschrift, JPEG 0.8)

---

## 📲 Installation

### iPhone / iPad
1. Link in **Safari** öffnen (wichtig - nicht Chrome!)
2. Teilen-Symbol (□↑) tippen
3. Nach unten scrollen → **„Zum Home-Bildschirm"**

### Android
1. Link in **Chrome** öffnen
2. Drei-Punkte-Menü → **„App installieren"**

### Windows / macOS / Linux (Chrome, Edge, Brave)
1. Link im Browser öffnen
2. Installations-Symbol in der Adressleiste anklicken

Nach der Installation läuft die App im Vollbild – wie eine richtige App, auch offline.

---

## 🎯 Features im Überblick

### Dokument-Wizard
- Schritt-für-Schritt-Ausfüllen mit Fortschritts-Anzeige
- **Geteilte Stammdaten** zwischen allen Dokumenten
- Datei-Anhänge für Belege (Fotos, PDFs)
- Mehrzeilige Notiz-Felder pro Eintrag
- Dark Mode

### Heute-Übersicht
- Sammelt anstehende Termine aus allen Dokumenten
- Action-Buttons: Erledigt / Verpasst / Abgesagt / Verschieben / Kalender
- Erinnerung an Auflage-Fristen
- Sortierung nach Dringlichkeit

### Digitale Unterschriften ✍️
- Mit Finger oder Stylus auf dem Bildschirm
- Zeitstempel + Geräte-Info automatisch erfasst
- Pro Zeile (Sozial, Therapie, BH, Schadens) und/oder als Gesamt-Unterschrift
- Verifikations-Seite im Ausdruck

### Termin-Management
- Reschedule-Dialog mit zwei Modi (Verlauf erhalten oder direkt ändern)
- Ersatz-Termin nach Verpasst/Abgesagt mit einem Klick
- Auto-Berechnung der Sozialstunden aus von/bis/Pause

### Export & Versand
- 📄 PDF / Drucken
- 📝 Word-Datei (.docx) mit eingebetteten Unterschriften
- 📤 System-Teilen mit Dokument + allen Belegen (iOS/Android)
- 📦 ZIP-Bundle mit Dokument + Belegen
- 💾 JSON-Backup aller Daten (komplett: Bilder, Unterschriften, alles)
- 📅 Kalender-Export (.ics) pro Termin oder gesammelt

---

## ⚖️ Wichtige Hinweise

> **Diese App ist kein Ersatz für anwaltlichen Rat oder eine Schuldnerberatung.**

Sie hilft beim **Strukturieren deiner Daten** und bei einem **formal sauberen ersten Entwurf** von Anschreiben. Bei strittigen Fällen, größeren Beträgen oder drohender Vollstreckung solltest du dir **professionelle Hilfe** holen:

- **Bewährungshilfe** – dein:e Bewährungshelfer:in ist erste Anlaufstelle
- **Schuldnerberatung** (kostenlos) – Caritas, Diakonie, Verbraucherzentrale
- **Strafverteidiger:in** – bei rechtlichen Fragen

Die Brief-Vorlagen sind ein **Startpunkt**, kein fertiger Antrag.

---

## 🛠 Entwicklung & Mitmachen

```bash
git clone https://github.com/123ichbinmitdabei/bewaehrungshilfe.git
cd bewaehrungshilfe
# Einfach index.html im Browser öffnen
```

Verbesserungs-Vorschläge gerne als [Issue](https://github.com/123ichbinmitdabei/bewaehrungshilfe/issues).

---

## 📄 Lizenz

Custom License – siehe [LICENSE](LICENSE).

**Kurzfassung:** Kostenlos nutzbar für Privatpersonen, Bewährungshilfe-Stellen und gemeinnützige Beratungsangebote. **Keine kommerzielle Nutzung** ohne ausdrückliche Genehmigung.

---

## 📜 Changelog

### v3.11 (April 2026) – Termin-Management komplett
- 📅 **Verschieben-Funktion**: neuer Dialog mit Wahl zwischen „neue Zeile" und „direkt ändern"
- 🔁 **Ersatz-Termin** automatisch nach Verpasst/Abgesagt anbieten
- 📲 **Kalender-Export erweitert**: pro Zeile + Sammel-Export für alle Termine in jeder Tabelle
- 💶 **Verschoben-Zahlungen**: Folge-Dialog für neues Fälligkeitsdatum
- ✨ Polish: Hilfe-Sektion erweitert, robuste Quote-Behandlung

### v3.10 (April 2026) – Heute-Übersicht mit Aktionen
- ✅ Action-Buttons direkt in der Heute-Übersicht: Erledigt / Verpasst / Abgesagt
- 🤝 Sozial-Spezial: Auto-Berechnung der Stunden aus von/bis/Pause möglich
- 🧹 Erledigte Termine verschwinden aus der Übersicht (bleiben in der Tabelle)
- 💾 Sofortiges Speichern bei Status-Änderung

### v3.9 (April 2026) – Notizen + Pro-Zeile-Unterschrift überall
- 📝 Notiz-Felder (Textareas) für Therapie, Sozialstunden, BH-Termine
- ✍️ Pro-Zeile-Unterschrift jetzt auch für Therapie und BH-Termine
- 📅 Heute-Übersicht zeigt alle Termin-Arten (Therapie, Sozial, BH, Zahlungen)
- 🐛 Wichtiger Bugfix: Quote-sichere Inline-Handler

### v3.8 (April 2026) – Digitale Unterschriften
- ✍️ Digitales Unterschrifts-System mit Canvas (Touch/Maus/Stylus)
- 📐 Hybrid: Digital ODER handschriftlich
- 🕐 Zeitstempel + Geräte-Info automatisch erfasst
- 📋 Verifikations-Seite am Ende jedes Ausdrucks
- 📝 Unterschriften als Bilder im Word-Export eingebettet
- 🗜 Komprimierung (JPEG 0.8 / 400×133px)

### v3.6 (April 2026)
- 📤 System-Teilen mit Belegen (iOS/Android)
- 📦 ZIP-Bundle-Download mit Dokument + Belegen

### v3.5 (April 2026)
- 🌙 Dark Mode Lesbarkeit gefixt
- 💸 Neues Dokument: Verfahrenskosten & Geldstrafe
- ✉️ 2 neue Anschreiben: Ratenzahlung + Stundung

### v3.3 / v3.4
- 📦 Neues Dokument: Beweismittel & Asservate
- 📨 Antrag auf Herausgabe (§ 111n StPO)

---

**Aktuelle Version:** v3.11
**Letztes Update:** April 2026
