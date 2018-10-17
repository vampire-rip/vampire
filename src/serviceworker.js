// chrome --disable-web-security --allow-file-access-from-files --unsafely-treat-insecure-origin-as-secure=http://localhost --user-data-dir=%TEMP%

const CACHE_NAME = 'cache_vampire';
// const CACHE_URL = [];

const postMessageToClient = (clientId, message) =>
    Promise.resolve().then(() =>
        clients.get(clientId)
    ).then(client =>
        client.postMessage(message)
    );

self.addEventListener('install', function(event) {
  console.log('serviceWorker installed.');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  console.log('serviceWorker activated.');
  event.waitUntil(
      self.clients.claim(),
  );
});

self.addEventListener('fetch', function(event) {
  const {clientId} = event;
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }
  event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
            function(response) {
              if(!response.ok && response.type !== 'opaque') {
                console.log('error:', response);
                postMessageToClient(clientId, {error: response.status});
              }
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
                              then(() => console.log('deleted previous cache', i.url));
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
          postMessageToClient(clientId, {error: 'ERR_CONNECTION_FAILED'});
        });
      }),
  );
});

const handleCache = (path, cache) =>
    Promise.resolve().then(() =>
        fetch(path),
    ).then(response => {
      if(!response.ok) return false;
      let newText;
      let clone = response.clone();
      return clone.text().then(text => {
        newText = text;
        return cache.match(path).
            then(response => response.text()).
            catch(() => undefined);
      }).then(oldText => {
        if (oldText !== newText) {
          cache.put(path, response);
          return oldText !== undefined;
        }
        return false;
      });
    }).catch(() =>
        false
    );

self.addEventListener('message', message => {
  let cache;
  let hasUpdate = false;
  const clientId = message.source.id;
  if (message.data.ready) {
    Promise.resolve().then(() =>
        caches.open(CACHE_NAME),
    ).then(_cache =>
        cache = _cache,
    ).then(() =>
        handleCache('/', cache),
    ).then(updated =>
        hasUpdate = updated || hasUpdate,
    ).then(() =>
        handleCache('/entry.js', cache),
    ).then(updated =>
        hasUpdate = updated || hasUpdate,
    ).then(() =>
        clientId ? postMessageToClient(clientId, {updated: hasUpdate}) : false
    );
  }
});
