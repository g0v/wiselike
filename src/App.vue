<template lang="pug">
  #app
    Header(:users="users")
    router-view.view(:users="users", :topics="topicList")
    Footer
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
            tmp['userId'] = val['slug'].substring(8)
            axios.get('https://talk.pdis.nat.gov.tw/c/wiselike/' + tmp['Id'] + '.json').then((response) => {
              var user = response.data.users
              user.forEach((o) => {
                var tmp2 = {}
                if (tmp['userId'] === o['username']) {
                  tmp2['userId'] = o['username']
                  tmp2['userIcon'] = 'https://talk.pdis.nat.gov.tw' + o['avatar_template'].replace(/{size}/, '100')
                  tmp2['userDesc'] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque viverra lobortis lectus, vel hendrerit nulla finibus in. Curabitur pharetra neque lectus.' // val['description']
                  tmp2['userBg'] = 'https://images.unsplash.com/photo-1440397699230-0a8b8943a7bd?dpr=1&auto=compress,format&fit=crop&w=767&h=512&q=80&cs=tinysrgb&crop=&bg=' // val['background']
                  this.users.push(tmp2)
                }
              })
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
