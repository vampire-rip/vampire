<script>
import {mapState, mapMutations} from 'vuex';

let target;
let elems = [];
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
      let lastTag = '';
      let result = [];
      arr.map(title => {
        const a = title.innerHTML.split('/');
        const t = a.length === 1 ? a[0] : a[1];
        const e = `<a href="#${title.id}">${t}</a>`;
        if(title.tagName > lastTag) result.push(`<ul><li>${e}</li>`);
        else if(title.tagName === lastTag) result.push(`<li>${e}</li>`);
        else result.push(`</ul><li>${e}</li>`);
        lastTag = title.tagName;
      });
      result.push('</ul>');
      return result.join('');
    }
  },
  methods: {
    ...mapMutations({}),
  },
  updated() {
    if(this.$route.path === this.lastRoutePath) return;
    this.lastRoutePath = this.$route.path;
    elems.forEach(e => e.removeEventListener('click', clickCopyListener));
    Object.assign(this.$data, initiate());
  }
};

</script>
<style lang="scss">
@import "../../css/markdown-content";

ul {
  padding: 0 20px;
  list-style: unset;
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
  max-width: 400px;
  white-space: nowrap;
}
</style>

<template>
<div :id="$options.name" :class="$options.name">
  <div class="markdown-content">
    <component :is="which"></component>
  </div>
</div>
</template>
