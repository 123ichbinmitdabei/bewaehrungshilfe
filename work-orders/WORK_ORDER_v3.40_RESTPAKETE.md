# WORK ORDER v3.40 — Restpakete plus ausführlicher Test

**Projekt:** Bewährungshilfe-Assistent (Single-File PWA)
**Hauptdatei:** `index.html`
**Live:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/
**Repo:** https://github.com/123ichbinmitdabei/bewaehrungshilfe (Owner `123ichbinmitdabei`)
**Ausgangsstand:** v3.39, 565 Smoke-Asserts grün, Parse-Check OK, live deployed
**Zielversion:** v3.40
**Art:** Zwei Phasen. Phase 1 arbeitet die in `DEFERRED_v3.39.md` offen gebliebenen Punkte ab. Phase 2 ist ein ausführlicher Test (automatisiert plus manuelles Testprotokoll für echte Geräte).

Autonom über Nacht, kein menschlicher Ansprechpartner. Wo du normalerweise fragen würdest: nicht implementieren, in `DEFERRED_v3.40.md` dokumentieren, weiterarbeiten.

---

## 0. Sicherheits-Setup (zuerst, zwingend)

1. Branch `main`, working tree clean prüfen.
2. Rollback-Anker:
   ```bash
   git tag pre-v3.40-restpakete
   ```
3. Baseline-Gate (muss grün sein, sonst stoppen und in `DEFERRED_v3.40.md` vermerken):
   ```bash
   node check_js.js
   node smoke_v338_sync.js
   node smoke_v338_full.js
   for f in smoke_v339_*.js; do node "$f" | tail -1; done
   ```

---

## 1. Autonomie-Zonen (verbindlich, wie v3.39)

- **GRÜN, frei fixen:** eindeutige Fixes mit Test, toter Code (NULL Referenzen inkl. String-Kontext), Formatierung, Guards.
- **GELB, konservativ plus Tests:** Kontrollfluss (Dialog-Migration), Logik die State/Sync berührt. Vorher und nachher Voll-Gate.
- **ROT, NICHT ändern, nur dokumentieren:** Storage-Schema, Daten-Migration, Export-/Import-/Backup-Format, Auth, Krypto.

**Service Worker ist ein Sonderfall, siehe Paket H2:** vorbereiten ja, autonom live aktivieren nein.

---

## 2. Standing Constraints

- Single-File: App-Code nur in `index.html`. Ausnahme: `sw.js` (separate Datei, technisch zwingend für einen Service Worker, bereits in v3.39 als Prototyp angelegt).
- `node check_js.js` nach JEDEM JS-Edit.
- Keine em-dashes (U+2014) in deutschem Text, Kommas. Regressionstest in `smoke_v339_logik.js` prüft das für `index.html`, gilt auch für neue `.md`.
- Deutsche Anführungszeichen `„…“`, nie ASCII `"`.
- Keine personenbezogenen Daten im Quelltext.
- Branding unverändert.
- Kein force-push. Niemals.
- Commit-Message via `-F` (Datei ausserhalb des Repos).
- KEIN Eingriff in localStorage-Schema, Backup-Format oder Auth. Der SW-Cache fasst NUR Netz-Ressourcen an, niemals `localStorage`.

---

# PHASE 1, Restpakete

## Paket H0 — DEFERRED sichten

`DEFERRED_v3.39.md` vollständig lesen. Jeden Punkt einsortieren: in dieser Release erledigt (H1/H2), oder bewusst weiter deferred (mit aktualisiertem Grund in `DEFERRED_v3.40.md`). Kein Punkt darf unkommentiert verschwinden.

## Paket H1 — Verbliebene native Dialoge migrieren

In v3.39 blieben 13 native `confirm()` bewusst nativ, weil eine Migration das Sicherheits-Invariant hätte riskieren können. Jetzt sauber abarbeiten.

H1.1. Inventar: alle verbliebenen `confirm()`-Aufrufe (kommentar-bereinigt) mit umgebender Funktion auflisten.

H1.2. Je Aufrufort entscheiden:
- **Sicher migrierbar** (Folgelogik passt sauber in eine `onConfirm`-Closure, kein verschränkter Kontrollfluss): auf `confirmAction` umstellen, bei Eingabebedarf auf `inputModal`.
- **Nicht sicher migrierbar** (Folgelogik verschränkt, `await`-Ketten, Rückgabewert-abhängige Verzweigung, die sich nicht ohne Risiko in eine Closure heben lässt): nativ lassen, in `CROSS_BROWSER_REPORT_v3.40.md` mit Begründung dokumentieren.

H1.3. HARTES INVARIANT (unverändert): eine destruktive Aktion (Löschen, Zurücksetzen, Überschreiben) darf NIE ohne Bestätigung laufen. Im Zweifel nativ lassen. Fail-safe vor Vollständigkeit.

H1.4. Jede Migration braucht einen Smoke-Test: Bestätigen führt die Aktion aus, Abbrechen NICHT. Tests in `smoke_v340_dialoge.js`.

Ziel: so viele wie sicher möglich migriert, Invariant nie verletzt, Rest dokumentiert.

## Paket H2 — Service Worker produktionsreif, Aktivierung gestaged

Der SW kann in CC NICHT im echten Browser getestet werden (kein Browser, kein HTTPS, kein Fetch-Lebenszyklus in der Sandbox). Ein fehlerhafter SW kann Nutzer dauerhaft auf einer kaputten Version einsperren. Daher: fertig bauen, Recovery sicherstellen, Aktivierung als getesteten menschlichen Schritt belassen.

H2.1. `sw.js` produktionsreif machen:
- Cache-Name aus einem Versions-Parameter ableiten, NICHT hart kodiert pflegen müssen. Muster: Registrierung erfolgt über `register("./sw.js?v=" + APP_VERSION)`, und `sw.js` liest seine Version aus `new URL(self.location).searchParams.get("v")` und baut daraus den Cache-Namen (`bh-cache-<version>`). So erzeugt jeder Versionswechsel automatisch einen neuen Cache und einen „neuen“ SW, ohne manuelles Hochzählen.
- Navigationsanfragen (HTML): Network-First. Immer zuerst Netz, nur bei Offline aus dem Cache. So kann eine neue Version sofort durchkommen.
- `install`: nur das Nötigste vorcachen (`./`, `./index.html`). `skipWaiting()`.
- `activate`: alle Caches löschen, deren Name nicht dem aktuellen entspricht. `clients.claim()`.
- Robust gegen Fehler: jeder Handler in try/catch, im Zweifel ans Netz durchreichen.

H2.2. In-App-Notfall-Reset-Button (darf live, auch ohne aktiven SW harmlos):
- In den Einstellungen einen Button „App zurücksetzen (Cache leeren)“ ergänzen.
- Aktion: alle Service-Worker deregistrieren (`navigator.serviceWorker.getRegistrations()` → `unregister()`), alle Caches löschen (`caches.keys()` → `caches.delete()`), danach `location.reload(true)`.
- WICHTIG: `localStorage` NICHT anfassen. Der Button leert nur den Netz-Cache, niemals Nutzerdaten. Im Button-Text und in einer kurzen Erklärung klar sagen: „Deine Daten bleiben erhalten.“
- Defensiv: wenn `serviceWorker`/`caches` nicht verfügbar sind, Button trotzdem ohne Crash, einfach reload.
- Diesen Button als reine Funktion (`resetAppCache`) bauen, damit er per Smoke-Test gegen gemockte `navigator.serviceWorker`/`caches` testbar ist (bestätigt: unregister und cache-delete werden aufgerufen, localStorage unberührt).

H2.3. Registrierung NICHT autonom pushen:
- Den auskommentierten Registrierungsblock in `index.html` auf das `?v=` + `APP_VERSION`-Muster aktualisieren, ABER auskommentiert lassen.
- `SW_ACTIVATION_v3.40.md` schreiben: exakter Aktivierungs-Runbook.
  1. Lokal Registrierungsblock einkommentieren.
  2. In echtem Browser (Desktop plus iOS-PWA) nach dem 5-Schritte-Plan aus `SW_PROPOSAL_v3.39.md` testen: deployen, alte Version cachen, neue Version deployen, prüfen ob Update durchkommt, Notfall-Deregistrierung testen.
  3. Den In-App-Reset-Button im echten Browser testen.
  4. Erst nach grünem Real-Browser-Test pushen.
  5. Kill-Switch dokumentieren (wie man einen ausgelieferten SW wieder los wird, auch serverseitig über eine leere `sw.js`).
- Begründung im Runbook festhalten: warum nicht autonom aktiviert.

H2.4. Was in v3.40 live geht: `sw.js` (produktionsreif, aber nicht registriert), der Reset-Button, die Tests, die Doku. Was NICHT live geht: die SW-Registrierung selbst.

---

# PHASE 2, Ausführlicher Test

## Paket I1 — Regressionssuite erweitern (automatisiert)

- `smoke_v340_dialoge.js`: jede in H1 migrierte Dialog-Stelle (bestätigen führt aus, abbrechen nicht), plus Gegenprobe dass die bewusst nativ belassenen `confirm()` noch existieren und nicht versehentlich entfernt wurden.
- `smoke_v340_sw.js`: testbare reine Logik: Cache-Namen-Ableitung aus `?v=`-Parameter, `activate`-Cleanup-Logik (alte Cache-Namen werden zum Löschen ausgewählt, aktueller nicht), `resetAppCache` gegen gemockte `navigator.serviceWorker` und `caches` (unregister + cache-delete aufgerufen, `localStorage` unberührt).
- Gesamt-Asserts dürfen nicht sinken (Basis 565 plus neu).
- Voll-Gate grün.

## Paket I2 — Manuelles Testprotokoll (für echte Geräte)

`TESTPLAN_v3.40.md` als abhakbare Checkliste. CC kann diese Tests NICHT selbst ausführen (echter Browser, echte Geräte nötig), liefert aber das vollständige Protokoll. Abschnitte:

- **Geräte-Matrix:** iPhone (Safari PWA, installiert), Android (Chrome), Desktop (Chrome, Firefox, Safari falls vorhanden). Spalte pro Gerät zum Abhaken.
- **Pro Wizard (alle 10):** öffnen, je ein Text-, Zahl-, Datum-Feld ausfüllen, App neu laden (Hard-Reload), Werte noch da.
- **Alle Dialoge (migriert plus nativ verbliebene):** je einmal bestätigen, je einmal abbrechen, prüfen dass Abbrechen nichts tut. Liste konkret je Dialog.
- **Drucken (DER Validierungspunkt):** jeden Druckpfad (Brief, Formular/Dokument, EAR) auf jedem Gerät. Erwartung: keine leere Seite, Druckvorschau erscheint.
- **Backup:** Daten exportieren, in frischem Profil/privatem Fenster importieren, stichprobenartig Identität prüfen.
- **Sync (altes Symptom):** Stammdaten ändern, Adressbuch prüft durch, Desktop UND Mobile.
- **Eingabe-Validierung:** IBAN/Datum/Betrag falsch eingeben, dezenter Hinweis erscheint, Eingabe wird NICHT blockiert, Wert NICHT verändert.
- **SW-Aktivierung (nur falls durchgeführt):** 5-Schritte-Plan aus `SW_ACTIVATION_v3.40.md`, plus Reset-Button-Test, plus Offline-Test (App ohne Netz öffnen).

Format: Markdown-Checkboxen, je Schritt erwartetes Ergebnis und Spalte für Befund.

## Paket I3 — Release v3.40

- `node check_js.js` plus alle Smoke-Suites grün (565 plus neu).
- Personendaten-Audit erneut: `PERSONENDATEN_AUDIT_v3.40.md`.
- Em-dash-Scan: 0 U+2014 in `index.html` und in allen neuen `.md` (archivierte `work-orders/` ausgenommen).
- `APP_VERSION = "v3.40"`, README-Footer v3.40.
- `CHANGELOG_v3.40.md`, `PUBLISH.md` aktualisieren (getrennt nach erledigt / gestaged / weiter deferred).
- `DEFERRED_v3.40.md`: SW-Aktivierung (gestaged, Runbook verweisen), eventuell weiter offene Punkte.
- Commit (Message via `-F`), `git push origin main`, NUR bei grünem Gate, KEIN force-push.
- **Die SW-Registrierung bleibt auskommentiert, wird NICHT mitgepusht-aktiviert.**

---

## Voll-Gate (nach jedem Paket)

```bash
node check_js.js && \
node smoke_v338_sync.js | tail -1 && \
node smoke_v338_full.js | tail -1 && \
for f in smoke_v339_*.js smoke_v340_*.js; do echo "== $f =="; node "$f" | tail -1; done
```
Grün, dann weiter. Rot, dann fixen bis grün. Lässt sich ein Paket nicht grün bekommen: betroffene Änderungen mit `git checkout -- <datei>` zurücksetzen, als deferred dokumentieren, weiter.

---

## Akzeptanzkriterien

- [ ] `git tag pre-v3.40-restpakete` gesetzt
- [ ] `DEFERRED_v3.39.md` Punkte alle eingeordnet
- [ ] H1: migrierbare Dialoge migriert plus getestet, nicht migrierbare dokumentiert, Invariant nie verletzt
- [ ] H2: `sw.js` produktionsreif (Cache-Name aus `?v=`), Reset-Button live-fähig plus getestet, Registrierung NICHT aktiviert, `SW_ACTIVATION_v3.40.md` mit Runbook plus Kill-Switch
- [ ] I1: `smoke_v340_dialoge.js`, `smoke_v340_sw.js`, Gesamt-Asserts nicht gesunken
- [ ] I2: `TESTPLAN_v3.40.md` als abhakbare Geräte-Checkliste
- [ ] I3: `PERSONENDATEN_AUDIT_v3.40.md`, `CHANGELOG_v3.40.md`, `PUBLISH.md`, `DEFERRED_v3.40.md`
- [ ] `APP_VERSION = "v3.40"`, README-Footer v3.40
- [ ] 0 U+2014 in Deliverables
- [ ] kein Storage-/Backup-/Auth-Eingriff
- [ ] Push nur bei grünem Gate, kein force-push, SW-Registrierung bleibt auskommentiert

---

## Was bei Problemen

- Parse/Test-Fail: fixen, neu testen, nicht skippen.
- Unklarheit oder ROT-Zone: dokumentieren, nicht raten.
- SW droht etwas anderes als reinen Netz-Cache zu berühren: Finger weg.
- Alles droht schiefzulaufen: `git reset --hard pre-v3.40-restpakete`, Lage in `DEFERRED_v3.40.md`, nicht pushen.

---

## Reihenfolge

0 (Setup) → H0 → H1 → H2 → I1 → I2 → I3. Nach jedem Paket Voll-Gate.

Los.
