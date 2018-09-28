// chrome --disable-web-security --allow-file-access-from-files --unsafely-treat-insecure-origin-as-secure=http://localhost --user-data-dir=%TEMP%

const CACHE_NAME = 'cache_vampire';
// const CACHE_URL = [];

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
      caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
            function(response) {
              if(!response || response.status !== 200 || response.type !== 'basic' || !/\.(png|jpe?g|gif|svg|mp4)(\?.*)?$/.test(response.url)) {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
              return response;
            }
        ).catch(err => {
          console.warn(`[Warn] ↓ may be a chrome bug when devtools are open.`);
          console.error(err);
        });
      })
  );
});
