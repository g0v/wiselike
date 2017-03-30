<template lang="pug">
  #app
    myHeader(:users="users")
    router-view
</template>

<script>
  import myHeader from './components/Header.vue'
  import axios from 'axios'
  export default {
    name: 'app',
    components: {
      myHeader
    },
    data () {
      return {
        users: []
      }
    },
    mounted: function () {
      axios.get('https://talk.pdis.nat.gov.tw/c/wiselike.json').then((response) => {
        var user = response.data.users
        user.forEach((val) => {
          var tmp = {}
          tmp['userId'] = val['username']
          this.users.push(tmp)
        })
      })
    }
  }
</script>

<style lang="scss" scoped>
  #app {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }
</style>
