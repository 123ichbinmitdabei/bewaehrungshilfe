# Changelog v3.41

**Art:** Robustheits-Nachzug. Zwei gezielte GELB-Fixes, die das in v3.40 gebaute Dialog- und Reset-System absichern, BEVOR der Service Worker jemals aktiviert wird.
**Datum:** 2026-06-19
**Basis:** v3.40 (619 Smoke-Asserts)
**Ergebnis:** 677 Smoke-Asserts gruen (619 Basis plus 58 neu), `node check_js.js` OK.

Kein Eingriff in Storage-Schema, Backup-/Export-Format oder Auth. Beide Pakete fassen nur transienten UI-State bzw. den Netz-Cache an, niemals Nutzerdaten. SW-Registrierung bleibt auskommentiert.

---

## J1, Reset-Button auf eigene App begrenzt (GELB, getestet)

**Problem:** `resetAppCache()` löschte origin-weit: `caches.keys()` löschte ALLE Caches und `getRegistrations()` deregistrierte ALLE Service Worker auf `123ichbinmitdabei.github.io`. Diese Origin teilen sich mehrere Pages-Projekte; ein „Cache leeren“ in der Bewährungshilfe hätte fremde Apps treffen können.

**Fix:**
- Neue Prädikate `isOwnBhCache(name)` (Regex `^bh-cache-`, gleiches Muster wie `selectCachesToDelete` in `sw.js`) und `isOwnBhScope(scope)` (Scope enthält `/bewaehrungshilfe/`).
- `resetAppCache` löscht jetzt nur Caches mit `isOwnBhCache` und deregistriert nur Service Worker mit `isOwnBhScope`. Konservativ: unbekannter/leerer Scope wird NICHT deregistriert (lieber zu wenig als fremde Apps treffen).
- `localStorage` weiterhin bewusst unberührt, Defensiv-Verhalten (fehlende APIs überspringen, am Ende reload) unverändert.

Test: `smoke_v341_reset.js` (24 Asserts): eigener Cache gelöscht, fremder nicht; eigener SW deregistriert, fremder und scopeloser nicht; `localStorage` vor/nach identisch; defensiv ohne APIs kein Crash.

---

## J2, Modal-Nebenläufigkeit abgesichert (GELB, getestet)

**Problem:** Es gibt nur je einen Slot (`state.confirmModal`, `state.inputModal`). Öffnete ein zweiter Flow ein Modal während eines offen war (z.B. der zeitgesteuerte Notiz-Vorschlag), überschrieb er das erste stillschweigend.

**Fix: leichte FIFO-Warteschlange.**
- Transiente Modul-Variable `modalQueue` (nie nach `localStorage`).
- `confirmAction` und `inputModal` reihen die neue Anfrage ein, wenn bereits ein Modal aktiv ist, statt zu überschreiben.
- `showNextModal()` öffnet das nächste eingereihte Modal (FIFO) über denselben Pfad wie ein frischer Aufruf, aber nur wenn gerade keines offen ist.
- `showNextModal()` läuft am Ende von `runConfirmAction`, `closeConfirmModal`, `submitInputModal` und `closeInputModal`, nachdem der jeweilige Callback lief und der Slot geleert wurde.

**Invarianten erhalten:**
- Fail-safe: eingereihte Modals erfordern weiterhin eine ausdrückliche Antwort, nichts bestätigt sich selbst.
- `confirmAsync` unverändert: das Promise löst, wenn das Modal (auch verzögert aus der Queue) beantwortet wird.
- Kein destruktiver Pfad läuft ohne Bestätigung.

Test: `smoke_v341_modal.js` (34 Asserts): A bleibt aktiv und B wird eingereiht; Bestätigen/Abbrechen-Pfade; Misch-Variante confirm+input; FIFO-Reihenfolge bei drei eingereihten; Notiz-Vorschlag-Szenario (offenes Modal bleibt sichtbar); `confirmAsync` durch die Queue; Fail-safe kein Selbst-Bestätigen.

---

## Tests gesamt

| Suite | Asserts | Status |
|---|---|---|
| `smoke_v338_sync.js` | 105 | gruen |
| `smoke_v338_full.js` | 206 | gruen |
| `smoke_v339_funktion.js` | 149 | gruen |
| `smoke_v339_logik.js` | 25 | gruen |
| `smoke_v339_dialoge.js` | 40 | gruen |
| `smoke_v339_robust.js` | 40 | gruen |
| `smoke_v340_dialoge.js` | 31 | gruen |
| `smoke_v340_sw.js` | 23 | gruen |
| `smoke_v341_reset.js` | 24 | gruen |
| `smoke_v341_modal.js` | 34 | gruen |
| **Summe** | **677** | **gruen** |

`node check_js.js`: OK. 0 U+2014 in `index.html`, `sw.js` und allen v3.41-Reports.

## Hinweis: angepasster Bestandstest
- `smoke_v340_sw.js` (resetAppCache-Mock) wurde an das neue scope-begrenzte Verhalten angepasst (Service-Worker-Mocks tragen jetzt einen `/bewaehrungshilfe/`-Scope). Asserts unverändert grün.

## Bundle
- `index.html`: 823577 Bytes (~804 KB). Leichtes Wachstum durch Scope-Prädikate und Modal-Queue.

## Weiter deferred
Siehe `DEFERRED_v3.41.md`: SW-Aktivierung (gestaged, Runbook `SW_ACTIVATION_v3.40.md`), Speicher-Quota strukturell, Backup-Format-Versionierung, Touch-Targets.
