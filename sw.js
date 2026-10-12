// HobbyMatch offline support: serve the app from cache, refresh it in the background.
const CACHE = 'hobbymatch-v4';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './fonts/fredoka-latin-500-normal.woff2',
  './fonts/fredoka-latin-600-normal.woff2',
  './fonts/nunito-sans-latin-400-normal.woff2',
  './fonts/nunito-sans-latin-700-normal.woff2',
  './fonts/nunito-sans-latin-800-normal.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request).then((cached) => {
        const fresh = fetch(e.request)
          .then((res) => { if (res && res.ok) cache.put(e.request, res.clone()); return res; })
          .catch(() => cached);
        return cached || fresh;
      })
    )
  );
});
