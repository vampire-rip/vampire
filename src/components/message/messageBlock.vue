<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'message-block',
  data () {
    return {}
  },
  props: ['id', 'source', 'content', 'type'],
  beforeMount () {

  },
  mounted () {
    setTimeout(this.deleteSelf, 5500)
  },
  destroyed () {

  },
  computed: {
    ...mapState({}),
    isError () {
      return this.$props.error
    }
  },
  methods: {
    ...mapMutations({}),
    deleteSelf () {
      return this.$root.deleteMessage(this.$props.id)
    },
    handleClick () {
      if (this.type === 'refresh') { return history.go(0) }
      return this.deleteSelf()
    }
  }
}
</script>
<!-- vue-loader's scoped css won't work with style-loader -->
<style scoped lang="scss">
.message-block {
  pointer-events: all;
  display: flex;
  position: relative;
  flex: 0 1 auto;
  min-height: 80px;
  padding: 14px 14px;
  margin: 10px 10px;
  background: #BDE2ED;
  opacity: 0.8;
  color: #115977;
  justify-content: space-around;
  flex-direction: column;
  transition: all 0.5s ease-in-out;
  &:active {
    transform: scale(1.1);
  }
  &:hover {
    box-shadow: 0 0 10px 2px #115977;
    border-radius: 5px;
    opacity: 1;
  }
  &.is-error{
    background-color: #fff5f7;
    color: #cd0930;
    &:hover {
      box-shadow: 0 0 10px 2px #cd0930;
    }
  }
  &.is-warning{
    background-color: honeydew;
    color: goldenrod;
    &:hover {
      box-shadow: 0 0 10px 2px goldenrod;
    }
  }
  &.is-success{
    background-color: paleturquoise;
    color: forestgreen;
    &:hover {
      box-shadow: 0 0 10px 2px forestgreen;
    }
  }
}
</style>

<template>
<div :id="$options.name" :class="[$options.name, `is-${type}`]" @click="handleClick">
  <div style="display: flex"><b>来自 {{source}} 的消息：</b>
    <div class="delete" style="margin-left: auto" @click="deleteSelf"></div>
  </div>
  <div class="content" v-html="content"></div>
</div>
</template>
