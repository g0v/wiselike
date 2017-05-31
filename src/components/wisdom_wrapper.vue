<template lang="pug">
  .component(v-if='userId')

    .wisdom(v-if='!wisdoms.length')
      h3 no wisdom here...

    .wisdom(v-else)
      p(v-if='type === "private"') 等待回答
      p(v-else) 歷史問題
        span(style='float:right')
          el-tooltip(placement='left')
            div(slot='content') auto-loading?
            el-switch(on-text="on", off-text="off", v-model="autoload")
      //- get one wisdom at once by id
      wisdom(v-for='(wisdom, idx) of wisdoms', :type='type', :key='idx', :userId='userId', :topicId='wisdom')

    //- load more button
    el-button.loader(type="primary", v-on:click="loadWisdom", v-loading="loading", v-show="loadmore")
      i.el-icon-arrow-down

  .component(v-else)
    h1 no such userId
</template>

<script>
  import axios from 'axios'
  import wisdom from './Wisdom.vue'
  // import wisdomprivate from './Wisdom_Private.vue'
  // import wisdomreply from './Wisdom_Reply.vue'
  export default {
    name: 'wisdomWrapper',
    props: ['userId', 'type'],
    components: {
      wisdom
      // wisdomprivate
      // wisdomreply
    },
    data () {
      return {
        wisdoms: [],
        newTopics: [],
        page: 0,
        loadBegin: 0,
        loading: false,
        loadmore: false,
        autoload: true,
        routePosId: 0
      }
    },
    computed: {
      profileLink: function () {
        return (this.type === 'public')
          ? 'https://talk.pdis.nat.gov.tw/c/wiselike/profile-' + this.userId + '/l/latest.json?page='
          : 'https://talk.pdis.nat.gov.tw/c/wiselike/inbox-' + this.userId + '/l/latest.json?page='
      }
    },
    methods: {
      getUserData: async function () {
        /* reset init data like init() */
        Object.assign(this.$data, this.$options.data())
        /* check user */
        this.local_storage = window.localStorage

        // if (this.type === 'private' && this.local_storage.username !== this.userId) return

        /* check userid ready */
        if (this.userId) {
          // await this.activityRoute()
          /* get all topics of user except meta */
          this.newTopics = await this.getDiscussionCategory(this.profileLink + this.page)
          await this.loadWisdom()
        }
      },
      // activityRoute: async function () {
      //   if (this.type === 'public' && isNaN(this.$route.hash) === true) {
      //     // this.wisdoms = []
      //     this.routePosId = Number(this.$route.hash.replace(/#/, ''))
      //     axios.get('https://talk.pdis.nat.gov.tw/t/' + this.routePosId + '.json?include_raw=1').then((val) => {
      //       let pos = []
      //       pos[0] = val
      //       this.topic2wisdom(pos)
      //     })
      //   }
      // },
      loadWisdom: async function () { // lazyload
        // let topics = []
        let total = this.newTopics.length
        let remain = total - this.loadBegin
        /* show load button */
        this.loadmore = (remain > 0)
        /* check if only 1 topic remains, then load 1; otherwise load 2 */
        let loadStep = (remain === 1) ? 1 : 2
        /* get topics */
        this.loading = true
        let len = this.loadBegin
        if (this.loadmore === true) {
          for (let i = this.loadBegin; i < (len + loadStep); i++) {
            // let topic = await this.getDiscussionTopic(this.newTopics, i)
            // if (topic !== null) topics.push(topic)
            this.wisdoms.push(this.newTopics[i].id)
            this.loadBegin++
          }
        }
        // await this.topic2wisdom(topics)
        this.loading = false
        /* get topic list from next page of category */
        if (this.loadBegin === total && total !== 0) {
          this.loadBegin = 0
          this.page += 1
          this.newTopics = await this.getDiscussionCategory(this.profileLink + this.page)
        }
      },
      getDiscussionCategory: async function (url) { // 抓取作者全部的category
        return new Promise((resolve, reject) => {
          axios.get(url).then((val) => {
            let topics = val['data']['topic_list']['topics']
            /* drop first meta topic */
            topics = topics.slice(1)
            resolve(topics)
          })
        })
      },
      // getDiscussionTopic: async function (url, i) { // 抓topic
      //   return new Promise((resolve, reject) => {
      //     let id = url
      //     if (id[i].id !== this.routePosId) {
      //       axios.get('https://talk.pdis.nat.gov.tw/t/' + id[i].id + '.json?include_raw=1').then((val) => {
      //         resolve(val)
      //       })
      //     } else {
      //       resolve(null)
      //     }
      //   })
      // },
      // topic2wisdom: async function (topics) {
      //   let tempWisdoms = []
      //   for (let topic of topics) {
      //     let wisdom = {
      //       posts: [],
      //       title: '',
      //       topicId: 0,
      //       category: ''
      //     }
      //     for (let post of topic.data.post_stream.posts) {
      //       let wisdomPost = {
      //         content: '',
      //         author: '',
      //         time: '',
      //         icon: ''
      //       }
      //       wisdomPost.content = post.cooked
      //       wisdomPost.author = post.username
      //       wisdomPost.time = post.created_at.replace(/T.*/, '')
      //       if (post['avatar_template'].indexOf('https:') === -1) {
      //         wisdomPost.icon = 'https://talk.pdis.nat.gov.tw' + post.avatar_template.replace(/{size}/, '100')
      //       }
      //       wisdom.posts.push(wisdomPost)
      //     }
      //     wisdom.title = topic.data.title
      //     wisdom.topicId = topic.data.id
      //     wisdom.category = this.type
      //     tempWisdoms.push(wisdom)
      //   }
      //   this.wisdoms = this.wisdoms.concat(tempWisdoms)
      // },
      /* trigger 'load more' when window scroll to bottom */
      hitLoad: function () {
        let wBottom = window.pageYOffset + window.innerHeight
        /* cross-browser highest document finding */
        let dHeight = Math.max(
          document.body.scrollHeight, document.documentElement.scrollHeight,
          document.body.offsetHeight, document.documentElement.offsetHeight,
          document.body.clientHeight, document.documentElement.clientHeight
        )
        /* check if scroll to bottom */
        if (wBottom === dHeight && this.autoload) {
          this.loadWisdom()
        }
      }
    },
    watch: {
      userId: function () {
        this.getUserData()
      }
    },
    created: function () {
      this.getUserData()
      /* bind event 'scroll' to window */
      if (this.type === 'public') {
        window.addEventListener('scroll', this.hitLoad)
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
.component {
  margin: 2em auto;
  max-width: $maxWidth;
  @media all and (max-width: $breakpoint) {
    margin: 2em 3ch;
  }
  .text {
    font-size: 1em;
  }
  .item {
    padding: 18px 0;
  }
  .el-card__body {
      background-color: linen;
      padding: 20px;
  }
  .box-card {
    line-height: 2em;
    width: 100%;
    margin-bottom: 2em;
    img.avatar {
      width: 5%;
      vertical-align: middle;
      margin-right: 1em;
      border-radius: 50%;
    }
    .el-dialog__title{
      margin-right: 1em;
    }
    .sereply{
      margin-left:3em;
    }
    .el-textarea {
      display: inline-block;
      width: 88%;
      vertical-align: bottom;
    }
  }
  .loader {
    font-size: large;
    height: 3em;
    width: 100%;
  }
}

</style>
