<template lang="pug">
  #app
    Header.header(:users="users")
    router-view.view(:users="users", :topics="topicList")
    Footer.footer
</template>
<script>
  import Header from './components/Header.vue'
  import Footer from './components/Footer.vue'
  import axios from 'axios'
  import config from '../config'
  export default {
    name: 'app',
    components: {
      Header,
      Footer
    },
    data () {
      return {
        users: [],
        topicList: []
      }
    },
    mounted: function () {
      axios.get(config.runtime.proxyHost + '/users').then((response) => { // get user list
        var users = response.data
        users.forEach((val) => {
          var tmp = {}
          if (val['slug'].indexOf('profile-') > -1) {
            tmp['Id'] = val['id']
            tmp['description'] = val['description']
            tmp['userId'] = val['slug'].substring(8)
            tmp['topic_url'] = val['topic_url']
            axios.get('https://talk.pdis.nat.gov.tw/users/' + tmp['userId'] + '.json').then((response) => {
              var user = response.data.user
              var tmp2 = {}
              tmp2['userId'] = user['username'] // 英文名
              tmp2['userName'] = (user['name'] !== null) ? user['name'] : user['username'] // 中文名
              tmp2['userIcon'] = 'https://talk.pdis.nat.gov.tw' + user['avatar_template'].replace(/{size}/, '100')
              tmp2['userDescription'] = tmp['description']
              tmp2['userBg'] = 'https://images.unsplash.com/photo-1440397699230-0a8b8943a7bd?dpr=1&auto=compress,format&fit=crop&w=767&h=512&q=80&cs=tinysrgb&crop=&bg='
              tmp2['topic_url'] = tmp['topic_url']
              this.users.push(tmp2)
            })
          }
        })
      })
      axios.get('https://talk.pdis.nat.gov.tw/c/wiselike.json').then((response) => { // get recent activity
        var topics = response.data.topic_list.topics
        for (var i = 0; i < 10; i++) {
          var tmp = {}
          tmp['title'] = topics[i]['title']
          tmp['userName'] = topics[i]['last_poster_username']
          tmp['id'] = topics[i]['id']
          this.topicList.push(tmp)
        }
      })
    }
  }
</script>

<style lang="scss" scoped>
@import 'global.scss';
#app {
  // font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft JhengHei", "微軟正黑體", Arial, sans-serif;
  display: flex;
  flex-flow: column nowrap;
  min-height: 100vh;
  background: $back-color;
  .header {
    flex: 0 0 3rem;
    // background: $lightblack;
  }
  .view {
    flex: 1 1 0;
  }
  .footer {
    flex: 0 0 10rem;
    // background: $lightblack;
    text-align: center;
  }
}
</style>
