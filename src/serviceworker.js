/* eslint-env serviceworker */
// chrome --disable-web-security --allow-file-access-from-files --unsafely-treat-insecure-origin-as-secure=http://localhost --user-data-dir=%TEMP%

const CACHE_NAME = 'cache_vampire'
const knownClients = new Set()
const selfDestroyTimer = {}
const cachePattern = /\.(png|jpe?g|gif|svg|mp4|js|css|woff2?)(\?.*)?$/

const postMessageToClient = (clientId, message) => {
  return Promise.resolve().then(() =>
    clients.get(clientId)
  ).then(client =>
    client && client.postMessage(message)
  )
}

const handleCache = (path, cache) => {
  const controller = new AbortController()
  const signal = controller.signal
  const cancelInterval = setInterval(() => {
    console.log('[sw] timeout! cancel the fetch.')
    controller.abort()
  }, 5000)
  return Promise.resolve().then(() =>
    fetch(path, { signal })
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
  ).then(value => {
    clearInterval(cancelInterval)
    return value
  })
}

const cacheMainPage = () => {
  let cache
  let hasUpdate = null
  return Promise.resolve().then(() =>
    caches.open(CACHE_NAME)
  ).then(_cache =>
    (cache = _cache)
  ).then(() =>
    handleCache('/', cache)
  ).then(updated =>
    (hasUpdate = hasUpdate || updated)
  ).then(() => {
    if (hasUpdate === null) return null
    return handleCache('/entry.js', cache)
  }
  ).then(updated =>
    (hasUpdate = hasUpdate || updated)
  )
}

self.addEventListener('install', function (event) {
  console.log('[sw] installed.')
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function (event) {
  console.log('[sw] activated.')
  event.waitUntil(
    self.clients.claim()
  )
})

self.addEventListener('fetch', function (event) {
  const request = event.request
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return console.warn('[sw] warn devtools are open')
  }
  const { clientId } = event
  if (!knownClients.has(clientId) && clientId) {
    knownClients.add(clientId)
    console.log('[sw] found new client', clientId)
    if (request.url.split('/').pop() === 'entry.js') {
      selfDestroyTimer[clientId] = setTimeout(() => {
        console.log(`[sw] client ${clientId} is bad, refetching.`)
        selfDestroyTimer[clientId] = null
        cacheMainPage()
      }, 2000)
    }
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

self.addEventListener('message', message => {
  const clientId = message.source.id
  switch (message.data.type) {
    case 'ready':
      clearTimeout(selfDestroyTimer[clientId])
      const state = selfDestroyTimer[clientId]
      delete selfDestroyTimer[clientId]
      console.log(`[sw] nice, client ${clientId} is in good state.`);
      (state === null ? Promise.resolve(null) : cacheMainPage()).then(hasUpdate =>
        clientId
          ? postMessageToClient(clientId, { updated: hasUpdate })
          : false
      )
      break
    case 'ping':
      break
  }
})
