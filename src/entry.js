const ServiceWorker = require(
    'file-loader?name=sw.[hash:hex:3].[ext]!./serviceworker.js');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register(ServiceWorker).then(console.log).catch(console.error)
    .then(() => navigator.serviceWorker.ready).then(() =>
          import('./index')
    ).catch(() => alert('脚本下载失败了T^T 刷新试试？'));
  });
} else {
  import('./index');
}
