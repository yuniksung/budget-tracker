const STATIC_CACHE = "static-cache-v1";
const DATA_CACHE = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/dist/index.bundle.js",
  "/assets/css/styles.css",
  "/dist/auto/icon_96x96.png",
  "/dist/auto/icon_128x128.png",
  "/dist/auto/icon_192x192.png",
  "/dist/auto/icon_256x256.png",
  "/dist/auto/icon_384x384.png",
  "/dist/auto/icon_512x512.png",
  "/dist/manifest.json",
];

// install service worker:
// 1. cache static files
// 2. cache data data
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
