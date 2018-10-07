const Vue = require('vue');
const VueRouter = require('vue-router').default;
const Vuex = require('vuex').default;

const ServiceWorker = require(
    'file-loader?name=sw.[hash:hex:3].[ext]!./serviceworker.js');
const GlobalCSS = require('./css/global.scss');
const Bulma = require('./css/bulma.scss');
const FontAwesome = require('@fortawesome/fontawesome-free/js/all.js');
const Favicon = require('./favicon.ico');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register(ServiceWorker).
        then(console.log).
        catch(console.error);
  });
}

Vue.use(VueRouter);
Vue.use(Vuex);

const routes = {};

const components = require.context('./components', true, /.vue$/, 'lazy');
components.keys().forEach(fileName => {
  const name = /\/?([^/]+?).vue$/.exec(fileName)[1];
  const nameLower = name.replace(/([A-Z])/g, '-$1').toLowerCase();
  routes[name] = Vue.component(nameLower, async () => {
    const config = await components(fileName);
    return config.default;
  });

});

const store = new Vuex.Store({
  state: {
    count: 0,
  },
  mutations: {
    increment(state) {
      state.count++;
    },
  },
});

const router = new VueRouter({
  routes: [
    {path: '/', component: routes.home},
    {path: '/about', component: routes.about},
    {path: '/os', component: routes.osDispatcher},
    {path: '/os/:lab', component: routes.os},
  ],
});

const app = new Vue({
  el: '#app',
  router,
  store,
  data: {
    showHero: false,
    showNav: true,
  },
  beforeUpdate() {

  },
  computed: {},
  mounted() {

  },
});
