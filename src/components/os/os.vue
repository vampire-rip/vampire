<script>
import {mapState, mapMutations} from 'vuex';
import  Vue from 'vue'

let target;
let elems = [];
let observer = undefined;
const scrollListener = (e) => {
  if (e.path.some(d => d === target)) return;
  target.scrollTop += e.deltaY * 0.6;
  target.scrollLeft += e.deltaX * 0.6;
};
const clickCopyListener = (e) => {
  e = e.srcElement;
  let text = e
      , range, selection
  ;
  if (document.body.createTextRange) {
    range = document.body.createTextRange();
    range.moveToElementText(text);
    range.select();
  } else if (window.getSelection) {
    selection = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  document.execCommand('copy');
};
const initiate = () => {
  const titles = document.querySelectorAll('h2,h3,h4');
  const exercises = document.querySelectorAll('section[type="exercise"]');
  const questions = document.querySelectorAll('section[type="question"]');
  const challenges = document.querySelectorAll('section[type="challenge"]');
  target = document.querySelector('.markdown-content');
  document.addEventListener('wheel', scrollListener, {passive: true});
  elems = document.querySelectorAll(':not(pre) > code');
  elems.forEach(e => e.addEventListener('click', clickCopyListener));
  return {titles, exercises, questions, challenges};
};
export default {
  name: 'os',
  data() {
    return {
      titles: [],
      exercises: [],
      questions: [],
      challenges: [],
      lastRoutePath: ''
    };
  },
  beforeMount() {

  },
  mounted() {
    this.$root.showNav = false;
    this.$nextTick(() => Object.assign(this.$data, initiate()));
  },
  destroyed() {
    document.removeEventListener('wheel', scrollListener);
    this.$root.showNav = true;
  },
  computed: {
    ...mapState({}),
    which() {
      return 'os-' + this.$route.params.lab;
    },
    titleArr() {
      const arr = Array.prototype.slice.call(this.titles);
      let lastTag = 'H ';
      const stack = [];
      const result = [];
      arr.map(title => {
        const a = title.innerHTML.split('/');
        const t = a.length === 1 ? a[0] : a[1];
        const e = `<a @click="$emit('hashTo','#${title.id}')">${t}</a>`;
        if(title.tagName > lastTag) {
          result.push(`<ul><li>${e}`);
          stack.push(title.tagName);
        } else if(title.tagName === lastTag) {
          result.push(`</li><li>${e}`);
        } else {
          while (stack[stack.length - 1] > title.tagName) {
            stack.pop();
            result.push('</li></ul>');
          }
          result.push(`</li><li>${e}`)
        }
        lastTag = title.tagName;
      });
      while (stack.pop()) {
        result.push('</li></ul>');
      }
      return Vue.compile(result.join(''));
    }
  },
  methods: {
    ...mapMutations({}),
    hashTo(param) {
      target.scrollTop = document.querySelector(param).offsetTop - 50;
    }
  },
  updated(e) {
    if(this.$route.path === this.lastRoutePath || observer) return;
    observer = new MutationObserver(mutations => {
      elems.forEach(e => e.removeEventListener('click', clickCopyListener));
      Object.assign(this.$data, initiate());
    });
    observer.observe(document.querySelector('.markdown-content'), {
      childList: true
    });
  }
};

</script>
<style lang="scss">
@import "../../css/markdown-content";

ul {
  padding: 0 10px 0 15px;
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
  padding-top: 40px;
  max-width: 300px;
  white-space: nowrap;
  font-size: 0.9rem;
}
</style>

<template>
<div :id="$options.name" :class="$options.name">
  <div class="left-bar is-hidden-mobile">
    <component :is="titleArr" v-on:hashTo="hashTo"></component>
  </div>
  <div class="markdown-content">
    <component :is="which"></component>
  </div>
</div>
</template>
