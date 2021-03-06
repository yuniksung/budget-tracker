const CACHE_NAME = 'my-site-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v2';

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/manifest.json',
    '/js/idb.js',
    '/js/index.js',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-144x144.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];


// Install the service worker
self.addEventListener("install", function (event) {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.addAll(FILES_TO_CACHE);
      }),
      caches.open(DATA_CACHE).then(function (cache) {
        return cache.add("/api/transaction");
      }),
    ])
  );

  self.skipWaiting();
});

// clear out old caches in the activate stage
self.addEventListener("activate", function (event) {
  const allowedCaches = [STATIC_CACHE, DATA_CACHE];

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (!allowedCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// fetch event listener:
// GET /api/transaction - return cached data on fail
// any other fetch - return any matching static cache or necessary response
self.addEventListener("fetch", function (event) {
  if (
    event.request.method === "GET" &&
    event.request.url.includes("/api/transaction")
  ) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
              return response;
            }
          })
          .catch(err => {
            return cache.match(event.request).then(response => {
              return response;
            });
          });
      })
    );

    return;
  }

  event.respondWith(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request);
      });
    })
  );
});
