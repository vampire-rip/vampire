<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'donate',
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
    ...mapState({

    })
  },
  methods: {
    ...mapMutations({

    }),
    showModal () {
      document.querySelector('.modal').classList.add('is-active')
    },
    hideModal () {
      document.querySelector('.modal').classList.remove('is-active')
    }
  }
}
</script>

<style scoped lang="scss">
.fake-header {
  font-weight: 600;
  font-size: 1.15rem;
  padding-bottom: 0.75rem;
  color: #666666;
}
.text-content {
  margin-bottom: 1.5rem;
  text-indent: 2rem;
  line-height: 2;
  &>p {

  }
}
</style>

<template>
  <div :id="$options.name" :class="$options.name">
    <div class="fake-header">Vampire项目</div>
    <div class="text-content">
      <p>
        Vampire 靠着各种捐助才一直存在到了现在。虽然目前 Vampire 项目还没什么用处，可是可是，哪怕是一个每天躺在床上的肥宅小哥哥也是要吃饭的啦！对于没有独立存在能力的 Vampire 来说，每一点点金币都很重要，所以，恳请您也继续支持 Vampire 项目。
      </p>
    </div>
    <div class="fake-header">支付宝</div>
    <div class="text-content">
      <p><a @click="showModal"><i class="fab fa-alipay"></i> 打开二维码 </a> 这里是某个很穷很穷的，每天都靠着乞讨度日的人的支付宝，扫一扫就可以请他吃顿像样的午餐。</p>
    </div>
    <div class="fake-header">贝宝</div>
    <div class="text-content">
      <p><a href="https://www.paypal.me/SunriseFox"><i class="fab fa-paypal"></i> PayPal </a>，如果有外币信用卡，也可以选择这里喵， Vampire 会直接收到~</p>
      <p>不过，这里总是有相当于 0.3 金币的手续费，如果少于 0.3 金币的话，就是全部用来支付手续费啦。</p>
    </div>
    <div class="fake-header">亚马逊</div>
    <div class="text-content">
      <p><a href="https://www.amazon.co.jp/gp/product/B00CFVI3PQ"><i class="fab fa-amazon"></i> 亚马逊礼品卡 </a>，想要送给 Vampire 漂亮的画册，可以在这里喵~</p>
      <p>邮件请寄送至 sunrisefox@vampire.rip </p>
    </div>
    <div class="fake-header">报答</div>
    <div class="text-content">
      <p>作为报答，捐助 Vampire 的小哥哥小姐姐可以加入<a href="https://t.me/joinchat/JPwhYQ76hJHSVUda4Q0Ciw"> 电报群组 </a>，分享服务器的一定份额喵。</p>
      <p>服务器在美国洛杉矶的 QuadraNet 机房，到世界各地的路由和性能也都还不错啦，支持 IPv4/IPv6，不限流量，1Gbps 端口，所以大概可以用它来做很多事情，比如离线下载 BT，机器学习，小型游戏服务器，游戏加速，或者什么其他可以想到的用途。</p>
      <p>当然，如果如果，目前还访问不了电报的话，也可以首先给 Vampire 发个邮件来索要一份奇怪的上网秘籍~</p>
      <p>再次感谢~ 比心❤</p>
    </div>
    <div class="fake-header">友情链接</div>
    <div class="text-content">
      如果您有自己的网站或者广告，欢迎联系我 ━(*｀∀´*)ノ亻!。
    </div>
    <div class="modal" @click="hideModal">
      <div class="modal-background"></div>
      <div class="modal-content">
        <img src="@r/alipay.png">
      </div>
    </div>
  </div>
</template>
