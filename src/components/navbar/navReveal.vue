<script>
  import { mapState, mapMutations } from 'vuex'
  export default {
    name: 'nav-reveal',
    props: ['icon'],
    beforeMount() {

    },
    mounted() {

    },
    destroyed() {

    },
    computed: {
      ...mapState({

      })
    },
    methods: {

    },
  };

</script>

<style scoped lang="vcss">
  .reveal {
    position: relative;
    transition: all 0.4s ease;
    height: 100%;
    width: 100%;
  }
  .reveal:hover {
    transform: translateY(3rem);
  }
  .reveal > * {
    height: 100%;
    display: flex;
    align-items: center;
    transition: all 0.4s ease;
  }
  .reveal > .text {
    transform: translateY(-3rem);
  }
  .reveal > .icon {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    white-space: nowrap;
  }
</style>

<template>
  <div class="navbar-item" style="overflow: hidden!important;">
  <div class="reveal">
    <div class="text"><slot></slot></div>
    <div class="icon"><i class="fas" :class="icon"></i></div>
  </div>
  </div>
</template>
