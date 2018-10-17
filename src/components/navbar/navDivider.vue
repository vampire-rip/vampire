<script>
  import { mapState, mapMutations } from 'vuex'
  export default {
    name: 'nav-divider',
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

<style scoped lang="scss">
  .nav-divider {
    width: 0;
    margin: 10px 10px;
    padding: 0;
    border-left: 1px solid #d3dcdc;
    display: inline-block;
  }
</style>

<template>
  <div :id="$options.name" :class="$options.name"> </div>
</template>
