<template lang="pug">
  #app
    my-header
    router-view
</template>

<script>
  import myHeader from './components/Header.vue'

  export default {
    name: 'app',
    components: {
      myHeader
    }
  }
</script>

<style lang="scss" scoped>
  #app {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }
</style>
