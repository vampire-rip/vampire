/* eslint-disable import/no-webpack-loader-syntax */
const ServiceWorker = require(
  'file-loader?name=sw.[hash:hex:3].[ext]!./serviceworker.js')

if ('serviceWorker' in navigator) {
  const REASON_TIME_OUT = '[sw loader] Timeout!'
  Promise.resolve()
    .then(() =>
      new Promise((resolve, reject) => {
        const { scriptURL } = navigator.serviceWorker.controller || {}
        if (!scriptURL || scriptURL.split('/').pop() !== ServiceWorker) {
          setTimeout(reject, 8000, REASON_TIME_OUT)
          navigator.serviceWorker.register(ServiceWorker)
            .then(resolve).catch(reject)
        } else resolve()
      })
    )
    .then(() => new Promise((resolve, reject) => {
      setTimeout(reject, 5000, REASON_TIME_OUT)
      navigator.serviceWorker.ready.then(resolve).catch(reject)
    }))
    .then(reg => reg.active.postMessage({ type: 'ping' }))
    .catch(console.error)
    .then(() =>
      new Promise(resolve =>
        setTimeout(resolve, 0)
      )
    )
    .then(() =>
      import('./index')
    )
    .catch((error) => {
      console.warn(
        '↓ While loading script, expecting [Module], received [Error]')
      console.error(error)
      document.querySelector('#loader-text').innerHTML =
        '<span>脚本加载失败T^T 刷新试试？</span>' +
        '<pre>' + error.stack + '</pre>'
      return null
    })
    .then((component) => {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.updated !== undefined) {
          let status = event.data.updated
          window.postMessage({
            type: 'notice',
            payload: {
              source: 'Service Worker',
              content: status
                ? '准备好了页面的更新，刷新喵~'
                : (status === null
                  ? '检查更新失败......'
                  : '页面下载完成，没有新任务~'),
              type: event.data.updated ? 'refresh' : (status === null
                ? 'warning'
                : 'success')
            }
          }, '*')
        } else if (event.data.error !== undefined) {
          window.postMessage({
            type: 'notice',
            payload: {
              source: 'Service Worker',
              content: '网络连接错误，' + event.data.error,
              type: 'error'
            }
          }, '*')
        }
      })
      if (component !== null) {
        document.querySelector('#page-loader').remove()
        document.body.classList.remove('has-loader')
      }
      navigator.serviceWorker.controller.postMessage({ type: 'ready' })
    })
} else {
  try {
    import('./index')
    document.querySelector('#page-loader').remove()
    document.body.classList.remove('has-loader')
  } catch (error) {
    console.error(error)
    document.querySelector('#loader-text').innerHTML =
      '<span>不支持您的浏览器，请升级QwQ</span>' +
      '<pre>' + error.stack + '</pre>'
  }
}
const c = (e) => {
  return `color: #FFFFFF; text-shadow: 3px 3px 1px #${e}; font-size: 40px; font-family: 'Segoe Script', sans-serif; font-weight:700; padding: 0 0.3rem 0.2rem 0; margin-left: -0.3rem`
}
console.log('%cV%ca%cm%cpire ', c('e53f16'), c('f3bd03'), c('634eff'), c('05df33'))
