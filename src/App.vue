<template lang="pug">
  #app
    Header(:users="users")
    router-view.view(:users="users")
    Footer
</template>
<script>
  import Header from './components/Header.vue'
  import Footer from './components/Footer.vue'
  import axios from 'axios'
  export default {
    name: 'app',
    components: {
      Header,
      Footer
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
          tmp['userIcon'] = 'https://talk.pdis.nat.gov.tw' + val['avatar_template'].replace(/{size}/, '100')
          tmp['userDesc'] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque viverra lobortis lectus, vel hendrerit nulla finibus in. Curabitur pharetra neque lectus.' // val['description']
          tmp['userBg'] = 'https://images.unsplash.com/photo-1440397699230-0a8b8943a7bd?dpr=1&auto=compress,format&fit=crop&w=767&h=512&q=80&cs=tinysrgb&crop=&bg=' // val['background']
          this.users.push(tmp)
        })
      })
    }
  }
</script>

<style lang="scss" scoped>
  #app {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft JhengHei", "微軟正黑體", Arial, sans-serif;
    display: flex;
    flex-flow: column nowrap;
    min-height: 100vh;
    .view {
      flex: 1 1 0;
    }
  }
</style>
