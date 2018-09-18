const Vue = require('vue');
const VueRouter = require( 'vue-router').default;
const Vuex = require('vuex').default;

const ServiceWorker = require('file-loader?name=sw.[hash:hex:3].[ext]!./serviceworker.js');
const GlobalCSS = require('./css/global.scss');
const Bulma = require('./css/bulma.scss');
const FontAwesome = require('@fortawesome/fontawesome-free/js/all.js');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register(ServiceWorker).then(console.log).catch(console.error);
  });
}

Vue.use(VueRouter);
Vue.use(Vuex);

const routes = {};

const components = require.context('./components', true, /.vue$/);
components.keys().forEach(fileName => {
  const config = components(fileName).default;
  const name = config.name;
  routes[name] = Vue.component(name, config);
});


const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
});

const router = new VueRouter({
  routes : [
    {path: '/', component: routes.home},
  ]
});

const app = new Vue({
  el: '#app',
  router,
  store,
  data: {
    showNav: false,
  },
  beforeUpdate() {

  },
  computed: {

  },
  mounted() {

  }
});
