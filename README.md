# 📁 Bewährungshilfe-Assistent

> Eine kostenlose, lokale Web-App für Menschen in der Bewährungszeit. Hilft beim Strukturieren und Erstellen aller wichtigen Dokumente und Anschreiben.

🌐 **Live-Version:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/

📲 **Installierbar als App** auf iPhone, iPad, Android, Windows, macOS und Linux (PWA)

---

## ✨ Was kann die App?

Strukturierte Vorlagen für 9 zentrale Dokumente, dazu 9 vorgefertigte Anschreiben für typische Behördenkontakte – alles in einer einzigen HTML-Datei, die offline funktioniert und ausschließlich auf deinem Gerät läuft.

### 📋 Die 9 Dokumente

| Icon | Dokument | Zweck |
|------|----------|-------|
| 📊 | **Status-Übersicht** | Auto-generiertes Deckblatt mit Snapshot aller Bereiche |
| 📞 | **BH-Termine & Gespräche** | Termin-Tracker mit Vorbereitungs-Notizen |
| 📋 | **Einnahmen-Ausgaben-Rechnung** | Komplette Finanzaufstellung |
| 💶 | **Schadenswiedergutmachung** | Tracker mit Zahlungsverlauf, Belegen, Fortschritt |
| 💸 | **Verfahrenskosten & Geldstrafe** | Tracker für Gerichtskosten, Geldstrafe, Anwalt + Anträge |
| 🤝 | **Sozialstunden-Nachweis** | Stundenliste zum Abstempeln durch Einrichtung |
| 🧠 | **Therapie-Bestätigung** | Zum Ausfüllen durch Therapeut/in |
| 📅 | **Zeitstrahl / Lebensverlauf** | Wohnungen, Arbeit, Bildung, Therapie, Hilfen |
| 📦 | **Beweismittel & Asservate** | Doku beschlagnahmter Gegenstände + Antrag auf Herausgabe |

### ✉️ Die 9 Anschreiben-Vorlagen

- 📝 **Stundungsantrag (Geldauflage)** – an die Bewährungshilfe
- 🤒 **Krankmeldung** an die Bewährungshilfe
- 🧠 **Bitte um Therapiebestätigung** an Therapeut:in
- 🤝 **Bitte um Sozialstunden-Bestätigung** an Einrichtung
- 📋 **Antrag auf Lockerung der Bewährungsauflagen** an das Gericht
- 📦 **Antrag auf Herausgabe (§ 111n StPO)** an die StA – mit automatischer Liste der Gegenstände
- ⏰ **Sachstandsanfrage Herausgabe** – Erinnerung bei ausbleibender Antwort
- 💸 **Antrag auf Ratenzahlung** (Verfahrenskosten / Geldstrafe) – an StA oder Landesjustizkasse
- ⏳ **Antrag auf Stundung** (Verfahrenskosten / Geldstrafe) – an StA

Alle Briefe füllen sich automatisch mit deinen Stammdaten und Dokumenten-Inhalten aus.

---

## 📤 Dokumente versenden – mit Belegen

In der Druckansicht jedes Dokuments stehen je nach Gerät verschiedene Versand-Optionen zur Verfügung:

- **📤 Teilen** (auf iPhone, iPad, Android): Öffnet das System-Teilen-Menü mit Dokument *und allen Belegen als einzelne Dateien*. Wähle dann z.B. Mail, WhatsApp, AirDrop, Signal etc.
- **📦 ZIP mit Belegen** (auf jedem Gerät – Desktop und Mobile): Lädt eine ZIP-Datei mit dem Dokument plus allen Belegen herunter, sortiert in Unterordnern. Die ZIP hängst du dann manuell an deine E-Mail an.
- **🖨 Drucken / als PDF**: Klassische Druckansicht – Belege werden auf Folge-Seiten angehängt (umschaltbar).

> 💡 **Hintergrund:** E-Mail-Programme nutzen den Standard `mailto:`, der keine Anhänge unterstützt. Daher der Umweg über System-Teilen oder ZIP-Download – beide Wege sind aber komfortabel und funktionieren zuverlässig.

---

## 🔒 Datenschutz & Sicherheit

Diese App ist **bewusst lokal** – keine Server, keine Cloud, keine Tracker:

- ✅ **Daten bleiben auf deinem Gerät** (im Browser-Speicher / localStorage)
- ✅ **Keine Anmeldung, keine Konten, kein Login**
- ✅ **Funktioniert komplett offline** nach erstem Laden
- ✅ **Optionaler PIN-Schutz** mit Wiederherstellungsfrage
- ✅ **Sicher exportierbar** als JSON-Backup
- ✅ **Open Source** – jeder kann den Code prüfen

---

## 📲 Installation

### iPhone / iPad
1. Link in **Safari** öffnen (wichtig - nicht Chrome!)
2. Teilen-Symbol (□↑) tippen
3. Nach unten scrollen → **„Zum Home-Bildschirm"**
4. **„Hinzufügen"** bestätigen

### Android
1. Link in **Chrome** öffnen
2. Drei-Punkte-Menü tippen
3. **„App installieren"** oder **„Zum Startbildschirm hinzufügen"**

### Windows / macOS / Linux (Chrome, Edge, Brave)
1. Link im Browser öffnen
2. Installations-Symbol in der Adressleiste anklicken (Computer mit Pfeil)
3. **„Installieren"** bestätigen

Nach der Installation läuft die App im Vollbild – wie eine richtige App, auch offline.

---

## 🎯 Features

### Dokument-Wizard
- Schritt-für-Schritt-Ausfüllen mit Fortschritts-Anzeige
- Felder als „Nicht zutreffend" markierbar
- **Geteilte Stammdaten** – Name, Adresse etc. wird einmal eingetragen und überall verwendet
- Tabellen mit beliebig vielen Zeilen (Zahlungen, Termine, Stunden, Gegenstände)
- **Datei-Anhänge** für Belege (Fotos, PDFs)
- **Dark Mode** mit angenehmen Kontrasten

### Export & Versand
- 📄 **PDF / Drucken** mit professionellem Layout
- 📝 **Word-Datei (.docx)** für 5 Hauptdokumente
- 📤 **System-Teilen** mit Dokument + allen Belegen (iOS/Android)
- 📦 **ZIP-Bundle** mit Dokument + Belegen, strukturiert in Unterordnern
- 💾 **JSON-Backup** aller Daten
- 📅 **Kalender-Export** (.ics) für Termine

### Praktisches
- 🌙 **Theme-Wechsel** (Hell / Dunkel) mit voll lesbaren Buttons
- 📅 **Heute-Übersicht** mit anstehenden Terminen
- 🔍 **Suchfunktion** in Tabellen
- 📦 **Archivierung** alter Dokumente
- 🔗 **QR-Code-Sharing** der App

---

## 🏗 Technisches

- **Single HTML File** – keine Build-Tools, kein Framework, kein Backend
- **PWA** mit Manifest und Service-Worker-Funktionalität
- **localStorage** als primäre Datenhaltung
- **Lazy-loaded Libraries** (docx-js, JSZip) – nur wenn benötigt
- **iOS Safe-Area-Support** für PWA-Vollbild-Modus
- **iOS-Zoom-Verhinderung** bei Input-Fokus
- **Browser-Kompatibilitäts-Check** beim Start

### Unterstützte Browser
- Safari (iOS / macOS) ✅
- Chrome (Android / Desktop) ✅
- Firefox (Desktop) ✅
- Edge (Windows) ✅
- Brave (alle Plattformen) ✅

---

## ⚖️ Wichtige Hinweise

> **Diese App ist kein Ersatz für anwaltlichen Rat oder eine Schuldnerberatung.**

Sie hilft dir beim **Strukturieren deiner Daten** und bei einem **formal sauberen ersten Entwurf** von Anschreiben. Bei strittigen Fällen, größeren Beträgen, drohender Vollstreckung oder Härtefällen solltest du dir **professionelle Hilfe** holen:

- **Bewährungshilfe** – dein:e Bewährungshelfer:in ist erste Anlaufstelle
- **Schuldnerberatung** (kostenlos) – Caritas, Diakonie, Verbraucherzentrale
- **Strafverteidiger:in** – bei rechtlichen Fragen, drohender Einziehung etc.

Die Brief-Vorlagen sind ein **Startpunkt**, kein fertiger Antrag – die individuelle Begründung musst du selbst formulieren.

---

## 🛠 Entwicklung

### Lokal nutzen
```bash
git clone https://github.com/123ichbinmitdabei/bewaehrungshilfe.git
cd bewaehrungshilfe
# Einfach index.html im Browser öffnen
```

### Mitmachen
Verbesserungs-Vorschläge, Bugs und Ideen gerne als [Issue](https://github.com/123ichbinmitdabei/bewaehrungshilfe/issues) – die App wurde aus der Praxis heraus entwickelt und lebt von echtem Nutzer-Feedback.

---

## 📄 Lizenz

Custom License – siehe [LICENSE](LICENSE).

**Kurzfassung:** Kostenlos nutzbar für Privatpersonen, Bewährungshilfe-Stellen und gemeinnützige Beratungsangebote. **Keine kommerzielle Nutzung** ohne ausdrückliche Genehmigung.

---

## 🙏 Danksagung

Diese App entsteht in Zusammenarbeit mit Praktiker:innen aus der Bewährungshilfe, mit Hilfe von KI-gestützter Entwicklung. Sie soll Menschen in einer schwierigen Lebensphase eine konkrete Erleichterung bieten.

Wenn du Feedback, Anregungen oder Verbesserungsvorschläge hast, melde dich gerne über GitHub Issues.

---

## 📜 Changelog

### v3.6 (April 2026)
- 📤 **System-Teilen mit Belegen** – Dokument + alle Belege als Anhänge in einem Schritt teilen (iOS/Android)
- 📦 **ZIP-Bundle-Download** – Dokument + Belege strukturiert als ZIP herunterladen (alle Geräte)
- 🌐 Sprachwechsel-Knopf entfernt (war nicht funktional, nur DE wird aktiv genutzt)
- ZIP-Versand jetzt auch für Verfahrenskosten und Asservate verfügbar

### v3.5 (April 2026)
- 🌙 Dark Mode Lesbarkeit gefixt – Header-Buttons sind jetzt voll lesbar
- 💸 Neues 9. Dokument: Verfahrenskosten & Geldstrafe
- ✉️ 2 neue Anschreiben: Antrag auf Ratenzahlung + Stundung (§§ 459a, 459g StPO)

### v3.3 / v3.4
- 📦 Neues Dokument: Beweismittel & Asservate
- 📨 Antrag auf Herausgabe (§ 111n StPO) mit automatischer Gegenstands-Liste
- 🔄 Sinnvolle Reihenfolge der Kacheln auf der Startseite
- 🔍 Erweiterte Asservate-Doku mit Durchsuchungs- und StrEG-Sektion

---

**Aktuelle Version:** v3.6
**Letztes Update:** April 2026
