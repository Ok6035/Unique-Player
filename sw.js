const CACHE_NAME = 'media-cache-v1';
const assetsToCache = [
  '/',
  '/index.html'
  // Additional assets (CSS, JS, images) can be added here.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching assets');
        return cache.addAll(assetsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => {
      if (key !== CACHE_NAME) {
        console.log('Deleting old cache:', key);
        return caches.delete(key);
      }
    })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Serve media file requests from cache first.
  if (event.request.url.includes('/media/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) return response;
          return fetch(event.request).then(networkRes => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkRes.clone());
              return networkRes;
            });
          });
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
