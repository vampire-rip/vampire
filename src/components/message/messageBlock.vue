<script>
import {mapState, mapMutations} from 'vuex';

export default {
  name: 'message-block',
  data() {
    return {};
  },
  props: ['id', 'source', 'content'],
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
</style>

<template>
<div :id="$options.name" :class="$options.name">
  <div style="display: flex"><b>来自 {{source}} 的消息：</b><div class="delete" style="margin-left: auto"></div></div>
  <div class="content">{{content}}</div>
</div>
</template>
