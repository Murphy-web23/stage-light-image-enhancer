// Kills a previously installed service worker (from an earlier hand-written
// frontend) that was caching app-shell files this app no longer ships. Any
// browser that already registered the old cache-first worker will pick this
// file up on its next update check and self-destruct instead of continuing
// to serve stale, now-deleted assets.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then((clients) => clients.forEach((client) => client.navigate(client.url)))
  );
});
