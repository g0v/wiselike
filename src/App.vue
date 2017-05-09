<template lang="pug">
  #app
    Navbar.header(:users="users")
    transition(name='fade', mode='out-in')
      router-view.view(:users="users", :topics="topicList", :tags="tags")
    Foot.footer
</template>
<script>
  import Navbar from './components/Header.vue'
  import Foot from './components/Footer.vue'
  import axios from 'axios'
  import config from '../config'
  export default {
    name: 'app',
    components: {
      Navbar,
      Foot
    },
    data () {
      return {
        users: [],
        topicList: [],
        tags: []
      }
    },
    methods: {
      getUser: function () {
        axios.get(config.runtime.proxyHost + '/users').then((response) => { // get user list
          var users = response.data
          this.users = []
          users.forEach((val) => {
            var tmp = {}
            if (val['slug'].indexOf('profile-') > -1) {
              tmp['Id'] = val['id']
              tmp['description'] = val['description']
              tmp['userId'] = val['slug'].substring(8)
              tmp['topic_url'] = val['topic_url']
              tmp['topic_count'] = val['topic_count']
              axios.get('https://talk.pdis.nat.gov.tw/c/wiselike/' + val['slug'] + '.json').then((response) => {
                var tags = response.data.topic_list
                tmp['userCategory'] = tags['tags'][0]
              })
              axios.get('https://talk.pdis.nat.gov.tw/users/' + tmp['userId'] + '.json').then((response) => {
                var user = response.data.user
                var tmp2 = {}
                tmp2['userId'] = user['username'] // 英文名
                tmp2['userName'] = (user['name'] !== null) ? user['name'] : user['username'] // 中文名
                tmp2['userIcon'] = 'https://talk.pdis.nat.gov.tw' + user['avatar_template'].replace(/{size}/, '100')
                tmp2['userDescription'] = tmp['description']
                tmp2['topic_count'] = tmp['topic_count']
                tmp2['userCategory'] = tmp['userCategory']
                tmp2['userBg'] = 'https://images.unsplash.com/photo-1440397699230-0a8b8943a7bd?dpr=1&auto=compress,format&fit=crop&w=767&h=512&q=80&cs=tinysrgb&crop=&bg='
                tmp2['topic_url'] = tmp['topic_url']
                this.users.push(tmp2)
              })
              // this.users.sort(function (a, b) { return a.topic_count - b.topic_count })
            }
          })
        })
      },
      getActivity: function () {
        /* get recent activity */
        axios.get('https://talk.pdis.nat.gov.tw/c/wiselike.json')
          .then((response) => {
            /* get a list of topics under one category */
            var topics = response.data.topic_list.topics
            var tags = response.data.topic_list.tags
            this.tags = tags
            let newTopics = topics.map((topic) => {
              let newTopic = {}
              newTopic.title = topic.title
              newTopic.userName = topic.last_poster_username
              newTopic.id = topic.id
              newTopic.category = topic.category_id
              return newTopic
            })
            /* drop first topic which is actually meta */
            newTopics = newTopics.slice(1)
            this.topicList = newTopics
            /* find the profile owner by category id from each topic */
            return Promise.all(newTopics.map((topic) => axios.get('https://talk.pdis.nat.gov.tw/c/wiselike/' + topic.category + '.json')))
          }).then((responses) => {
            let i = 0
            for (let res of responses) {
              /* sort the topics and then get the oldest one */
              let first = res.data.topic_list.topics.sort((a, b) => a.id - b.id)[0]
              /* split profile-username -> username */
              let user = first.slug.split('-')[1]
              this.topicList[i++].profile = user
            }
          }).catch(err => console.log('app error: ' + err))
      }
    },
    mounted: function () {
      this.getUser()
      this.getActivity()
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
  background: $bgcolor;
  .header {
    // flex: 0 0 3rem;
    position: absolute;
    width: 100%;
    // height: 3rem;
    z-index: 1000;
    // background: $back-color;
    // border-bottom: 1px solid lightgray;
  }
  .view {
    flex: 1 1 0;
    // padding: 0 0 0 0;
  }
  .footer {
    flex: 0 0 10rem;
    // background: $lightblack;
    text-align: center;
    border-top: 1px solid lightgray;
  }
}
</style>
