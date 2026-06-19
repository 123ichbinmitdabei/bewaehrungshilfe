# WORK ORDER v3.41 — Reset-Button-Scope plus Modal-Nebenläufigkeit

**Projekt:** Bewährungshilfe-Assistent (Single-File PWA)
**Hauptdatei:** `index.html` (plus `sw.js`, nicht aktiviert)
**Live:** https://123ichbinmitdabei.github.io/bewaehrungshilfe/
**Repo:** https://github.com/123ichbinmitdabei/bewaehrungshilfe (Owner `123ichbinmitdabei`)
**Ausgangsstand:** v3.40, 619 Smoke-Asserts grün, Parse-Check OK, live deployed. SW gebaut aber NICHT registriert.
**Zielversion:** v3.41
**Art:** Robustheits-Nachzug. Zwei gezielte Fixes, die das in v3.40 gebaute Dialog- und Reset-System absichern, BEVOR der Service Worker jemals aktiviert wird.

Autonom über Nacht, kein menschlicher Ansprechpartner. Wo du fragen würdest: nicht implementieren, in `DEFERRED_v3.41.md` dokumentieren, weiter.

---

## 0. Sicherheits-Setup (zuerst, zwingend)

1. Branch `main`, working tree clean prüfen.
2. Rollback-Anker:
   ```bash
   git tag pre-v3.41-robustheit
   ```
3. Baseline-Gate (muss grün sein, sonst stoppen und in `DEFERRED_v3.41.md` vermerken):
   ```bash
   node check_js.js
   node smoke_v338_sync.js
   node smoke_v338_full.js
   for f in smoke_v339_*.js smoke_v340_*.js; do node "$f" | tail -1; done
   ```

---

## 1. Autonomie-Zonen (wie gehabt)

- **GRÜN:** eindeutige Fixes mit Test, Formatierung, Guards.
- **GELB:** Logik die UI-State/Kontrollfluss berührt (beide Pakete hier sind GELB), konservativ, vor und nach jeder Änderung Voll-Gate.
- **ROT, nur dokumentieren:** Storage-Schema, Daten-Migration, Export-/Backup-Format, Auth, Krypto, SW-Aktivierung.

## 2. Constraints

- Single-File: App-Code nur in `index.html` (`sw.js` separat, bleibt unregistriert).
- `node check_js.js` nach JEDEM JS-Edit.
- Keine em-dashes (U+2014), Kommas. Deutsche Anführungszeichen `„…“`.
- Keine personenbezogenen Daten im Quelltext.
- Branding unverändert. Kein force-push. Commit via `-F`.
- KEIN Eingriff in localStorage-Schema, Backup-Format oder Auth. Beide Pakete fassen nur transienten UI-State bzw. den Netz-Cache an, NIEMALS Nutzerdaten.

---

## Paket J1 — Reset-Button auf eigene App begrenzen

**Problem:** `resetAppCache()` löscht aktuell origin-weit: `caches.keys()` löscht ALLE Caches, `navigator.serviceWorker.getRegistrations()` deregistriert ALLE Service Worker auf `123ichbinmitdabei.github.io`. Diese Origin teilen sich mehrere Pages-Projekte (z.B. terp-sessions, proxalto-eu). Ein Klick auf „Cache leeren“ in der Bewährungshilfe könnte fremde SWs und Caches anderer Apps mit wegräumen. Der SW-eigene `activate`-Cleanup ist bereits korrekt auf `bh-cache-*` begrenzt (`selectCachesToDelete`), der Reset-Button nutzt diesen Filter aber nicht.

**Fix:**

J1.1. In `index.html` ein gemeinsames Prädikat einführen (oder das aus `sw.js` gespiegelte Muster nutzen): `isOwnBhCache(name)` gibt true zurück, wenn `name` mit `bh-cache-` beginnt.

J1.2. In `resetAppCache()`:
- Caches: nur löschen, wenn `isOwnBhCache(name)`. Fremde Caches NICHT anfassen.
- Service Worker: nur deregistrieren, wenn `reg.scope` den Pfad `/bewaehrungshilfe/` enthält. Konservativ: wenn der Scope nicht ermittelbar ist, NICHT deregistrieren (lieber zu wenig als fremde Apps treffen).
- `localStorage` weiterhin BEWUSST unberührt.
- Defensiv wie bisher (fehlende APIs überspringen, am Ende reload).

J1.3. Falls `sw.js` eine Hilfsfunktion exportiert, die hier sinnvoll wiederverwendbar ist, gerne wiederverwenden, sonst die Prädikate in `index.html` und `sw.js` identisch halten (gleiche Regex `^bh-cache-`).

J1.4. Smoke-Test (`smoke_v341_reset.js`):
- Mock `caches` mit `bh-cache-v3.41` UND `fremd-cache-x`. Nach `resetAppCache()`: `bh-cache-v3.41` gelöscht, `fremd-cache-x` NICHT gelöscht.
- Mock `navigator.serviceWorker.getRegistrations()` mit zwei Registrations, Scope `.../bewaehrungshilfe/` und `.../terp-sessions/`. Nach Reset: nur die Bewährungshilfe-Registration deregistriert.
- `localStorage` vor und nach dem Reset identisch (unberührt).

---

## Paket J2 — Modal-Nebenläufigkeit absichern

**Problem:** Es gibt nur einen State-Slot je Modal-Typ (`state.confirmModal`, `state.inputModal`). Öffnet ein zweiter Flow ein Modal, während eines offen ist, überschreibt er das erste stillschweigend. Realistischer Auslöser: der zeitgesteuerte Notiz-Vorschlag (`setTimeout` in der Termin-Logik) poppt auf, während der Nutzer gerade ein anderes Modal offen hat. Folge ist zwar fail-safe (die erste Aktion läuft dann nicht), aber das erste Modal verschwindet ohne Vorwarnung.

**Fix: leichte FIFO-Warteschlange für Modals.**

J2.1. Eine transiente Modul-Variable `let modalQueue = []` (NICHT in den persistierten State, niemals nach `localStorage`).

J2.2. `confirmAction(opts)` und `inputModal(message, opts)`:
- Wenn bereits ein Modal aktiv ist (`state.confirmModal` ODER `state.inputModal` gesetzt): die neue Anfrage als `{ kind: "confirm"|"input", args }` in `modalQueue` einreihen und zurückkehren, NICHT überschreiben.
- Sonst wie bisher das Modal setzen und rendern.

J2.3. Eine Funktion `showNextModal()`: nimmt das nächste Element aus `modalQueue` (FIFO) und öffnet es über denselben Pfad wie ein frischer Aufruf. Wenn die Queue leer ist, nichts tun.

J2.4. `showNextModal()` am Ende von `runConfirmAction()`, `closeConfirmModal()`, `submitInputModal()` und `closeInputModal()` aufrufen, NACHDEM der jeweilige Callback (`onConfirm`/`onCancel`/`onOk`) gelaufen ist und der aktive Slot geleert wurde. Auf saubere Reihenfolge achten, keine Doppel-Renders, keine Rekursion die sich selbst aufhängt.

J2.5. Invarianten, die erhalten bleiben MÜSSEN:
- Fail-safe: eingereihte Modals erfordern weiterhin eine ausdrückliche Antwort, nichts bestätigt sich selbst.
- `confirmAsync` funktioniert unverändert: das Promise löst, wenn das Modal (auch verzögert aus der Queue) beantwortet wird.
- Kein destruktiver Pfad läuft ohne Bestätigung.

J2.6. Smoke-Test (`smoke_v341_modal.js`):
- Confirm A öffnen, dann Confirm B aufrufen: A bleibt aktiv, B steht in der Queue (Länge 1). A beantworten (bestätigen): A.onConfirm lief, danach ist B aktiv, Queue leer. B beantworten: B.onConfirm lief.
- Abbrechen-Variante: A öffnen, B einreihen, A abbrechen: A.onCancel lief, A.onConfirm NICHT, danach B aktiv.
- Misch-Variante: Confirm offen, `inputModal` aufrufen während offen: Input wird eingereiht, erscheint erst nach Schließen des Confirm.
- FIFO bei drei eingereihten Modals: Reihenfolge stimmt.
- Notiz-Vorschlag-Szenario: ein Modal ist offen, der zeitgesteuerte Vorschlag wird ausgelöst, das offene Modal bleibt sichtbar (wird nicht überschrieben).

---

## Paket K — Test plus Release

K1. Voll-Gate grün inkl. der neuen `smoke_v341_*.js`. Gesamt-Asserts nicht gesunken (Basis 619 plus neu).

K2. `TESTPLAN_v3.40.md` um zwei manuelle Prüfpunkte ergänzen (oder kurzer Nachtrag `TESTPLAN_v3.41_NACHTRAG.md`):
- Reset-Button („Cache leeren“) lädt neu, Nutzerdaten bleiben erhalten, und (falls später ein zweites Pages-Projekt einen SW hat) fremde Apps bleiben unberührt.
- Zwei Modals nacheinander: wenn während eines offenen Dialogs ein zweiter ausgelöst wird, verschwindet der erste nicht, der zweite kommt danach.

K3. Personendaten-Audit erneut (`PERSONENDATEN_AUDIT_v3.41.md`), em-dash-Scan 0 U+2014 in `index.html`, `sw.js` und neuen `.md`.

K4. `APP_VERSION = "v3.41"`, README-Footer v3.41.

K5. `CHANGELOG_v3.41.md`, `PUBLISH.md` aktualisieren. `DEFERRED_v3.41.md` (SW-Aktivierung bleibt gestaged, Verweis auf `SW_ACTIVATION_v3.40.md`).

K6. Work Order nach `work-orders/` archivieren (Konvention).

K7. Commit (Message via `-F`), `git push origin main`, NUR bei grünem Gate, KEIN force-push. **SW-Registrierung bleibt auskommentiert.**

---

## Voll-Gate (nach jedem Paket)

```bash
node check_js.js && \
node smoke_v338_sync.js | tail -1 && \
node smoke_v338_full.js | tail -1 && \
for f in smoke_v339_*.js smoke_v340_*.js smoke_v341_*.js; do echo "== $f =="; node "$f" | tail -1; done
```
Grün, dann weiter. Rot, dann fixen bis grün. Lässt sich ein Paket nicht grün bekommen: betroffene Änderungen mit `git checkout -- <datei>` zurücksetzen, als deferred dokumentieren, weiter.

---

## Akzeptanzkriterien

- [ ] `git tag pre-v3.41-robustheit` gesetzt
- [ ] J1: `resetAppCache` löscht nur `bh-cache-*` und deregistriert nur SWs mit Scope `/bewaehrungshilfe/`, `localStorage` unberührt, Test grün
- [ ] J2: Modal-FIFO-Queue, kein stilles Überschreiben, Fail-safe und `confirmAsync` intakt, Test grün
- [ ] `smoke_v341_reset.js`, `smoke_v341_modal.js`, Gesamt-Asserts nicht gesunken
- [ ] Manuelle Prüfpunkte ergänzt
- [ ] `PERSONENDATEN_AUDIT_v3.41.md`, `CHANGELOG_v3.41.md`, `PUBLISH.md`, `DEFERRED_v3.41.md`
- [ ] `APP_VERSION = "v3.41"`, README-Footer v3.41, 0 U+2014 in Deliverables
- [ ] kein Storage-/Backup-/Auth-Eingriff, SW-Registrierung bleibt auskommentiert
- [ ] Push nur bei grünem Gate, kein force-push

---

## Was bei Problemen

- Parse/Test-Fail: fixen, neu testen, nicht skippen.
- Modal-Queue verhakt sich oder verursacht Doppel-Render: lieber einfacher halten (z.B. nur ein Slot plus Queue, kein Stack), im Zweifel die Queue konservativ statt clever.
- Unklarheit oder ROT-Zone: dokumentieren, nicht raten.
- Alles droht schiefzulaufen: `git reset --hard pre-v3.41-robustheit`, Lage in `DEFERRED_v3.41.md`, nicht pushen.

---

## Reihenfolge

0 (Setup) → J1 → J2 → K (Test/Release). Nach jedem Paket Voll-Gate.

Los.
