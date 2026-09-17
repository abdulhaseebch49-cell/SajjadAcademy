const CACHE_NAME = "sajjad-academy-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const base = new URL("./", self.registration.scope);
      const shell = [
        new URL("./", base).href,
        new URL("./index.html", base).href,
        new URL("./manifest.json", base).href,
        new URL("./icons/icon-192.png", base).href,
        new URL("./icons/icon-512.png", base).href
      ];
      return cache.addAll(shell);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept Firebase, Google APIs, CDN resources, or other
  // cross-origin requests. This keeps authentication/live data working.
  if (url.origin !== self.location.origin) return;

  // For page navigation, prefer the live site so website updates appear
  // immediately; fall back to the cached page if the network is unavailable.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) =>
          cached || caches.match(new URL("./index.html", self.registration.scope).href)
        ))
    );
    return;
  }

  // Static same-origin assets: cache first, then network.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
