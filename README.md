# Bewährungshilfe-Assistent

Eine kostenlose, datenschutzfreundliche Web-App, die hilft, Dokumente und
Termine rund um eine Bewährungszeit zu organisieren – komplett lokal im
Browser, ohne Server, ohne Anmeldung.

> 👉 **App direkt nutzen:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/

## Für wen ist das?

- Menschen, die in einer Bewährungszeit sind und ihre Unterlagen ordnen
  möchten
- Bewährungshelfer:innen, die ihren Klient:innen ein einfaches Werkzeug
  empfehlen wollen
- Sozialarbeiter:innen, Therapeut:innen und alle, die mit
  Bewährungsproband:innen arbeiten

## Funktionen

### Sieben Dokumente

| Dokument | Zweck |
|---|---|
| 📋 Einnahmen-Ausgaben-Rechnung | Komplette Finanzaufstellung |
| 📅 Zeitstrahl / Lebensverlauf | Wohnungen, Arbeit, Bildung, Therapie, Hilfen |
| 🧠 Therapie-Bestätigung | Vorlage zum Ausfüllen durch Therapeut/in |
| 💶 Schadenswiedergutmachung | Tracker mit Zahlungsverlauf, Belegen, automatischer Restbetrag-Berechnung |
| 🤝 Sozialstunden-Nachweis | Stundenliste zum Abstempeln durch Einrichtung |
| 📊 Status-Übersicht | Auto-generiert aus allen anderen Dokumenten |
| 📞 BH-Termine & Gespräche | Termin-Tracker mit Vorbereitungs-Notizen |

### Komfort-Features

- ⚡ **Schnell-Eintrag** für Zahlungen und Sozialstunden – Eintrag in 10 Sekunden mit Foto
- 📎 **Belege hochladen** – Fotos werden automatisch komprimiert
- 📷 **Direkte Kamera-Aufnahme** über die App
- 📝 **Schnell-Notizen** mit Kategorien (Bei BH / Nach BH / Sonstiges)
- 📅 **Kalender-Export** als ICS-Datei für Apple/Google/Thunderbird
- ⏰ **Stichtag-Erinnerungen** für Schadens-Frist und Sozialstunden-Frist
- ✉️ **5 vorgefertigte Anschreiben** (Stundungsantrag, Krankmeldung an BH,
  Bestätigungs-Anforderung an Therapeut/Einrichtung, Lockerungsantrag) –
  automatisch ausgefüllt mit den Stammdaten
- 📤 **Direkt teilen** per Mail, AirDrop, WhatsApp, etc.
- 🔍 **Suchfunktion** in langen Tabellen
- 📦 **Archiv** für abgeschlossene Dokumente
- 🌓 **Dunkler Modus**
- 🔒 **Optionale PIN-Sperre** mit Sicherheitsfrage zur Wiederherstellung
- 💾 **Backup als JSON** zur Sicherung und Geräte-Übertragung
- 🌐 **Mehrsprachiger Druck** (Deutsch / Englisch)

### Auto-Format-Tricks

- Datum: tippe `15032025` → wird automatisch `15.03.2025`
- Uhrzeit: tippe `0900` → wird `09:00`
- Sozialstunden: aus „von" / „bis" / „Pause" wird die Netto-Stundenzahl
  automatisch berechnet

## Datenschutz

**Alle Daten bleiben lokal** auf dem Gerät der Nutzer:in. Keine Server-
Übertragung, keine Anmeldung, keine Tracker, keine Werbung.

- ✅ Daten liegen ausschließlich im `localStorage` des Browsers
- ✅ App läuft komplett offline (nach dem ersten Laden)
- ✅ Backup-Dateien (JSON) bleiben in der Hand der Nutzer:in
- ⚠️ Einzige Ausnahme: Beim Erstellen von Word-Dokumenten (.docx) wird
  einmalig eine Bibliothek von einem öffentlichen CDN nachgeladen
  (cdnjs.cloudflare.com) – die Nutzerdaten verlassen dabei trotzdem nie
  das Gerät.

GitHub Pages hostet nur die statische HTML-Datei – die App selbst kommuniziert
nicht zurück mit GitHub.

## Auf welchen Geräten läuft das?

| Plattform | Browser | Als App installierbar |
|---|---|---|
| iPhone (iOS) | Safari | ✓ via Teilen → Zum Home-Bildschirm |
| iPad (iPadOS) | Safari | ✓ |
| Android | Chrome, Edge, Samsung Internet, Opera | ✓ |
| Windows 10/11 | Chrome, Edge, Opera | ✓ via Adressleiste-Symbol |
| macOS 14+ | Safari, Chrome, Edge | ✓ |
| Linux | Chrome, Chromium, Edge, Opera | ✓ |
| ChromeOS | Chrome | ✓ |
| Firefox (alle Plattformen) | – | ✗ läuft im Browser, aber keine PWA-Installation |

In der App ist eine ausführliche Hilfe mit Schritt-für-Schritt-Anleitung
für jede Plattform integriert.

## Daten zwischen Geräten übertragen

Es gibt keinen automatischen Sync (das wäre datenschutzrechtlich heikel).
Manueller Abgleich:

1. Auf Gerät A: **💾 Sichern** → JSON-Datei wird heruntergeladen
2. Datei in eine Cloud legen (iCloud Drive, Google Drive, OneDrive,
   Dropbox, Nextcloud) oder per E-Mail / AirDrop / Schnellfreigabe /
   KDE Connect übertragen
3. Auf Gerät B: App öffnen → **📥 Laden** → JSON auswählen

## Technische Details

- Eine einzige HTML-Datei, ~300 KB
- Kein Build-Prozess, keine Abhängigkeiten zur Laufzeit (außer optional
  docx-js zum Word-Export)
- Reines Vanilla-JavaScript, keine Frameworks
- Funktioniert offline-first als PWA (Progressive Web App)

## Mitwirken / Feedback

Wenn du Fehler findest, Verbesserungsvorschläge hast oder neue Features
wünschst, öffne ein Issue oder schreib direkt los.

## Lizenz

MIT-Lizenz – siehe [LICENSE](LICENSE) (frei nutzbar, modifizierbar und
weitergebbar, mit Nennung der Urheberschaft).

## Disclaimer

Die App ersetzt keine Rechtsberatung und keine Beratung durch
Bewährungshilfe oder Sozialdienste. Sie ist ein Werkzeug zur Organisation
und Vorbereitung. Bei rechtlichen Fragen wende dich bitte an deine
Bewährungshelferin / deinen Bewährungshelfer oder an einen Anwalt.

Die in der App enthaltene PIN-Sperre ist ein einfacher Sichtschutz, **kein
kryptographischer Schutz**. Wer technisch versiert ist, kann auf die im
Browser gespeicherten Daten zugreifen. Speichere sensible Belege bei Bedarf
zusätzlich verschlüsselt.
