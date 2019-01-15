<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'about',
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
<style scoped lang="scss">
.about {
  padding-top: 2rem;
}
.fake-header {
  font-weight: 600;
  font-size: 1.15rem;
  padding-bottom: 0.75rem;
  color: #666666;
}
.outer-flex {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  font-size: 1.15rem;
  &>div{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &>svg {
      font-size: 1.2rem;
      color: coral;
    }
  }
}
</style>

<template>
<div :id="$options.name" :class="$options.name">
  <h2 class="fake-header">伪装成推特的动态</h2>
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
            <small>2018.12.21</small>
            <br>
            迁移到了 nginx 服务器，希望不会有什么问题。
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
  <div class="fake-header">友情链接</div>
  <div class="box has-text-centered">
    <figure class="image is-64x64" style="margin: auto; border-radius: 500px; overflow: hidden">
      <img src="@r/gomoku.png" alt="Image">
    </figure>
    <div><strong><a href="//assorted.pw">五目小哥哥太可爱了</a></strong></div>
  </div>
  <h2 class="fake-header">找到我</h2>
  <div class="box has-text-centered">
    <div class="outer-flex">
      <div>
        <i class="fab fa-github-alt"></i>
        <a href="https://github.com/SunriseFox">GitHub</a>
      </div>
      <div>
        <i class="fab fa-telegram"></i>
        <a href="https://t.me/joinchat/JPwhYQ76hJHSVUda4Q0Ciw">Telegram</a>
      </div>
      <div>
        <i class="fab fa-twitter"></i>
        <a href="https://twitter.com/realSunriseFox">Twitter</a>
      </div>
      <div>
        <i class="fab fa-steam"></i>
        <a href="https://steamcommunity.com/id/Sunrisefox/">Steam</a>
      </div>
      <div>
        <i class="fas fa-at"></i>
        <a href="mailto:sunrisefox@vampire.rip">Email</a>
      </div>
    </div>
  </div>
</div>
</template>
