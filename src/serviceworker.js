// chrome --disable-web-security --allow-file-access-from-files --unsafely-treat-insecure-origin-as-secure=http://localhost --user-data-dir=%TEMP%

const CACHE_NAME = 'cache_vampire';
const known_clients = new Set();
let fetchClient = {};
const selfDestroyTimer = {};

const postMessageToClient = (clientId, message) =>
    Promise.resolve().then(() =>
        clients.get(clientId),
    ).then(client =>
        client && client.postMessage(message),
    );

self.addEventListener('install', function(event) {
  console.log('serviceWorker installed.');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  console.log('serviceWorker activated.');
  event.waitUntil(
      self.clients.claim()
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.cache === 'only-if-cached' && event.request.mode !==
      'same-origin') {
    return;
  }
  const {clientId} = event;
  if(!known_clients.has(clientId) && clientId) {
    known_clients.add(clientId);
    selfDestroyTimer[clientId] = setTimeout(() => {
      self.registration.unregister().then(
          () => console.warn(`[sw] found bad client ${clientId}, get rid of it`)
      )
    }, 2000);
    console.log('found new clients:', clientId);
  } else if(fetchClient.client === clientId) {
    clearTimeout(fetchClient.timer);
    fetchClient = {};
  }
  event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
            function(response) {
              if (!response.ok && response.type !== 'opaque') {
                console.log('[sw] error:', response);
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
                              then(() => console.log('deleted previous cache',
                                  i.url));
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
      if (!response.ok) return null;
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
        null,
    );

self.addEventListener('message', message => {
  const clientId = message.source.id;
  switch (message.data.type){
    case 'ready':
      clearTimeout(selfDestroyTimer[clientId]);
      delete selfDestroyTimer[clientId];
      let cache;
      let hasUpdate = null;
      Promise.resolve().then(() =>
          caches.open(CACHE_NAME),
      ).then(_cache =>
          cache = _cache,
      ).then(() =>
          handleCache('/', cache),
      ).then(updated =>
          hasUpdate = hasUpdate || updated,
      ).then(() =>
          handleCache('/entry.js', cache),
      ).then(updated =>
          hasUpdate = hasUpdate || updated,
      ).then(() =>
          clientId ? postMessageToClient(clientId, {updated: hasUpdate}) : false,
      );
      break;
    case 'ping':
      known_clients.add(clientId);
      fetchClient.client = clientId;
      fetchClient.timer = setTimeout(() => {
        self.registration.unregister();
        console.warn(`[sw] found bad client ${clientId}, get rid of it`);
      }, 2000);
      break;
  }
});
