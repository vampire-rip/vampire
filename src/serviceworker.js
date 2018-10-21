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
    let type
    if (response.headers.get('Content-Type').startsWith('text/html')) { type = 'html' } else if (response.headers.get('Content-Type').indexOf('javascript') !== -1) { type = 'js' }
    let newText
    return response.text().then(text => {
      if (type === 'html') {
        const inject =
          '\n<img src="/sw-tamper-image" style="display:none"/>\n'
        if (/(<body.*?>)(.+)(<\/body>)/s.test(text)) {
          newText = text.replace(
            /(<body.*?>)(.+)(<\/body>)/gms,
            `$1$2${inject}$3`
          )
        } else if (/(.+)<\/html>/s.test(text)) {
          newText = text.replace(
            /(.+)<\/html>/gms,
            `$1${inject}</html>`
          )
        } else {
          newText = text + inject
        }
      } else if (type === 'js') {
        newText = text + ';\nfetch("/sw-tamper-js")'
      }
      return cache.match(path)
        .then(response => response.text())
        .catch(() => undefined)
    }).then(oldText => {
      if (oldText !== newText) {
        const init = {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        }
        cache.put(path, new Response(newText, init))
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

const checkSelfStatus = (client) => {
  const url = self.location.href || self.registration.active.scriptURL
  const controller = new AbortController()
  const signal = controller.signal
  const cancelInterval = setInterval(() => {
    controller.abort()
  }, 4000)
  fetch(url, {
    method: 'get',
    cache: 'no-cache',
    mode: 'no-cors',
    signal
  }).then(response => {
    if (response.status >= 400 && response.status <= 501) {
      console.warn('[sw] wrong client', client)
      return false
    }
    console.warn('[sw] self status is good')
    return true
  }).catch(err => {
    console.warn('[sw] self status check encountered error')
    console.error(err)
    return true
  }).then(result => {
    clearInterval(cancelInterval)
    if (result === true) {
      console.warn('[sw] try to recover from a wrong client')
      cacheMainPage().then(() =>
        self.registration.update()
      )
    } else {
      console.error('[sw] fatal error, unregister self')
      self.registration.unregister()
    }
  })
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
  const { request, clientId } = event
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return console.warn('[sw] warn devtools are open')
  }
  if (!knownClients.has(clientId) && clientId) {
    knownClients.add(clientId)
    console.log('[sw] found new client', clientId)
    selfDestroyTimer[clientId] = setTimeout(() => {
      console.warn(`[sw] client ${clientId} may be bad, checking self status`)
      selfDestroyTimer[clientId] = null
      checkSelfStatus(clientId)
    }, 2000)
  }
  const isDummyRequest = /sw-tamper-(.{2,5})$/.exec(request.url)
  if (isDummyRequest !== null) {
    return event.respondWith(
      isDummyRequest[1] === 'image'
        ? fetch('data:image/gif;base64,R0lGODlhAQABAIAAAAAAMwAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==')
        : Promise.resolve(new Response(null, {
          headers: { 'x-client-id': clientId },
          status: 204,
          statusText: 'No Content.'
        }))
    )
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
        return err
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
      console.log(`[sw] nice, client ${clientId} is good`);
      (state === null ? Promise.resolve(null) : cacheMainPage()).then(
        hasUpdate =>
          clientId
            ? postMessageToClient(clientId, { updated: hasUpdate })
            : false
      )
      break
    case 'ping':
      clearTimeout(selfDestroyTimer[clientId])
      delete selfDestroyTimer[clientId]
      break
  }
})
