/*
 * sw.js, Service Worker fuer den Bewaehrungshilfe-Assistenten (produktionsreif, v3.40).
 *
 * ACHTUNG: Dieser Service Worker ist NICHT aktiv. Die Registrierung in index.html
 * ist nur auskommentiert. Aktivierung erfordert ausdrueckliche menschliche Freigabe
 * nach dem Runbook in SW_ACTIVATION_v3.40.md (Real-Browser-Test plus Kill-Switch).
 *
 * Strategie:
 *  - Cache-Name wird aus dem ?v=-Parameter der eigenen URL abgeleitet
 *    (Registrierung: register("./sw.js?v=" + APP_VERSION)). Jeder Versionswechsel
 *    erzeugt automatisch einen neuen Cache-Namen und damit einen "neuen" SW, ohne
 *    dass hier eine Konstante manuell hochgezaehlt werden muss.
 *  - Navigationsanfragen (HTML): Network-First. Immer zuerst Netz, nur bei Offline
 *    aus dem Cache. So kommt eine neue Version sofort durch.
 *  - install: nur ./ und ./index.html vorcachen, skipWaiting().
 *  - activate: alle bh-cache-* Caches ausser dem aktuellen loeschen, clients.claim().
 *  - Robust: jeder Handler in try/catch, im Zweifel ans Netz durchreichen.
 *  - Der SW fasst NUR Netz-Ressourcen an, NIEMALS localStorage (Nutzerdaten).
 */

// ── Reine, testbare Logik (auch in Node via require nutzbar) ────────────────
function deriveCacheName(locationHref) {
  try {
    const v = new URL(locationHref).searchParams.get("v");
    return "bh-cache-" + (v && v.trim() ? v.trim() : "dev");
  } catch (e) {
    return "bh-cache-dev";
  }
}
// Waehlt aus allen vorhandenen Cache-Namen die zu loeschenden aus: alle eigenen
// (bh-cache-*) ausser dem aktuellen. Fremde Caches werden nicht angefasst.
function selectCachesToDelete(allCacheNames, currentCacheName) {
  return (allCacheNames || []).filter(function (n) {
    return n !== currentCacheName && /^bh-cache-/.test(n);
  });
}

// ── Service-Worker-Laufzeit (nur im echten SW-Kontext) ──────────────────────
if (typeof self !== "undefined" && self.addEventListener && typeof caches !== "undefined") {
  const CACHE_NAME = deriveCacheName(self.location.href);
  const PRECACHE_URLS = ["./", "./index.html"];

  self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(PRECACHE_URLS))
        .catch((e) => { console.warn("[sw] Pre-Cache fehlgeschlagen:", e); })
    );
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(selectCachesToDelete(keys, CACHE_NAME).map((k) => caches.delete(k)));
        await self.clients.claim();
      } catch (e) {
        console.warn("[sw] activate-Cleanup fehlgeschlagen:", e);
      }
    })());
  });

  self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return; // nur GET cachen

    let url;
    try { url = new URL(req.url); } catch (e) { return; }
    if (url.origin !== self.location.origin) return; // externe CDNs nie cachen

    const isNavigation =
      req.mode === "navigate" ||
      (req.headers.get("accept") || "").includes("text/html");

    if (isNavigation) {
      // NETWORK-FIRST fuer HTML: neue Version kommt sofort durch.
      event.respondWith((async () => {
        try {
          const fresh = await fetch(req);
          try {
            const cache = await caches.open(CACHE_NAME);
            cache.put("./index.html", fresh.clone());
          } catch (e) { /* Cache-Put-Fehler ignorieren, Antwort steht */ }
          return fresh;
        } catch (e) {
          const cached = (await caches.match(req)) || (await caches.match("./index.html"));
          if (cached) return cached;
          throw e;
        }
      })());
      return;
    }

    // sonstige same-origin GET: Cache-First mit Netz-Fallback.
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req)).catch(() => fetch(req))
    );
  });

  // Kill-Switch-Hook: Seite kann postMessage({type:"SW_UNREGISTER"}) senden.
  self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SW_UNREGISTER") {
      event.waitUntil((async () => {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
          await self.registration.unregister();
        } catch (e) { console.warn("[sw] Selbst-Deregistrierung fehlgeschlagen:", e); }
      })());
    }
  });
}

// ── Export fuer Node-Tests (kein Effekt im SW-Kontext) ──────────────────────
if (typeof module !== "undefined" && module.exports) {
  module.exports = { deriveCacheName, selectCachesToDelete };
}
