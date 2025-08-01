const CACHE_NAME = 'booking-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './admin.html',
  './css/style.css',
  './js/main.js',
  './js/admin.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
