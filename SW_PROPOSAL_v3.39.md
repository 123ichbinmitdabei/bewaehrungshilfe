# Service-Worker-Vorschlag v3.39 (Prototyp, NICHT aktiviert)

**Status:** Prototyp `sw.js` liegt im Repo. Registrierung in `index.html` ist nur als auskommentierter Block vorhanden. Der Service Worker ist NICHT aktiv.

**Aktivierung erfordert ausdrueckliche menschliche Freigabe.** Dieser Vorschlag beschreibt, wie und warum, mit Risiken, Test-Plan und Kill-Switch.

---

## Hintergrund

Das gemeldete Desktop-Symptom "alte Version haengt" (Adressbuch-Sync/Drucken griffen am PC nicht) ist ein Cache-Symptom: der Browser laedt eine veraltete `index.html`. Ein Service Worker mit Versions-Hash und Network-First-Strategie wuerde das sauber loesen und zusaetzlich echtes Offline ermoeglichen.

## Warum NICHT automatisch ueber Nacht aktiviert

- Ein fehlerhafter Service Worker kann Nutzer **dauerhaft** auf einer kaputten Version einsperren (der SW liefert dann die kaputte gecachte Seite, auch nach Deploy).
- Das ist ohne Live-Kontrolle auf echten Geraeten nicht vertretbar, gerade weil reale, sensible Nutzerdaten im Spiel sind.
- Ein SW muss eine eigene Datei sein, das bricht die Single-File-Idee (akzeptabel, aber bewusst zu entscheiden).

## Was der Prototyp `sw.js` macht

- **Network-First fuer `index.html`** (Navigationsanfragen): immer zuerst Netz, nur bei Offline aus Cache. So kommt eine neue Version sofort durch.
- **Cache-Name mit Versions-Hash** (`CACHE_VERSION = "bh-v3.39"`): bei jedem Deploy hochzuziehen, sonst wird der alte Cache nicht invalidiert.
- **`activate`-Handler** loescht alle Caches, die nicht zur aktuellen Version gehoeren.
- **`skipWaiting` + `clients.claim`**: Update greift schnell, ohne dass alle Tabs geschlossen werden muessen. Bewusst aggressiv, weil schnelle Updates hier wichtiger sind als ein ungestoerter Reload (reine Formular-App).
- **Nur same-origin GET** wird behandelt. Externe CDNs (OCR/PDF/docx) werden NICHT gecacht, damit keine veralteten Libs haengen bleiben.
- **Kill-Switch-Hook**: auf `postMessage({type:"SW_UNREGISTER"})` deregistriert sich der SW und loescht seine Caches.

## skipWaiting / clients.claim Strategie (dokumentiert)

- `skipWaiting()` im `install`: die neue SW-Version wartet nicht, bis alle alten Tabs zu sind, sondern wird sofort "waiting -> active".
- `clients.claim()` im `activate`: bereits offene Tabs kommen sofort unter Kontrolle des neuen SW.
- Folge: Nach einem Deploy plus einem Reload ist garantiert die neue Version aktiv. Trade-off: theoretisch kann ein gerade offener Tab mitten in der Sitzung den neuen SW bekommen. Fuer diese App unkritisch (kein langlebiger In-Memory-Server-State; alles in localStorage).

## Aktivierung (Schritt fuer Schritt)

1. In `index.html` den auskommentierten Registrierungsblock am Ende des Scripts einkommentieren.
2. Sicherstellen, dass `CACHE_VERSION` in `sw.js` bei JEDEM Deploy auf die `APP_VERSION` gezogen wird (z.B. `bh-v3.40`).
3. `sw.js` muss im selben Verzeichnis wie `index.html` liegen (GitHub Pages: Repo-Root), Scope `./`.
4. Deployen, dann Test-Plan (unten) auf echten Geraeten durchlaufen.

## Test-Plan (5 Schritte, zwingend vor Breitenfreigabe)

1. **Deployen** mit aktivierter Registrierung und passender `CACHE_VERSION`. Live-URL oeffnen, in DevTools (Application -> Service Workers) pruefen, dass der SW "activated and running" ist.
2. **Alte Version cachen lassen:** Seite normal nutzen, App schliessen, erneut oeffnen (laedt jetzt potenziell aus SW-Cache). Offline schalten und pruefen, dass die App weiterhin laedt (Offline-Beweis).
3. **Neue Version deployen:** eine sichtbare Mini-Aenderung machen (z.B. Footer-Version), `CACHE_VERSION` erhoehen, deployen.
4. **Update-Durchkommen pruefen:** online, Seite EINMAL neu laden. Erwartung: neue Version sichtbar (Network-First plus skipWaiting/claim). In DevTools alten Cache geloescht, neuer Cache vorhanden.
5. **Notfall-Deregistrierung pruefen:** in der Konsole `navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))` ausfuehren, Caches leeren, Seite laedt wieder rein vom Netz.

Erst wenn alle 5 Schritte auf iOS Safari (PWA), Chrome Android und Desktop gruen sind, fuer alle Nutzer freigeben.

## Kill-Switch (einen ausgelieferten SW wieder loswerden)

Falls ein fehlerhafter SW ausgeliefert wurde, gibt es drei Wege:

1. **Selbst-Deregistrierung per Deploy (empfohlen):** Eine neue `sw.js` ausliefern, deren `install`/`activate` nur noch `self.registration.unregister()` und das Loeschen aller Caches macht (ein "leerer" SW). Da der alte SW Network-First fuer die HTML faehrt, kommt die neue `index.html` durch, registriert den leeren SW, der sich selbst entfernt. Danach ist die Seite wieder SW-frei.
2. **Kill-Switch-Nachricht:** Von der Seite `navigator.serviceWorker.controller.postMessage({type:"SW_UNREGISTER"})` senden (der Prototyp behandelt das bereits). Eignet sich, wenn die Seite noch laedt.
3. **Manuell pro Geraet (Endnutzer-Anleitung):** Browser -> DevTools (`F12`) -> Application/Anwendung -> Service Workers -> "Unregister", dann Caches unter "Cache Storage" loeschen, dann Hard-Reload. Auf Mobil: Browserdaten der Seite loeschen.

## Empfehlung

Erst aktivieren, wenn jemand den 5-Schritte-Test auf echten Geraeten begleiten kann und die Kill-Switch-Variante 1 (leerer Ersatz-SW) als Notfall-Deploy bereitliegt. Bis dahin bleibt v3.39 ohne aktiven Service Worker; das v3.38/v3.39-Verhalten (neue Version nach Hard-Reload sofort sichtbar) bleibt der sichere Standard.
