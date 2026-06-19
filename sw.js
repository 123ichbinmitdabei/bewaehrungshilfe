/*
 * sw.js, Service-Worker-PROTOTYP fuer den Bewaehrungshilfe-Assistenten (v3.39).
 *
 * ACHTUNG: Dieser Service Worker ist NICHT aktiv. Die Registrierung in index.html
 * ist nur auskommentiert. Aktivierung erfordert ausdrueckliche menschliche Freigabe.
 * Vor dem Scharfschalten unbedingt SW_PROPOSAL_v3.39.md lesen (Test-Plan + Kill-Switch).
 *
 * Strategie:
 *  - Network-First fuer index.html (Navigationsanfragen): immer zuerst das Netz
 *    versuchen, damit eine neue Version sofort durchkommt. Nur bei Offline aus dem
 *    Cache liefern. Das vermeidet das "alte Version haengt"-Problem.
 *  - Cache-Name traegt einen Versions-Hash: bei jedem Deploy MUSS CACHE_VERSION
 *    erhoeht werden, sonst wird der alte Cache nicht invalidiert.
 *  - activate-Handler loescht alle Caches, die nicht zur aktuellen Version gehoeren.
 *  - skipWaiting + clients.claim, damit ein Update ohne langes Warten greift. Das
 *    ist bewusst aggressiv gewaehlt, weil "schnelle Updates" hier wichtiger sind
 *    als "kein Reload waehrend der Nutzung" (Formular-App, kein Live-Stream-State).
 */

// WICHTIG: Bei jedem Deploy hochzaehlen / auf APP_VERSION setzen.
const CACHE_VERSION = "bh-v3.39";
const CACHE_NAME = "bewaehrungshilfe-" + CACHE_VERSION;

// Minimaler Pre-Cache: nur die Einstiegsseite. Die App ist single-file, daher
// reicht index.html. (Bewusst KEIN Aggressiv-Pre-Cache von allem.)
const PRECACHE_URLS = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  // skipWaiting: neue Version uebernimmt sofort, ohne auf Schliessen aller Tabs zu warten.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch((e) => {
      // Pre-Cache-Fehler darf die Installation nicht hart abbrechen.
      console.warn("[sw] Pre-Cache fehlgeschlagen:", e);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Alle fremden / alten Caches loeschen.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      // clients.claim: bereits offene Tabs sofort unter Kontrolle dieses SW bringen.
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Nur GET behandeln. Alles andere (z.B. POST) direkt ans Netz.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Nur same-origin behandeln. Externe Ressourcen (CDNs fuer OCR/PDF/docx) NICHT
  // cachen, damit keine veralteten Libs haengen bleiben.
  if (url.origin !== self.location.origin) return;

  const isNavigation =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    // NETWORK-FIRST fuer die HTML-Seite: neue Version kommt sofort durch.
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put("./index.html", fresh.clone());
          return fresh;
        } catch (e) {
          // Offline: aus dem Cache liefern.
          const cached = (await caches.match(req)) || (await caches.match("./index.html"));
          if (cached) return cached;
          throw e;
        }
      })()
    );
    return;
  }

  // Fuer sonstige same-origin GET-Requests: Cache-First mit Netz-Fallback.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

// Optionaler Kill-Switch-Hook: die Seite kann postMessage({type:"SW_UNREGISTER"})
// senden, dann deregistriert sich der SW selbst und loescht seine Caches.
// (Details und manuelle Anleitung in SW_PROPOSAL_v3.39.md.)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SW_UNREGISTER") {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        await self.registration.unregister();
      })()
    );
  }
});
