<script>
import { mapState, mapMutations } from 'vuex'
import Vue from 'vue'

let target
let leftBar
let elems = []
const scrollListener = (e) => {
  if (e.path.some(d => d === target || d === leftBar)) return
  target.scrollTop += e.deltaY * 0.6
  target.scrollLeft += e.deltaX * 0.6
}
const clickCopyListener = (e) => {
  e.stopImmediatePropagation()
  e = e.srcElement
  let text = e

  let range; let selection

  if (document.body.createTextRange) {
    range = document.body.createTextRange()
    range.moveToElementText(text)
    range.select()
  } else if (window.getSelection) {
    selection = window.getSelection()
    range = document.createRange()
    range.selectNodeContents(text)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  document.execCommand('copy')
}
const initiate = () => {
  const titles = document.querySelectorAll('h2,h3,h4')
  const exercises = document.querySelectorAll('section[type="exercise"]')
  const questions = document.querySelectorAll('section[type="question"]')
  const challenges = document.querySelectorAll('section[type="challenge"]')
  leftBar = document.querySelector('.left-bar')
  target = document.querySelector('.markdown-content')
  document.addEventListener('wheel', scrollListener, { passive: true })
  elems = document.querySelectorAll(':not(pre) > code')
  elems.forEach(e => e.addEventListener('click', clickCopyListener))
  return { titles, exercises, questions, challenges }
}
export default {
  name: 'os',
  data () {
    return {
      titles: [],
      exercises: [],
      questions: [],
      challenges: [],
      lastRoutePath: '',
      leftBarActive: false,
      observer: undefined
    }
  },
  beforeMount () {

  },
  mounted () {
    this.$root.showNav = false
    this.$nextTick(() => Object.assign(this.$data, initiate()))
  },
  destroyed () {
    document.removeEventListener('wheel', scrollListener)
    this.$root.showNav = true
  },
  computed: {
    ...mapState({}),
    which () {
      return 'os-' + this.$route.params.lab
    },
    titleDir () {
      const arr = Array.prototype.slice.call(this.titles)
      let lastTag = 'H '
      const stack = []
      const result = []
      arr.map(title => {
        const a = title.innerHTML.split('/')
        const t = a.length === 1 ? a[0] : a[1]
        const e = `<a @click="$emit('hashTo','#${title.id}')">${t}</a>`
        if (title.tagName > lastTag) {
          result.push(`<ul><li>${e}`)
          stack.push(title.tagName)
        } else if (title.tagName === lastTag) {
          result.push(`</li><li>${e}`)
        } else {
          while (stack[stack.length - 1] > title.tagName) {
            stack.pop()
            result.push('</li></ul>')
          }
          result.push(`</li><li>${e}`)
        }
        lastTag = title.tagName
      })
      while (stack.pop()) {
        result.push('</li></ul>')
      }
      return Vue.compile(result.join(''))
    },
    exerciseDir () {
      const arr = Array.prototype.slice.call(this.exercises)
      const result = []
      result.push('<ul>')
      arr.map((exercise, i) => {
        i = i + 1
        exercise.setAttribute('id', `exercise${i}`)
        result.push(`<li><a @click="$emit('hashTo', '#exercise${i}')">练习 ${i}</a></li>`)
      })
      result.push('</ul>')
      return Vue.compile(result.join(''))
    },
    questionDir () {
      const arr = Array.prototype.slice.call(this.questions)
      const result = []
      result.push('<ul>')
      arr.map((question, i) => {
        i = i + 1
        question.setAttribute('id', `question${i}`)
        result.push(`<li><a @click="$emit('hashTo', '#question${i}')">问题 ${i}</a></li>`)
      })
      result.push('</ul>')
      return Vue.compile(result.join(''))
    },
    challengeDir () {
      const arr = Array.prototype.slice.call(this.challenges)
      const result = []
      result.push('<ul>')
      arr.map((challenge, i) => {
        i = i + 1
        challenge.setAttribute('id', `challenge${i}`)
        result.push(`<li><a @click="$emit('hashTo', '#challenge${i}')">挑战 ${i}</a></li>`)
      })
      result.push('</ul>')
      return Vue.compile(result.join(''))
    }
  },
  methods: {
    ...mapMutations({}),
    hashTo (param) {
      if (typeof param === 'string') { target.scrollTop = document.querySelector(param).offsetTop - 50 } else { target.scrollTop = param.offsetTop - 50 }
    },
    toggleLeftBar () {
      this.leftBarActive = !this.leftBarActive
    },
    hideLeftBar () {
      this.leftBarActive = false
    }
  },
  updated (e) {
    if (this.$route.path === this.lastRoutePath || this.observer) return
    this.observer = new MutationObserver(mutations => {
      elems.forEach(e => e.removeEventListener('click', clickCopyListener))
      Object.assign(this.$data, initiate())
    })
    this.observer.observe(document.querySelector('.markdown-content'), {
      childList: true
    })
  }
}
</script>
<style lang="scss">
@import "../../css/markdown-content";

ul {
  padding: 0 0 0 15px;
  list-style: disc outside none;
  list-style-type: inherit;
  line-height: 1.65;
}

ul ul, ol ul {
  list-style-type: circle;
}

ol ol ul, ol ul ul, ul ol ul, ul ul ul {
  list-style-type: square;
}

.os {
  display: flex;
  flex: 0 1 auto;
  overflow: hidden;
  justify-content: center;
}

.markdown-content {
  display: flex;
  flex: 1 1 auto;
  overflow-y: auto;
  flex-direction: column;
}

.left-bar {
  flex: 0 1 auto;
  padding: 40px 0 0 20px;
  max-width: 300px;
  white-space: nowrap;
  font-size: 0.9rem;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  transform: translateX(-100%);
  overflow: visible;
  transition: transform 0.5s ease;
  display: flex;
  background-color: #FEFCFB;
  &.left-bar-active {
    transform: unset;
  }
}

.left-bar-control {
  position: absolute;
  right: 0;
  transform: translateX(100%) scaleX(1);
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.9s ease;
  color: darkorange;
  &.left-bar-active {
    transform: scaleX(-1) translateX(0%);
    opacity: 0.6;
    color: cornflowerblue;
  }
}

.left-bar-wrapper {
  overflow-y: auto;
  padding-right: 2rem;
  &::-webkit-scrollbar {
    width: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: #66CCFF;
  }
}
</style>

<template>
<div :id="$options.name" :class="$options.name">
  <div class="left-bar" :class="{'left-bar-active': leftBarActive}">
    <div class="left-bar-wrapper">
      <div>目录</div>
      <component :is="titleDir" v-on:hashTo="hashTo"></component>
      <div>练习</div>
      <component :is="exerciseDir" v-on:hashTo="hashTo"></component>
      <div>问题</div>
      <component :is="questionDir" v-on:hashTo="hashTo"></component>
      <div>挑战</div>
      <component :is="challengeDir" v-on:hashTo="hashTo"></component>
    </div>
    <div class="left-bar-control" :class="{'left-bar-active': leftBarActive}" @click="toggleLeftBar">
      <i class="fas fa-chevron-circle-right" style="width: 1.6rem; height: 1.6rem;"></i>
    </div>
  </div>
  <div class="markdown-content" @click="hideLeftBar">
    <component :is="which"></component>
  </div>
</div>
</template>
