const Vue = require('vue');
const VueRouter = require('vue-router').default;
const Vuex = require('vuex').default;

const GlobalCSS = require('./css/global.scss');
const Bulma = require('./css/bulma.scss');
const FontAwesome = require('@fortawesome/fontawesome-free/js/all.js');
const Favicon = require('./favicon.ico');

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
    messageID: 0,
    showHero: false,
    showNav: true,
    showMenu: false,
    messages: []
  },
  beforeUpdate() {

  },
  computed: {},
  mounted() {

  },
  methods: {
    pushMessage({source, content, error}) {
      this.messages.push({
        id: this.messageID++,
        source,
        content,
        error
      });
    },
    deleteMessage(id) {
      for (let i = 0; i < this.messages.length; i++)
        if (this.messages[i].id === id)
          return this.messages.splice(i, 1);
    }
  }
});

window.addEventListener('message', e => {
  const {data} = e;
  if (data.type === 'notice') {
    app.pushMessage(data);
  }
});
