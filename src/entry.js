const ServiceWorker = require(
    'file-loader?name=sw.[hash:hex:3].[ext]!./serviceworker.js');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(ServiceWorker).
      then(console.log).
      then(() => navigator.serviceWorker.ready).
      catch(console.error).
      then(() =>
          import('./index'),
      ).
      catch(() => alert('脚本下载失败了T^T 刷新试试？')).
      then(() => {
        navigator.serviceWorker.addEventListener('message', event => {
          if(event.data.updated && confirm('有更新啦，更新到新版本喵？')) history.go(0);
        });
        document.querySelector('#loading').remove();
        navigator.serviceWorker.controller.postMessage({ready: true});
      });
} else {
  import('./index');
}
