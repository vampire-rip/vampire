<script>
  import { mapState, mapMutations } from 'vuex'

export default {
    name: 'nav-link',
    props: ['to', 'icon'],
    beforeMount () {

    },
    mounted () {

    },
    destroyed () {

    },
    computed: {
      ...mapState({})
    },
    methods: {
      ...mapMutations({})
    }
  }
</script>

<style scoped lang="scss">

</style>

<template>
  <a :class="$options.name" class="navbar-item" :href="to">
    <span class="icon"><i class="fas" :class="icon"></i></span>
    <span><slot></slot></span>
  </a>
</template>
