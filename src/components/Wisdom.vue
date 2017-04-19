<template lang="pug">
  .wisdom(v-if='userId')
    wisdomprivate(:userId='userId')
    p(v-if="wisdom_Pubilc.content.length > 0") 歷史問題
    .pubilc(v-for='(item, contentindex) in wisdom_Pubilc.content')
      el-card.box-card
        .clearfix(slot='header')
          span(style='line-height: 36px;')
          img(:src='wisdom_Pubilc.icon[contentindex][0]')
          span.el-dialog__title {{wisdom_Pubilc.aouther[contentindex][0]}}
          span 提問:
          h2 {{wisdom_Pubilc.title[contentindex]}}
          p(v-html='wisdom_Pubilc.content[contentindex][0]')
        .text.item(v-for='(item, index) in wisdom_Pubilc.content[contentindex]',v-if='index!=0',v-bind:class="{sereply: index>=2}")
          img(:src='wisdom_Pubilc.icon[contentindex][index]')
          span.el-dialog__title {{wisdom_Pubilc.aouther[contentindex][index]}}
          span 回應: {{wisdom_Pubilc.time[contentindex][index]}}
          span.sereply(v-html='wisdom_Pubilc.content[contentindex][index]')
        el-input.sereply(type='textarea', autosize='', placeholder='我要回應...')
    el-button.loader(type="primary", v-on:click="Lazy_Pubilc", v-loading="loading", v-show="loadmore")
      | load more
  .wisdom(v-else)
    h1 no such userId

</template>

<script>
  import axios from 'axios'
  import wisdomprivate from './Wisdom_Private.vue'
  export default {
    name: 'wisdom',
    props: ['userId'],
    components: {
      wisdomprivate
    },
    data () {
      return {
        wisdom_Pubilc: {
          title: [],
          icon: [],
          content: [],
          aouther: [],
          time: []
        },
        page: 0,
        lazyload_count: 0,
        Pubilc_Category: [],
        loading: false,
        loadmore: false
        // self: false
      }
    },
    computed: {
      profileLink: function () {
        // return (this.userId !== null) && ('https://talk.pdis.nat.gov.tw/c/wiselike/profile-' + this.userId)
        return 'https://talk.pdis.nat.gov.tw/c/wiselike/profile-' + this.userId
      }
    },
    methods: {
      getUserData: async function () {
        /* reset init data like init() */
        Object.assign(this.$data, this.$options.data())
        this.Pubilc_Category = await this.getDiscussion_Category(this.profileLink + '.json?page=0')
        await this.Lazy_Pubilc()
      },
      Lazy_Pubilc: async function (val) { // lazyload
        let topic = []
        let standard = Number
        let length = this.Pubilc_Category.data.topic_list.topics.length
        let remain = length - this.lazyload_count
        /* determine if topics are all fetched */
        this.loadmore = (length > 0)
        /* check how many topics remain */
        remain === 1
          ? ((this.lazyload_count += 1), (standard = 1))
          : ((this.lazyload_count += 2), (standard = 2))
        if (this.loadmore === true) {
          this.loading = true
          for (let i = (this.lazyload_count - standard); i < this.lazyload_count; i++) {
            let topicdata = await this.getDiscussion_Topic(this.Pubilc_Category, i)
            topic.push(topicdata)
            this.loading = false
          }
        }
        await this.Data_Processing(topic, true)
        if (this.lazyload_count === length) {
          this.lazyload_count = 0
          this.page += 1
          this.Pubilc_Category = await this.getDiscussion_Category(this.profileLink + '/l/latest.json?page=' + this.page)
        }
      },
      getDiscussion_Category: function (url) { // 抓取作者全部的category
        return new Promise((resolve, reject) => {
          axios.get(url).then((val) => {
            val['data']['topic_list']['topics'] = val['data']['topic_list']['topics'].slice(1)
            val['data']['topic_list']['topics'] = val['data']['topic_list']['topics'].filter((post) => {
              return post.posts_count > 1
            })
            resolve(val)
          })
        })
      },
      getDiscussion_Topic: async function (url, i) { // 抓topic
        return new Promise((resolve, reject) => {
          let id = url['data']['topic_list']['topics']
          axios.get('https://talk.pdis.nat.gov.tw/t/' + id[i].id + '.json?include_raw=1').then((val) => {
            resolve(val)
          })
        })
      },
      Data_Processing: function (topic, pubilc) {
        for (let i in topic) {
          let content = []
          let icon = []
          let aouther = []
          let time = []
          for (let j in topic[i]['data']['post_stream']['posts']) {
            content.push(topic[i]['data']['post_stream']['posts'][j]['cooked'])
            aouther.push(topic[i]['data']['post_stream']['posts'][j]['username'])
            time.push(topic[i]['data']['post_stream']['posts'][j]['created_at'].replace(/T.*/, ''))
            if (topic[i]['data']['post_stream']['posts'][j]['avatar_template'].indexOf('https:') === -1) {
              icon.push('https://talk.pdis.nat.gov.tw' + topic[i]['data']['post_stream']['posts'][j]['avatar_template'].replace(/{size}/, '100'))
            }
          }
          if (pubilc === true) {
            this.wisdom_Pubilc.title.push(topic[i]['data']['title'])
            this.wisdom_Pubilc.content.push(content)
            this.wisdom_Pubilc.aouther.push(aouther)
            this.wisdom_Pubilc.time.push(time)
            this.wisdom_Pubilc.icon.push(icon)
          }
        }
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
        if (wBottom === dHeight) {
          this.Lazy_Pubilc()
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
      window.addEventListener('scroll', this.hitLoad)
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
.wisdom {
  margin: 3em auto;
  max-width: $maxWidth;
}
.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}
.box-card {
  line-height: 2em;
  width: 100%;
  margin-bottom: 2em;
  img {
    width: 5%;
    vertical-align: middle;
    margin-right: 1em;
  }
  .el-dialog__title{
    margin-right: 1em;
  }
  .sereply{
    margin-left:3em;
  }
  .el-dialog__title{
    font-size:1.5rem;
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

</style>
