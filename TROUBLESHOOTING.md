# Hilfe bei Problemen, Bewaehrungshilfe-Assistent

Diese Anleitung hilft bei den zwei haeufigsten Symptomen: „etwas wird nicht aktualisiert" und „der Drucken-Knopf reagiert nicht". In fast allen Faellen liegt es an einer alten, im Browser gespeicherten Version der App. Die Loesung ist ein „Cache-Reset" (die App frisch neu laden).

Wichtig vorweg: Ein Cache-Reset loescht NICHT deine eingetragenen Daten. Deine Dokumente, Kontakte und Briefe bleiben erhalten. Trotzdem ist ein Backup nie verkehrt (in der App unter „Export / Sicherung").

---

## Teil 1, Desktop-PC (Windows, Mac, Linux)

### Schritt 1, Harter Neu-Ladevorgang (behebt 90 Prozent der Faelle)
- **Chrome, Edge, Firefox (Windows / Linux):** Halte `Strg` gedrueckt und druecke `F5`. Alternativ `Strg` + `Umschalt` + `R`.
- **Chrome, Edge, Firefox, Safari (Mac):** `Cmd` + `Umschalt` + `R`. Bei Safari zusaetzlich moeglich: `Cmd` + `Option` + `R`.

### Schritt 2, Cache gezielt leeren (falls Schritt 1 nicht reicht)
1. Druecke `F12` (Entwicklertools oeffnen). Bei Mac-Safari muss zuerst im Menue „Safari, Einstellungen, Erweitert" der Haken bei „Entwicklermenue anzeigen" gesetzt werden.
2. Klicke mit der rechten Maustaste auf den Neu-Laden-Knopf (der runde Pfeil neben der Adresszeile).
3. Waehle „Cache leeren und vollstaendig neu laden" (Chrome / Edge) bzw. den entsprechenden Eintrag.

### Schritt 3, Browserdaten fuer diese Seite loeschen (letzte Stufe)
- **Chrome / Edge:** Klicke links neben der Adresse auf das Schloss-Symbol, dann „Cookies und Websitedaten", dann „Daten loeschen". Seite neu laden.
- **Firefox:** Schloss-Symbol, „Verbindung sicher", „Weitere Informationen", „Berechtigungen / Daten loeschen".
- **Safari:** „Safari, Einstellungen, Datenschutz, Websitedaten verwalten", die App-Adresse suchen und entfernen.

Hinweis: Stufe 3 kann lokale App-Einstellungen (z.B. PIN) zuruecksetzen. Mache vorher ein Backup ueber „Export / Sicherung".

---

## Teil 2, Handy und Tablet

### iPhone / iPad (Safari)
1. **Als normale Webseite (im Safari-Tab):** Adresszeile antippen, dann den Neu-Laden-Pfeil. Hilft das nicht: Tab schliessen und die Seite ueber das Lesezeichen neu oeffnen.
2. **Cache leeren:** „Einstellungen" (App), nach unten zu „Safari", dann „Verlauf und Websitedaten loeschen". Achtung: betrifft alle Safari-Seiten.
3. **Als installierte App (Symbol auf dem Home-Bildschirm):** Das Symbol gedrueckt halten, „App entfernen" / „Lesezeichen loeschen". Danach Safari oeffnen, die Adresse neu laden und erneut „Zum Home-Bildschirm" hinzufuegen. So wird die neueste Version installiert.

### Android (Chrome)
1. **Im Browser:** Menue (drei Punkte), Neu laden. Hilft das nicht: Menue, „Verlauf", „Browserdaten loeschen", dort „Bilder und Dateien im Cache" auswaehlen und loeschen.
2. **Gezielt fuer die Seite:** Auf das Schloss-Symbol in der Adresszeile tippen, „Berechtigungen", „Daten loeschen / zuruecksetzen".
3. **Als installierte PWA:** App-Symbol gedrueckt halten, „App-Info", „Speicher", „Cache leeren" (NICHT „Speicher loeschen", das wuerde lokale Daten entfernen, vorher Backup machen). Alternativ die PWA deinstallieren und ueber Chrome neu installieren.

---

## Teil 3, Wenn es danach immer noch klemmt

### Der Drucken-Knopf tut nichts
- Stelle sicher, dass du nach dem Update einen harten Neu-Ladevorgang (Teil 1, Schritt 1) gemacht hast. Der alte Druck-Code konnte auf Handy und PC stecken bleiben.
- Pruefe, ob ein Brief-Text vorhanden ist. Bei leerem Brief erscheint jetzt ein Hinweis statt einer leeren Seite.
- Wenn ein Druckdialog kurz aufblitzt und wieder verschwindet: das ist normal, die Vorschau wird vorbereitet. Einen Moment warten.

### Eingetragene Daten erscheinen nicht in Briefen oder im Adressbuch
- Im Adressbuch gibt es den Knopf „Jetzt aktualisieren". Damit werden Therapeut, Anwalt, Gerichtskasse usw. aus deinen Dokumenten uebernommen.
- Wenn das am PC nicht klappt, aber am Handy schon: fast sicher eine alte gecachte Version am PC. Teil 1 durchfuehren.

### Nichts hilft
- Mache ein Backup (Export / Sicherung), notiere welcher Browser und welches Geraet, und melde das Problem mit einem Screenshot der Browser-Konsole (`F12`, Reiter „Console", rote Zeilen).

---

Stand: v3.38
