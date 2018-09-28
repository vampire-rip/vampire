<script>
  import { mapState, mapMutations } from 'vuex'
  export default {
    name: 'home',
    beforeMount() {

    },
    mounted() {

    },
    destroyed() {

    },
    computed: {
      ...mapState({
        count: state=>state.count
      })
    },
    methods: {
      ...mapMutations({
        increment: 'increment'
      })
    },
  };

</script>

<style scoped lang="vcss">

</style>

<template>
  <div :id="$options.name" :class="$options.name">

  </div>
</template>
