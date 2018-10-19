// chrome --disable-web-security --allow-file-access-from-files --unsafely-treat-insecure-origin-as-secure=http://localhost --user-data-dir=%TEMP%

const CACHE_NAME = 'cache_vampire'
const known_clients = new Set()
const selfDestroyTimer = {}
const cachePattern = /\.(png|jpe?g|gif|svg|mp4|js|css|woff2?)(\?.*)?$/

const postMessageToClient = (clientId, message) => {
  return Promise.resolve().then(() =>
    clients.get(clientId)
  ).then(client =>
    client && client.postMessage(message)
  )
}

self.addEventListener('install', function (event) {
  console.log('[sw] installed.')
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function (event) {
  console.log('[sw] activated.')
  event.waitUntil(
    self.clients.claim().then(() =>
      self.clients.matchAll()
    ).then(clients => {
      for (const client of clients) {
        known_clients.add(client.id)
        console.log('[sw] trusted initial clients', client.id)
      }
      return true
    }
    )
  )
})

self.addEventListener('fetch', function (event) {
  const request = event.request
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return console.warn('[sw] warn devtools are open')
  }
  const { clientId } = event
  if (!known_clients.has(clientId) && clientId) {
    known_clients.add(clientId)
    console.log('[sw] found new client', clientId)
    selfDestroyTimer[clientId] = setTimeout(() => {
      self.registration.unregister().then(() =>
        console.warn(`[sw] found bad client ${clientId}, get rid of it`)
      )
    }, 2000)
  }
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response
      }
      const fetchRequest = request.clone()
      return fetch(fetchRequest).then(response => {
        if (!response || !response.ok || response.type === 'opaque') {
          if (response.type !== 'opaque') {
            console.log('[sw] error:', response)
            postMessageToClient(clientId, { error: response.status })
          }
          return response
        }
        if (!cachePattern.test(response.url)) {
          return response
        }
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then(cache => {
          if (response.type !== 'cors') {
            cache.keys().then(entries => {
              const regex = /^(.+\/.+?\.).{7}\.(.{1,4})/
              const key = regex.exec(request.url)
              if (key) {
                for (let i of entries) {
                  const target = regex.exec(i.url)
                  if (!target) continue
                  if ((key[2] === target[2]) && (key[1] === target[1])) {
                    cache.delete(i).then(() =>
                      console.log('[sw] deleted previous cache', i.url)
                    )
                  }
                }
              }
            })
          }
          cache.put(request, responseToCache)
        })
        return response
      }).catch(err => {
        console.warn('[sw] failed to fetch', err)
        postMessageToClient(clientId, { error: 'ERR_CONNECTION_FAILED' })
        throw err
      })
    })
  )
})

const handleCache = (path, cache) =>
  Promise.resolve().then(() =>
    fetch(path)
  ).then(response => {
    if (!response.ok) return null
    let newText
    let clone = response.clone()
    return clone.text().then(text => {
      newText = text
      return cache.match(path)
        .then(response => response.text())
        .catch(() => undefined)
    }).then(oldText => {
      if (oldText !== newText) {
        cache.put(path, response)
        return oldText !== undefined
      }
      return false
    })
  }).catch(() =>
    null
  )

self.addEventListener('message', message => {
  const clientId = message.source.id
  switch (message.data.type) {
    case 'ready':
      console.log(`[sw] nice, client ${clientId} is in good state`)
      clearTimeout(selfDestroyTimer[clientId])
      delete selfDestroyTimer[clientId]
      let cache
      let hasUpdate = null
      Promise.resolve().then(() =>
        caches.open(CACHE_NAME)
      ).then(_cache =>
        cache = _cache
      ).then(() =>
        handleCache('/', cache)
      ).then(updated =>
        hasUpdate = hasUpdate || updated
      ).then(() =>
        handleCache('/entry.js', cache)
      ).then(updated =>
        hasUpdate = hasUpdate || updated
      ).then(() =>
        clientId
          ? postMessageToClient(clientId, { updated: hasUpdate })
          : false
      )
      break
    case 'ping':
      break
  }
})
