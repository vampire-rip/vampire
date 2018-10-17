<script>
import {mapState, mapMutations} from 'vuex';

export default {
  name: 'message-block',
  data() {
    return {};
  },
  props: ['id', 'source', 'content', 'error'],
  beforeMount() {

  },
  mounted() {
    setTimeout(this.deleteSelf, 5500);
  },
  destroyed() {

  },
  computed: {
    ...mapState({}),
    isError () {
      return this.$props.error
    }
  },
  methods: {
    ...mapMutations({}),
    deleteSelf() {
      return this.$root.deleteMessage(this.$props.id);
    },
  },
};

</script>
<!-- vue-loader's scoped css won't work with style-loader -->
<style scoped lang="scss">
.message-block {
  pointer-events: all;
  display: flex;
  position: relative;
  flex: 0 1 auto;
  min-height: 80px;
  padding: 10px 10px;
  margin: 10px 10px;
  border-width: 0 0 0 5px;
  border-style: solid;
  border-radius: 4px;
  background: #BDE2ED;
  border-color: #5BC0EB;
  color: #115977;
  justify-content: space-around;
  flex-direction: column;
}
.is-error {
  border-color: #ff3860;
  background-color: #fff5f7;
  color: #cd0930;
}
</style>

<template>
<div :id="$options.name" :class="[$options.name, {'is-error': isError}]">
  <div style="display: flex"><b>来自 {{source}} 的消息：</b>
    <div class="delete" style="margin-left: auto" @click="deleteSelf"></div>
  </div>
  <div class="content"> {{content}} </div>
</div>
</template>
