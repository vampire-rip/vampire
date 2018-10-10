<script>
  import {mapState, mapMutations} from 'vuex';

  export default {
    name: 'navbar',
    beforeMount() {

    },
    mounted() {

    },
    destroyed() {

    },
    computed: {
      ...mapState({}),
      menuActive() {
        return this.$root.showMenu
      }
    },
    methods: {
      activeRegister() {
        this.$root.$refs.register.$data.active = true
      },
      activeLogin() {
        this.$root.$refs.login.$data.active = true
      },
      toggleMenu(e) {
        e.stopImmediatePropagation();
        this.$root.showMenu = !this.$root.showMenu;
      },
      hideMenu() {
        this.$root.showMenu = false;
      }
    },
  };

</script>

<style scoped lang="vcss">
.navbar {
  flex: 0 0 auto;
}
.navbar-burger.burger {
  transition: all 0.5s ease;
}
.navbar-burger.burger.is-active {
  transform: rotate(-90deg);
}
</style>

<template>
  <nav :id="$options.name" :class="$options.name" @click="hideMenu">
    <div class="container">
      <div class="navbar-brand">
        <router-link class="navbar-item" to="/" tag="div">
          <img src="@r/logo.png" alt="NKOJ">
        </router-link>
        <div class="navbar-burger burger" :class="{'is-active': menuActive}" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <nav-divider v-if="!menuActive"></nav-divider>
      <div id="navMenu" class="navbar-menu" :class="{'is-active': menuActive}">
        <div class="navbar-start">
          <nav-item to="/" icon="fa-home">主页</nav-item>
          <nav-item to="/os" icon="fa-coins">操作系统</nav-item>
          <nav-item to="/about" icon="fa-question">关于</nav-item>
          <nav-link to="/ctf" icon="fa-flag-checkered">CTF</nav-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item" v-if="!menuActive">
            <div class="field">
              <p class="control has-icons-right">
                <input class="input is-rounded" type="text" placeholder="搜索">
                <span class="icon is-small is-right"><i class="fas fa-search"></i></span>
              </p>
            </div>
          </div>
          <component :is="menuActive ? 'nav-item' : 'nav-reveal'" to="#1" icon="fa-bullhorn">公告</component>
          <nav-divider v-if="!menuActive"></nav-divider>
          <component :is="menuActive ? 'nav-item' : 'nav-reveal'" to="#2" icon="fa-user-plus" @click.native="activeRegister">注册</component>
          <component :is="menuActive ? 'nav-item' : 'nav-reveal'" to="#3" icon="fa-sign-in-alt" @click.native="activeLogin">登陆</component>
        </div>
      </div>
    </div>
  </nav>
</template>
