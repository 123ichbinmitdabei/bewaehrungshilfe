# Manuelles Testprotokoll v3.40 (echte Geräte)

Diese Tests kann die automatisierte Suite NICHT abdecken (echter Browser, echte Geräte, echtes Drucken, echte PWA noetig). Bitte auf jedem Gerät durchgehen und abhaken. Befund-Spalte fuer Notizen nutzen (z.B. „ok“ oder Fehlerbeschreibung).

**Vor dem Test:** Auf jedem Gerät einen Hard-Reload machen, damit wirklich v3.40 geladen ist. Footer muss `v3.40` zeigen.

## Geräte-Matrix

Lege je Gerät eine Spalte an (abhaken). Empfohlene Geräte:

| Kürzel | Gerät / Browser |
|---|---|
| iOS-PWA | iPhone, Safari, als App installiert (zum Home-Bildschirm) |
| iOS-Tab | iPhone, Safari im Browser-Tab |
| Android | Android, Chrome |
| Win-Chrome | Desktop Windows, Chrome |
| Win-Firefox | Desktop Windows, Firefox |
| Win-Edge | Desktop Windows, Edge |
| Mac-Safari | macOS, Safari (falls vorhanden) |

---

## 1. Version und Start

| # | Schritt | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | Win-Firefox | weitere |
|---|---|---|---|---|---|---|---|
| 1.1 | App oeffnen, Footer pruefen | Footer zeigt `v3.40` | ☐ | ☐ | ☐ | ☐ | ☐ |
| 1.2 | Startseite laedt | Kein Crash, Startbildschirm sichtbar | ☐ | ☐ | ☐ | ☐ | ☐ |

## 2. Pro Wizard (alle 10): Felder ausfüllen, Hard-Reload, Werte noch da

Wizards: EAR, Zeitstrahl, Therapie, Schadenswiedergutmachung, Sozialstunden, Status-Übersicht, BH-Termine, Verfahrenskosten, Asservate, Ziele.

Pro Wizard je ein Text-, ein Zahl- und ein Datumsfeld ausfuellen, dann Hard-Reload, pruefen dass die Werte erhalten sind.

| # | Wizard | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | Win-Firefox | weitere |
|---|---|---|---|---|---|---|---|
| 2.1 | EAR | Text/Zahl/Datum nach Reload erhalten | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.2 | Zeitstrahl | Werte nach Reload erhalten | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.3 | Therapie | Werte nach Reload erhalten | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.4 | Schadenswiedergutmachung | Werte nach Reload erhalten | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.5 | Sozialstunden | Werte nach Reload erhalten | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.6 | Status-Übersicht | Anzeige korrekt (read-only) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.7 | BH-Termine | Werte nach Reload erhalten | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.8 | Verfahrenskosten | Werte nach Reload erhalten | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.9 | Asservate | Werte nach Reload erhalten | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.10 | Ziele | Werte nach Reload erhalten | ☐ | ☐ | ☐ | ☐ | ☐ |

## 3. Alle Dialoge: je einmal bestätigen, je einmal abbrechen

In v3.40 sind ALLE Dialoge In-App-Modals (keine nativen Browser-Dialoge mehr). Pruefen: Abbrechen tut NICHTS, Bestaetigen fuehrt die Aktion aus. Besonders auf iOS-PWA wichtig (dort wurden native Dialoge frueher unterdrueckt).

| # | Dialog (Aktion) | Abbrechen | Bestätigen | iOS-PWA | Android | Win-Chrome | weitere |
|---|---|---|---|---|---|---|---|
| 3.1 | Tabellen-Zeile löschen | bleibt erhalten | wird gelöscht | ☐ | ☐ | ☐ | ☐ |
| 3.2 | Beleg aus Inbox löschen | bleibt | gelöscht | ☐ | ☐ | ☐ | ☐ |
| 3.3 | Gespeicherte Unterschrift löschen | bleibt | gelöscht | ☐ | ☐ | ☐ | ☐ |
| 3.4 | PIN-Schutz entfernen | bleibt aktiv | entfernt | ☐ | ☐ | ☐ | ☐ |
| 3.5 | Einstellungen zurücksetzen | unverändert | zurückgesetzt | ☐ | ☐ | ☐ | ☐ |
| 3.6 | Termin als verpasst/abgesagt markieren | kein Status | Status gesetzt, danach Ersatz-Termin-Frage | ☐ | ☐ | ☐ | ☐ |
| 3.7 | Ersatz-Termin-Frage (nach 3.6) | kein neuer Termin | Reschedule-Dialog | ☐ | ☐ | ☐ | ☐ |
| 3.8 | Zahlung als bezahlt markieren | unverändert | Betrags-Eingabe-Modal, dann bezahlt | ☐ | ☐ | ☐ | ☐ |
| 3.9 | Zahlung als verschoben markieren | unverändert | verschoben, dann Datum-Frage | ☐ | ☐ | ☐ | ☐ |
| 3.10 | Sozialstunden-Einsatz erledigt | nur Status, keine Stunden | Stunden automatisch eingetragen | ☐ | ☐ | ☐ | ☐ |
| 3.11 | Backup importieren (überschreibt) | kein Import | Daten importiert | ☐ | ☐ | ☐ | ☐ |
| 3.12 | Große PDF hinzufügen (> Limit) | nicht hinzugefügt | hinzugefügt | ☐ | ☐ | ☐ | ☐ |
| 3.13 | OCR anwenden (Texterkennung) | kein OCR | OCR läuft | ☐ | ☐ | ☐ | ☐ |
| 3.14 | Teilen-Fallback (ZIP) auf Gerät ohne Share | kein Download | ZIP-Download | ☐ | ☐ | ☐ | ☐ |
| 3.15 | Notiz-Vorschlag nach BH-Termin | Notizen bleiben offen | Notizen erledigt | ☐ | ☐ | ☐ | ☐ |

Hinweis: In v3.40 gibt es KEINE bewusst nativ belassenen `confirm()` mehr. Alle sind migriert. Falls irgendwo doch ein nativer Browser-Dialog erscheint, ist das ein Fehler, bitte melden.

## 4. Drucken (DER zentrale Validierungspunkt)

Jeden Druckpfad auf jedem Gerät. Erwartung: KEINE leere Seite, Druckvorschau erscheint, Inhalt sichtbar.

| # | Druckpfad | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | Win-Firefox | Mac-Safari |
|---|---|---|---|---|---|---|---|
| 4.1 | Brief (Anschreiben) drucken | Vorschau mit Brieftext, nicht leer | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4.2 | Formular (Erklärung wirtschaftliche Verhältnisse) drucken | Vorschau mit Formular, nicht leer | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4.3 | Dokument/EAR drucken | Vorschau mit Tabelle, nicht leer | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4.4 | Druck mit ausgewählten Anhängen | Anhänge erscheinen als Seiten | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4.5 | Leerer Brief drucken | Hinweis (alert), keine leere Seite | ☐ | ☐ | ☐ | ☐ | ☐ |

## 5. Backup-Export und Re-Import

| # | Schritt | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | weitere |
|---|---|---|---|---|---|---|
| 5.1 | Daten exportieren | JSON-Datei wird gespeichert | ☐ | ☐ | ☐ | ☐ |
| 5.2 | In frischem Profil / privatem Fenster importieren | Import-Bestätigung erscheint | ☐ | ☐ | ☐ | ☐ |
| 5.3 | Stichprobe Identität | Name, ein Doc-Feld, ein Kontakt identisch zum Original | ☐ | ☐ | ☐ | ☐ |

## 6. Sync (altes Desktop-Symptom)

| # | Schritt | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | weitere |
|---|---|---|---|---|---|---|
| 6.1 | Stammdaten ändern (z.B. Therapeut-Name) | Wert gespeichert | ☐ | ☐ | ☐ | ☐ |
| 6.2 | Adressbuch öffnen | Geänderter Wert ist dort sichtbar | ☐ | ☐ | ☐ | ☐ |
| 6.3 | Wert in einem Doc prüfen | Gemappte Felder zeigen den Wert | ☐ | ☐ | ☐ | ☐ |
| 6.4 | Desktop UND Mobil | Auf beiden Geräten gleiches Verhalten | ☐ | ☐ | ☐ | ☐ |

## 7. Eingabe-Validierung (nur Hinweis, kein Blockieren)

| # | Schritt | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | weitere |
|---|---|---|---|---|---|---|
| 7.1 | IBAN falsch eingeben (z.B. DE00...) | dezenter Hinweis (Rand/Tooltip), Eingabe NICHT blockiert, Wert bleibt | ☐ | ☐ | ☐ | ☐ |
| 7.2 | Datum unmöglich (z.B. 31.02.2026) | Hinweis, Eingabe bleibt erhalten, nicht korrigiert | ☐ | ☐ | ☐ | ☐ |
| 7.3 | Betrag als Text (z.B. „zwölf“) | Hinweis, Wert bleibt unverändert | ☐ | ☐ | ☐ | ☐ |
| 7.4 | Korrekte Werte | Kein Hinweis | ☐ | ☐ | ☐ | ☐ |

## 8. App-Cache-Reset-Button (live, auch ohne aktiven SW)

| # | Schritt | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | weitere |
|---|---|---|---|---|---|---|
| 8.1 | Einstellungen, „Cache leeren und neu laden“ | App lädt neu | ☐ | ☐ | ☐ | ☐ |
| 8.2 | Nach Reset Daten prüfen | Alle Eingaben, Belege, Kontakte noch da | ☐ | ☐ | ☐ | ☐ |

## 9. Service-Worker-Aktivierung (NUR falls separat durchgeführt)

Nur ausfuellen, wenn der SW nach `SW_ACTIVATION_v3.40.md` aktiviert wurde. In v3.40 standardmaessig NICHT aktiv.

| # | Schritt | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | weitere |
|---|---|---|---|---|---|---|
| 9.1 | 5-Schritte-Plan aus SW_ACTIVATION_v3.40.md | alle Schritte gruen | ☐ | ☐ | ☐ | ☐ |
| 9.2 | Offline öffnen (Flugmodus) | App lädt aus Cache | ☐ | ☐ | ☐ | ☐ |
| 9.3 | Neue Version deployen, einmal neu laden | Update kommt durch | ☐ | ☐ | ☐ | ☐ |
| 9.4 | Reset-Button nach SW-Aktivierung | SW weg, Caches weg, Daten erhalten | ☐ | ☐ | ☐ | ☐ |

---

## Befund-Zusammenfassung

- Getestet am: __________
- Getestet von: __________
- Geräte: __________
- Blocker gefunden: ☐ ja ☐ nein
- Notizen:
