<script>
import {mapState, mapMutations} from 'vuex';

export default {
  name: 'about',
  data() {
    return {};
  },
  beforeMount() {

  },
  mounted() {

  },
  destroyed() {

  },
  computed: {
    ...mapState({}),
  },
  methods: {
    ...mapMutations({}),
  },
};

</script>
<!-- vue-loader's scoped css won't work with style-loader -->
<style scoped lang="scss">
.about {
  padding-top: 2rem;
}
</style>

<template>
<div :id="$options.name" :class="$options.name">
  <div class="box">
    <article class="media">
      <div class="media-left">
        <figure class="image is-64x64">
          <img src="@r/avatar.jpg" alt="Image">
        </figure>
      </div>
      <div class="media-content">
        <div class="content">
          <p>
            <strong>SunriseFox</strong>
            <small>@realSunriseFox</small>
            <small>2018.10.6</small>
            <br>
            Flexbox 有好多坑，下次再也不用 bulma 了。
          </p>
        </div>
        <nav class="level is-mobile">
          <div class="level-left">
            <a class="level-item" aria-label="reply">
            <span class="icon is-small">
              <i class="fas fa-reply" aria-hidden="true"></i>
            </span>
            </a>
            <a class="level-item" aria-label="retweet">
            <span class="icon is-small">
              <i class="fas fa-retweet" aria-hidden="true"></i>
            </span>
            </a>
            <a class="level-item" aria-label="like">
            <span class="icon is-small">
              <i class="fas fa-heart" aria-hidden="true"></i>
            </span>
            </a>
          </div>
        </nav>
      </div>
    </article>
  </div>
  <hr>
  <h2>友情链接：<small>← 这是 &lt;h2&gt; 你敢信</small></h2>
  <div class="box has-text-centered">
    <figure class="image is-64x64" style="margin: auto; border-radius: 500px; overflow: hidden">
      <img src="//assorted.pw/img/gomoku.png" alt="Image">
    </figure>
    <div><strong><a href="//assorted.pw">五目小哥哥太可爱了</a></strong></div>
  </div>
  <h2>我</h2>
  <div class="box has-text-centered">
    <div>
      <p><strong><a href="https://github.com/SunriseFox">GitHub</a></strong></p>
      <p><strong><a href="https://twitter.com/realSunriseFox">Twitter</a></strong></p>
      <p><strong><a href="mailto:sunrisefox@vampire.rip">Email</a></strong></p>
    </div>
  </div>
</div>
</template>
