<script>
  import { mapState, mapMutations } from 'vuex'
  export default {
    name: 'template',
    data() {
      return {

      }
    },
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
      ...mapMutations({

      })
    },
  };

</script>
<!-- vue-loader's scoped css won't work with style-loader -->
<style scoped lang="scss">

</style>

<template>
  <div :id="$options.name" :class="$options.name">

  </div>
</template>
