<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'hero',
  data () {
    return {}
  },
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
<!-- vue-loader's scoped css won't work with style-loader -->
<style lang="scss">
#hero {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: fixed;
}

.hero .navbar .input, .textarea {
  background: rgba(255, 255, 255, 0.2);
}

.hero .navbar .navbar-item {
  color: rgba(255, 255, 255, 0.8);
}

div.title {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

div.list {
  display: flex;
  flex-direction: column;
  list-style-type: disc;
  p {
    display: list-item;
    padding-left: 1rem;
  }
}

div.has-padding-top {
  padding-top: 0.7rem;
}

div.box a {
  color: #FA7C91 !important;
  text-decoration-style: dotted;
  text-decoration-line: underline;
  &:hover {
    color: #757763 !important;
  }
}
</style>

<template>
<section class="hero is-info is-bold is-fullheight" :id="$options.name" :class="$options.name">
  <div class="hero-head">
    <navbar></navbar>
  </div>
  <div class="hero-body">
    <div class="container has-text-centered">
      <div class="title">
        <div class="image is-128x128"><img src="@r/icon.png"/></div>
        <h1>vampire.rip</h1>
      </div>
      <div class="subtitle">
        还在建设中喵
      </div>
      <div style="display: inline-block; text-align: left">
        <div>
          如果你...
        </div>
        <div class="list has-text-justified has-padding-top">
          <p>想要一个 .vampire.rip 的子域名</p>
          <p>想要一个 @vampire.rip 的邮箱</p>
          <p>想成为 Vampire R.I.P 的伙伴</p>
        </div>
      </div>
      <div class="has-padding-top">
        请联系 sunrisefox [AT] vampire.rip
      </div>
    </div>
  </div>
  <div class="hero-foot has-text-centered">
    <div>滥用举报：abuse@vampire.rip</div>
    <div>Vampire 2018</div>
  </div>
</section>
</template>
