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
    },
    methods: {
      activeRegister() {
        this.$root.$refs.register.$data.active = true
      },
      activeLogin() {
        this.$root.$refs.login.$data.active = true
      }
    },
  };

</script>

<style scoped lang="vcss">
.navbar {
  flex: 0 0 auto;
}
</style>

<template>
  <nav :id="$options.name" :class="$options.name">
    <div class="container">
      <div class="navbar-brand">
        <router-link class="navbar-item" to="/" tag="div">
          <img src="@r/logo.png" alt="NKOJ">
        </router-link>
        <div class="navbar-burger burger" data-target="navMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <nav-divider></nav-divider>
      <div id="navMenu" class="navbar-menu">
        <div class="navbar-start">
          <nav-item to="/" icon="fa-home">主页</nav-item>
          <nav-item to="/os" icon="fa-coins">操作系统</nav-item>
          <nav-item to="/about" icon="fa-question">关于</nav-item>
          <nav-link to="/ctf" icon="fa-flag-checkered">CTF</nav-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="field">
              <p class="control has-icons-right">
                <input class="input is-rounded" type="text" placeholder="搜索">
                <span class="icon is-small is-right"><i class="fas fa-search"></i></span>
              </p>
            </div>
          </div>
          <nav-reveal icon="fa-bullhorn">公告</nav-reveal>
          <nav-divider></nav-divider>
          <nav-reveal icon="fa-user-plus" @click.native="activeRegister">注册</nav-reveal>
          <nav-reveal icon="fa-sign-in-alt" @click.native="activeLogin">登陆</nav-reveal>
        </div>
      </div>
    </div>
  </nav>
</template>
