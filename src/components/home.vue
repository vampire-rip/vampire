<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'home',
  beforeMount () {
    this.$root.showHero = true
  },
  mounted () {

  },
  destroyed () {
    this.$root.showHero = false
  },
  computed: {
    ...mapState({
      count: state => state.count
    })
  },
  methods: {
    ...mapMutations({
      increment: 'increment'
    })
  }
}
</script>

<style scoped lang="scss">

</style>

<template>
  <div :id="$options.name" :class="$options.name">

  </div>
</template>
