// Sajjad Academy PWA service worker
// Kept intentionally minimal so Firebase authentication and live data
// continue to work normally.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
