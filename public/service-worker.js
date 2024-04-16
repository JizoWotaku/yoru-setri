const CACHE_NAME = 'yoru-setri-cache-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    fetch('asset-manifest.json')
      .then(response => response.json())
      .then(assets => {
        const urlsToCache = [
          '/',
          '/favicon.ico',
          '/index.html',
          '/icons/192.png', 
          '/icons/512.png',
          assets['main.js']
        ];
        return caches.open(CACHE_NAME).then(cache => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
