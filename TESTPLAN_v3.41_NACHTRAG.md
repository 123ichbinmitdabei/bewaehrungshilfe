# Testplan-Nachtrag v3.41 (manuelle Prüfpunkte)

Ergänzung zu `TESTPLAN_v3.40.md` für die zwei v3.41-Robustheits-Fixes. Auf echten Geräten abhaken. Vorher Hard-Reload, Footer muss `v3.41` zeigen.

## N1. Reset-Button bleibt auf die eigene App begrenzt

| # | Schritt | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | weitere |
|---|---|---|---|---|---|---|
| N1.1 | Einstellungen, „Cache leeren und neu laden“ | App lädt neu | ☐ | ☐ | ☐ | ☐ |
| N1.2 | Nach Reset Daten prüfen | Alle Eingaben, Belege, Kontakte noch da (localStorage unberührt) | ☐ | ☐ | ☐ | ☐ |
| N1.3 | Falls ein zweites Pages-Projekt derselben Origin (z.B. terp-sessions) einen Service Worker oder Cache hat: nach dem Reset prüfen | Fremde App bleibt unberührt (ihr SW/Cache ist NICHT weg) | ☐ | ☐ | ☐ | ☐ |

Hinweis: N1.3 ist nur testbar, wenn tatsächlich ein zweites Projekt auf `123ichbinmitdabei.github.io` einen SW registriert hat. Andernfalls entfällt der Punkt; die Logik ist durch `smoke_v341_reset.js` automatisiert abgesichert (eigener Cache/SW gelöscht, fremder nicht).

## N2. Zwei Modals nacheinander (keine stille Überschreibung)

| # | Schritt | Erwartetes Ergebnis | iOS-PWA | Android | Win-Chrome | weitere |
|---|---|---|---|---|---|---|
| N2.1 | Einen Dialog öffnen (z.B. Zeile löschen) und offen lassen | Modal sichtbar | ☐ | ☐ | ☐ | ☐ |
| N2.2 | Während dessen einen zweiten Dialog auslösen (z.B. BH-Termin als wahrgenommen markieren, was den zeitgesteuerten Notiz-Vorschlag triggern kann) | Der erste Dialog verschwindet NICHT, bleibt sichtbar | ☐ | ☐ | ☐ | ☐ |
| N2.3 | Ersten Dialog beantworten | Erst danach erscheint der zweite Dialog | ☐ | ☐ | ☐ | ☐ |
| N2.4 | Zweiten Dialog abbrechen | Keine ungewollte Aktion, kein destruktiver Effekt ohne Bestätigung | ☐ | ☐ | ☐ | ☐ |

---

- Getestet am: __________
- Getestet von: __________
- Geräte: __________
- Blocker gefunden: ☐ ja ☐ nein
- Notizen:
