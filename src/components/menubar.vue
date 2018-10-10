<script>
import {mapState, mapMutations} from 'vuex';

export default {
  name: 'menubar',
  data() {
    return {};
  },
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
    ...mapMutations({}),
    hideMenu() {
      this.$root.showMenu = false;
    }
  },
};

</script>
<!-- vue-loader's scoped css won't work with style-loader -->
<style scoped lang="scss">
.menubar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  transform: translateX(100%);
  transition: transform 0.5s ease-in-out;
  justify-content: flex-end;
  &.is-active {
    transform: translateX(0%);
  }
}
.menu {
  z-index: 1000;
  background: rgba(255, 255, 255, 0.67);
  padding-top: 52px;
}
</style>

<template>
<div :id="$options.name" :class="$options.name">
  <aside class="menu">
    <ul><li>首页</li>
      <li>操作系统</li>
      <li>关于</li>
      <li>CTF</li></ul>
  </aside>
  <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%" @click="hideMenu"></div>
</div>
</template>
