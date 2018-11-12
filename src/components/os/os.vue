<script>
import { mapState, mapMutations } from 'vuex'
import Vue from 'vue'

export default {
  name: 'os',
  data () {
    return {

    }
  },
  beforeMount () {

  },
  mounted () {

  },
  destroyed () {

  },
  computed: {
    ...mapState({}),
    which () {
      return this.$route.params.lab
    }
  },
  methods: {
    ...mapMutations({})

  }
}
</script>
<style lang="scss">
.wrapper {
  text-align: center;
  img.nyantocat {
    margin: 10vh;
    border-radius: 50%;
    box-shadow: 0 0 50px 20px rgb(25,72,148);
    width: 30%;
    min-width: 300px;
  }
  p.extra {
    font-size: 1.25rem;
    padding-top: 1rem;
  }
}
</style>

<template>
<div :id="$options.name" :class="$options.name">
  <div class="wrapper">
    <img class="nyantocat" src="../../resources/nyantocat.gif" title="Image from https://octodex.github.com/nyantocat">
    <p>文档迁移到了 <a href="//os.vampire.rip/"> Vampire OS </a> 喵... </p>
    <p class="extra"><a href="//os.vampire.rip/optimized.html">“好哒，现在就带我过去找它→”</a></p>
  </div>
</div>
</template>
