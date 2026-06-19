# Service-Worker-Aktivierung, Runbook v3.40

**Status:** Der Service Worker (`sw.js`) ist produktionsreif, aber NICHT aktiviert. Die Registrierung in `index.html` ist nur als Kommentarblock vorhanden. Dieses Runbook ist der exakte, menschlich durchzufuehrende Aktivierungsweg.

## Warum nicht autonom aktiviert

Ein Service Worker laesst sich in der CI/Sandbox NICHT real testen: es gibt keinen echten Browser, kein HTTPS, keinen Fetch-Lebenszyklus, keine PWA-Installation. Ein fehlerhafter SW kann Nutzer dauerhaft auf einer kaputten Version einsperren (er liefert die gecachte Seite auch nach einem Deploy). Deshalb wird die Aktivierung als getesteter menschlicher Schritt belassen. Was in v3.40 live geht: `sw.js` (nicht registriert), der In-App-Reset-Button, die Tests, diese Doku. Was NICHT live geht: die SW-Registrierung selbst.

## Was v3.40 schon mitbringt

- `sw.js` produktionsreif: Cache-Name leitet sich automatisch aus `?v=` ab (`bh-cache-<version>`), Network-First fuer HTML, `skipWaiting` + `clients.claim`, `activate` loescht nur eigene alte Caches (`bh-cache-*`), fremde Caches bleiben unberuehrt, alle Handler in try/catch, externe CDNs werden nie gecacht.
- In-App-Reset-Button (Einstellungen, „App zurücksetzen (Cache leeren)“): deregistriert alle Service Worker, loescht alle Caches, laedt neu. Faesst `localStorage` NIE an, Nutzerdaten bleiben erhalten. Funktioniert auch ohne aktiven SW (dann nur Reload).
- Reine SW-Logik (`deriveCacheName`, `selectCachesToDelete`) und `resetAppCache` sind durch `smoke_v340_sw.js` automatisiert getestet.

## Aktivierungs-Schritte (menschlich, in dieser Reihenfolge)

1. **Registrierung einkommentieren.** In `index.html` am Ende des Scripts den Block
   ```js
   if ("serviceWorker" in navigator) {
     window.addEventListener("load", () => {
       navigator.serviceWorker.register("./sw.js?v=" + APP_VERSION)
         .then((reg) => console.log("[sw] registriert:", reg.scope))
         .catch((err) => console.warn("[sw] Registrierung fehlgeschlagen:", err));
     });
   }
   ```
   aus dem Kommentar herausloesen. KEINE weitere Anpassung noetig (Cache-Name kommt aus `?v=` + `APP_VERSION`).

2. **5-Schritte-Real-Browser-Test** (Desktop UND iOS-PWA), wie in `SW_PROPOSAL_v3.39.md`:
   1. Deployen, Live-URL oeffnen, in DevTools (Application, Service Workers) pruefen: SW „activated and running“, Cache `bh-cache-<APP_VERSION>` existiert.
   2. Alte Version cachen lassen: Seite nutzen, schliessen, erneut oeffnen; offline schalten und pruefen, dass die App weiterhin laedt (Offline-Beweis).
   3. Neue Version deployen: sichtbare Mini-Aenderung plus `APP_VERSION` erhoehen, deployen.
   4. Update-Durchkommen pruefen: online, EINMAL neu laden. Erwartung: neue Version sichtbar (Network-First + skipWaiting/claim). Alter Cache geloescht, neuer vorhanden.
   5. Notfall-Deregistrierung testen (siehe Kill-Switch).

3. **In-App-Reset-Button im echten Browser testen.** Einstellungen, „Cache leeren und neu laden“. Erwartung: SW weg, Caches weg, Seite laedt frisch, alle Nutzerdaten (Eingaben, Belege, Kontakte) noch da.

4. **Erst nach gruenem Real-Browser-Test pushen.** Vorher nicht.

5. **Kill-Switch dokumentiert** (siehe unten).

## Kill-Switch (ausgelieferten SW wieder loswerden)

Drei Wege, vom bequemsten zum manuellsten:

1. **In-App-Reset-Button** (für Endnutzer): Einstellungen, „Cache leeren und neu laden“. Deregistriert SW und loescht Caches, ohne Nutzerdaten anzufassen.
2. **Leere `sw.js` ausliefern (serverseitiger Kill-Switch):** Eine `sw.js` deployen, deren `install`/`activate` nur noch alle Caches loescht und `self.registration.unregister()` aufruft. Da der alte SW Network-First fuer HTML faehrt, kommt die neue `index.html` (ohne Registrierung oder mit leerer sw.js) durch, der leere SW entfernt sich selbst. Beispiel-Inhalt:
   ```js
   self.addEventListener("install", () => self.skipWaiting());
   self.addEventListener("activate", (e) => e.waitUntil((async () => {
     const keys = await caches.keys();
     await Promise.all(keys.map((k) => caches.delete(k)));
     await self.registration.unregister();
   })()));
   ```
3. **PostMessage-Hook:** `sw.js` reagiert auf `postMessage({type:"SW_UNREGISTER"})` und deregistriert sich plus loescht Caches. Von der Seite: `navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage({type:"SW_UNREGISTER"})`.
4. **Manuell pro Geraet:** DevTools, Application, Service Workers, „Unregister“, dann „Cache Storage“ leeren, dann Hard-Reload. Auf Mobil: Browserdaten der Seite loeschen.

## Empfehlung

Aktivieren nur, wenn jemand den 5-Schritte-Test auf echten Geraeten begleiten kann und der leere Ersatz-SW (Kill-Switch Variante 2) als Notfall-Deploy bereitliegt. Bis dahin bleibt v3.40 ohne aktiven Service Worker; das bisherige Verhalten (neue Version nach Hard-Reload sofort sichtbar) bleibt der sichere Standard, und der In-App-Reset-Button hilft Nutzern bereits jetzt bei Cache-Problemen.
