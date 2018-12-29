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

div.has-margin {
  margin: 1.25rem;
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
      <div class="has-margin">
        <p>他们说，魔法是人们还不懂的科学。</p>
        <p>那么 <u> 科学 </u> 是什么呢？</p>
        <p>科学只是我们已经掌握的魔法 &gt;.&lt;</p>
      </div>
      <div class="has-margin">
        <p>They say, magic is science that we don't understand yet.</p>
        <p>But what is the <u>'science'</u> ? </p>
        <p>Science was just spells before we'd mastered how to cast.</p>
      </div>
      <div class="has-padding-top has-margin">
        SunriseFox 欢迎您来 =w=
      </div>
    </div>
  </div>
  <div class="hero-foot has-text-centered">
    <div>滥用举报：abuse@vampire.rip</div>
    <div>Vampire 2018</div>
  </div>
</section>
</template>
