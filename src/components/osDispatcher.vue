<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'osDispatcher',
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

    })
  }
}
</script>
<!-- vue-loader's scoped css won't work with style-loader -->
<style scoped lang="scss">
.osDispatcher {
  overflow-x: hidden;
}
.tile.is-child {
  padding: 1rem 2rem;

  border-radius: 4px;
  border-style: solid;
  border-width: 0 0 0 4px;

  & > .title{
    font-size: 1.5rem!important;
    margin-bottom: 1rem;
  }
  & > .subtitle {

  }
  &:first-child {
    border-color: #209cee;
    color: #12537e;
    background-color: #f6fbfe;
  }
  &:nth-child(2) {
    border-color: #23d160;
    color: #0e301a;
    background-color: #f6fef9;
  }
  &:nth-child(3) {
    border-color: #ffdd57;
    color: #3b3108;
    background-color: #fffdf5;
  }
}
.osDispatcher {
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  align-items: center;
}
</style>

<template>
  <div :id="$options.name" :class="$options.name">
    <div class="tile is-ancestor is-12"  style="justify-content: center; width: 100%; overflow: hidden">
      <div class="tile is-6 is-vertical is-parent" style="overflow: hidden">
        <router-link to="/os/lab3" tag="div" class="tile is-child">
          <p class="title">Lab 3</p>
          <p class="subtitle">User Environment <br/> 用户进程</p>
        </router-link>
        <router-link to="/os/lab4" tag="div" class="tile is-child">
          <p class="title">Lab 4</p>
          <p class="subtitle">Preemptive Multitasking <br/> 抢占式多任务处理</p>
        </router-link>
        <router-link to="/os/lab5" tag="div" class="tile is-child">
          <p class="title">Lab 5</p>
          <p class="subtitle">File system, Spawn and Shell <br/> 文件系统，Spawn 和 Shell</p>
        </router-link>
      </div>
    </div>
  </div>
</template>
