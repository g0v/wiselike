<template lang="pug">
  #app
    Navbar.header(:users="users")
    transition(name='fade', mode='out-in')
      router-view.view(:users="users", :topics="topicList")
    el-button.page-up(@click='goAnchor', icon='arrow-up', size='large')
    Foot.footer
</template>
<script>
  import es6promise from 'es6-promise'
  import Navbar from './components/Header.vue'
  import Foot from './components/Footer.vue'
  import axios from 'axios'
  // import config from '../config'
  import $ from 'jquery'
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
      goAnchor: function (anchor) {
        $('html, body').animate({
          scrollTop: 0
        }, 1000)
      },
      getAllUser: function () {
        axios.get('https://talk.pdis.nat.gov.tw/groups/wiselike/members.json?limit=100000')
        .then((Users) => {
          let allUsers = Users.data.members
          // let
          // console.log(allUsers)
          for (let users of allUsers) {
            let user = {
              id: '',
              name: '',
              nickname: '',
              avatar: ''
            }
            user.id = users.id
            user.name = users.username
            user.avatar = 'https://talk.pdis.nat.gov.tw' + users.avatar_template.replace(/{size}/, '200')
            /* check users.name data */
            users.name !== '' ? (user.nickname = users.name) : (user.nickname = users.username)
            this.users.push(user)
            // console.log(user)
          }
        })
        // axios.get(config.runtime.proxyHost + '/users')
        // .then((subCategory) => { // get user list
        //   let Category = subCategory.data
        //   let allProfile = []
        //   Category.forEach((Profile) => {
        //     if (Profile['name'].indexOf('profile-') > -1) allProfile.push(Profile)
        //   })
        //   /* sort by topic count */
        //   this.topStar = allProfile.sort((a, b) => { return a.topic_count - b.topic_count }).reverse()
        // })
      },
      // getUser: function () {
      //   axios.get(config.runtime.proxyHost + '/users').then((response) => { // get user list
      //     var users = response.data
      //     this.users = []
      //     users.forEach((val) => {
      //       var tmp = {}
      //       if (val['slug'].indexOf('profile-') > -1) {
      //         tmp['Id'] = val['id']
      //         tmp['description'] = val['description']
      //         tmp['userId'] = val['slug'].substring(8)
      //         tmp['topic_url'] = val['topic_url']
      //         tmp['topic_count'] = val['topic_count']
      //         axios.get('https://talk.pdis.nat.gov.tw/c/wiselike/' + val['slug'] + '.json').then((response) => {
      //           var tags = response.data.topic_list.tags
      //           for (var i in tags) {
      //             tags[i] = tags[i].split('-')[1]
      //           }
      //           tmp['userCategory'] = tags
      //           axios.get('https://talk.pdis.nat.gov.tw/users/' + tmp['userId'] + '.json').then((response) => {
      //             var user = response.data.user
      //             var tmp2 = {}
      //             tmp2['Id'] = tmp['userId']
      //             tmp2['userId'] = user['username'] // 英文名
      //             tmp2['userName'] = (user['name']) ? user['name'] : user['username'] // 中文名
      //             tmp2['userIcon'] = 'https://talk.pdis.nat.gov.tw' + user['avatar_template'].replace(/{size}/, '1000')
      //             tmp2['userDescription'] = tmp['description']
      //             tmp2['topic_count'] = tmp['topic_count']
      //             tmp2['userCategory'] = tmp['userCategory']
      //             if (user.profile_background === undefined) {
      //               tmp2['userBg'] = 'https://images.unsplash.com/photo-1484199408980-5918a796a53f?dpr=1&auto=compress,format&fit=crop&w=1199&h=776&q=80&cs=tinysrgb&crop=&bg='
      //             } else {
      //               tmp2['userBg'] = 'https://talk.pdis.nat.gov.tw' + user.profile_background
      //             }
      //             tmp2['topic_url'] = tmp['topic_url']
      //             this.users.push(tmp2)
      //           })
      //         })
      //         // this.users.sort(function (a, b) { return a.topic_count - b.topic_count })
      //       }
      //     })
      //   })
      // },
      getActivity: function () {
        /* get recent activity */
        // axios.get('https://talk.pdis.nat.gov.tw/c/wiselike.json')
        //   .then((response) => {
        //     /* get a list of topics under one category */
        //     var topics = response.data.topic_list.topics
        //     var tags = response.data.topic_list.tags
        //     var all = '全部'
        //     for (var i in tags) {
        //       tags[i] = tags[i].split('-')[1]
        //     }
        //     tags.unshift(all)
        //     this.tags = tags
        //     let newTopicsFilter = []
        //     topics.map((topic) => {
        //       let newTopic = {}
        //       newTopic.title = topic.title
        //       newTopic.userName = topic.last_poster_username
        //       newTopic.id = topic.id
        //       newTopic.category = topic.category_id
        //       /* filter posts_count > 1 */
        //       if (topic.posts_count > 1 && newTopicsFilter.length < 10) {
        //         newTopicsFilter.push(newTopic)
        //       }
        //     })
        //     /* drop first topic which is actually meta */
        //     this.topicList = newTopicsFilter
        //     /* find the profile owner by category id from each topic */
        //     return Promise.all(newTopicsFilter.map((topic) => axios.get('https://talk.pdis.nat.gov.tw/c/wiselike/' + topic.category + '.json')))
        //   }).then((responses) => {
        //     for (let res of responses) {
        //       /* sort the topics and then get the oldest one(meta) */
        //       let first = res.data.topic_list.topics.sort((a, b) => a.id - b.id)[0]
        //       /* split profile-username -> username */
        //       let user = first.slug.split('-')[1]
        //       /* pop out one topic, modify, then push back */
        //       let oldTopic = this.topicList.splice(0, 1)
        //       oldTopic[0].profile = user
        //       this.topicList.push(oldTopic[0])
        //     }
        //   }).catch(err => console.log('getActivity error: ' + err))
      }
    },
    mounted: function () {
      // this.getUser()
      this.getAllUser()
      // this.getActivity()
    },
    created: function () {
      /* axios for IE11 */
      es6promise.polyfill()
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
    flex: 1 1 auto; /* ie11 hates 0px */
    // padding: 0 0 0 0;

  }
  .footer {
    flex: 0 0 7rem;
    // background: $lightblack;
    text-align: center;
    border-top: 1px solid lightgray;
    width: 100%; /* fix for ie11 */
  }
  .page-up {
    background-color: #324157;
    position: fixed;
    color: white;
    right: 0.5em;
    bottom: 1em;
    width: 2.5em;
    height: 2.5em;
    border-radius: 2.5em;
    cursor: pointer;
    font-size: 1.5em;
    opacity: 1;
    -webkit-transition: .3s;
    transition: .3s;
    z-index: 999;
  }
}
</style>
