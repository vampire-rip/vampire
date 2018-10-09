// chrome --disable-web-security --allow-file-access-from-files --unsafely-treat-insecure-origin-as-secure=http://localhost --user-data-dir=%TEMP%

const CACHE_NAME = 'cache_vampire';
// const CACHE_URL = [];

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  let cache;
  event.waitUntil(
      self.clients.claim().then(() =>
          caches.open(CACHE_NAME),
      ).then(c => {
        cache = c;
        return fetch('/');
      }).then(response => {
        cache.put('/', response);
        return fetch('/entry.js');
      }).then(response =>
          cache.put('/entry.js', response),
      ).catch(console.error).then(() => {
        console.log('inited');
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
            function(response) {
              if (!response || response.status !== 200 || response.type !==
                  'basic' || (!/\.(png|jpe?g|gif|svg|mp4|js|css)(\?.*)?$/.test(
                      response.url))) {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache =>
                  cache.keys().then(entries => {
                    const regex = /^(.+\/.+?\.).{7}\.(.{1,4})/;
                    const key = regex.exec(event.request.url);
                    if (key)
                      for (let i of entries) {
                        const target = regex.exec(i.url);
                        if (!target) continue;
                        if ((key[2] === target[2]) && (key[1] === target[1])) {
                          cache.delete(i).
                              then(() => console.log('deleted', i.url));
                        }
                      }
                    return cache;
                  }),
              ).then(cache =>
                  cache.put(event.request, responseToCache),
              );
              return response;
            },
        ).catch(err => {
          console.warn(`[Warn] ↓ may be a chrome bug when devtools are open.`);
          console.error(err);
        });
      }),
  );
});
