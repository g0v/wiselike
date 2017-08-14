<template lang="pug">
  #wisdomcomponent(v-if='userId')

    .wisdom(v-if='!wisdoms.length')
      p 空空如也

    .wisdom(v-else)
      //- p(v-if='type === "private"') 等待回答
      //- p(v-else) 歷史問題
      p {{ title[type] }}
        span(style='float:right')
          el-tooltip(placement='left')
            div(slot='content') auto-loading?
            el-switch(on-text="on", off-text="off", v-model="autoload")
      //- get one wisdom at once by id
      wisdom(v-if='!addNewtopic', v-for='(wisdom, idx) of wisdoms', :type='type', :key='idx', :userId='userId', :topicId='wisdom')
      wisdom(v-if='addNewtopic', v-for='(wisdom, idx) of wisdoms', :type='type', :key='idx', :userId='userId', :topicId='wisdom')
    //- load more button
    el-button.loader(type="primary", v-on:click="loadWisdom", v-loading="loading", v-show="loadmore")
      i.el-icon-arrow-down

</template>

<script>
  import LocalStorage from '../js/LocalStorage.js'
  import axios from 'axios'
  import wisdom from './Wisdom.vue'
  export default {
    name: 'wisdomWrapper',
    props: ['userId', 'type', 'topicId'],
    components: {
      wisdom
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
        routePosId: 0,
        title: {private: '等待回答', public: '歷史問題'},
        addNewtopic: false
      }
    },
    computed: {
      profileLink: function () {
        return (this.type === 'public')
          ? 'https://talk.pdis.nat.gov.tw/c/wiselike/profile-' + this.userId.toLowerCase().replace(/_/g, '-') + '/l/latest.json?page='
          : 'https://talk.pdis.nat.gov.tw/c/wiselike/inbox-' + this.userId.toLowerCase().replace(/_/g, '-') + '/l/latest.json?page='
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
          /* get local storage delete data */
          await this.loadWisdom()
        }
      },
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
            this.wisdoms.push(this.newTopics[i].id)
            this.loadBegin++
          }
        }
        this.loading = false
        /* get topic list from next page of category */
        if (this.loadBegin === total && total !== 0 && total > 28) {
          this.loadBegin = 0
          this.page += 1
          this.newTopics = await this.getDiscussionCategory(this.profileLink + this.page)
        }
      },
      getDiscussionCategory: async function (url) { // 抓取作者全部的category
        return new Promise((resolve, reject) => {
          let vm = this
          axios.get(url).then(async function (val) {
            let topics = val['data']['topic_list']['topics']

            /* drop first meta topic */
            let topicsFilter = []
            topics = topics.slice(1)

            if (vm.type === 'myQuestion') {
              /* previous question */
              let topicsNameFilter = topics
              topics = []
              /* keep author */
              topicsNameFilter.filter((data) => {
                if (vm.local_storage.username === data.last_poster_username.toLowerCase()) {
                  topics.push(data)
                }
              })
              topicsFilter = await LocalStorage.LocalStorageFilter(topics)
            }
            if (vm.type === 'private') {
            /* private question need check localstorage delete data, can't be repeated and Ask data need check */
              topicsFilter = await LocalStorage.LocalStorageFilter(topics)
              /* notification question */
              if (topicsFilter.length > 0) {
                vm.$bus.emit('from-wisdom-wrapper-infor', {
                  type: 'private',
                  topicid: topicsFilter.length
                })
              }
            } else if (vm.type === 'public') {
              /* filter reapt post */
              topicsFilter = []
              topics.filter((id) => {
                if (vm.topicId !== id.id) {
                  topicsFilter.push(id)
                }
              })
            }
            resolve(topicsFilter)
          })
        })
      },

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
      },
      topicId: function () {
        this.getUserData()
        this.addNewtopic = true
      }
    },
    created: function () {
      this.getUserData()
      /* bind event 'scroll' to window */
      window.addEventListener('scroll', this.hitLoad)
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
#wisdomcomponent {
  // margin: 2em auto;
  // max-width: $maxWidth;
  @media all and (max-width: $breakpoint) {
    margin: 2em 3ch;
  }
  @media all and (max-width: $mobilebreakpoint) {
    margin: 0.5em !important;
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
