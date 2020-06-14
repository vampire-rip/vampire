<script>
import { mapState, mapMutations } from 'vuex'
import ResumeHTML from '!!file-loader!@r/raw/resume.html?esModule'
import ResumeMD from '!!file-loader!@r/raw/resume.md?esModule'

export default {
  name: 'about',
  data () {
    return { ResumeHTML }
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
.is-appendix {
  font-size: 0.6rem;
  margin-top: -0.3rem;
  color: #66C;
}
</style>

<template>
<div :id="$options.name" :class="$options.name">
  <h2 class="fake-header">我的动态</h2>
  <div class="box">
    <article class="media">
      <div class="media-left">
        <figure class="image is-64x64">
          <img src="@r/avatar.jpg" alt="Image">
        </figure>
      </div>
      <div class="media-content">
        <div class="content">
          <div>
            <strong>SunriseFox</strong>
            <small>@realSunriseFox</small>
            <small>2020.02.24</small>
            <br/>什么时候有空重写一下呢QAQ
          </div>
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
  <div class="fake-header">关于我</div>
  <div class="box has-text-centered">
    欢迎通过下面的链接自行发掘。 <br/>不过，要 <a :href="ResumeHTML" target="_blank"><i class="fas fa-download"></i>看一看我的简历</a> 喵？
  </div>
  <div class="fake-header">找到我</div>
  <div class="box has-text-centered">
    <div class="outer-flex">
      <div>
        <i class="fab fa-github-alt"></i>
        <a href="https://github.com/SunriseFox">GitHub</a>
      </div>
      <div>
        <i class="fab fa-telegram"></i>
        <a href="https://t.me/realSunriseFox">Telegram</a>
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
  <div class="fake-header">友情链接</div>
  <div class="box">
    <div class="outer-flex">
      <div class="has-text-centered">
        <figure class="image is-64x64" style="margin: auto; border-radius: 500px; overflow: hidden">
          <img src="@r/gomoku.png" alt="Image">
        </figure>
        <div><strong><a href="//assorted.ink">五目小哥哥太可爱了</a></strong></div>
      </div>
      <div class="has-text-centered">
        <figure class="image is-64x64" style="margin: auto; border-radius: 500px; overflow: hidden">
          <img src="@r/hughshine.png" alt="Image">
        </figure>
        <div><strong><a href="//hughshine.github.io">阳阳喜欢聪明的乌鸦</a></strong></div>
      </div>
    </div>
    <div class="has-text-centered">
      <figure class="image is-64x64" style="margin: auto; border-radius: 500px; overflow: hidden">
        <img src="@r/yoko2001.jpg" alt="Image">
      </figure>
      <div><strong><a href="//github.com/yoko2001">谢罪_不会并排qaq</a></strong></div>
    </div>
    <div class="is-pulled-right is-inline-desktop is-appendix">
      如果您有自己的网站或者广告，欢迎联系我━(*｀∀´*)ノ亻!
    </div>
  </div>
</div>
</template>
