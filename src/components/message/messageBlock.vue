<script>
  import { mapState, mapMutations } from 'vuex'
  export default {
    name: 'message-block',
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
<style scoped lang="vcss">
.message-block {
  display: block;
  flex: 0 1 auto;
  height: 100px;
  background: goldenrod;
  padding: 10px 10px;
  margin: 10px 10px;
}
</style>

<template>
  <div :id="$options.name" :class="$options.name">

  </div>
</template>
