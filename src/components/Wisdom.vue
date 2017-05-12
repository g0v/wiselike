<template lang="pug">

  el-card.box-card
    .clearfix(slot='header')
      h2
        i.el-icon-caret-right
        | {{content.title}}

    .text.item(v-for='(post, index) of content.posts', :class="{sereply: index >= 2}")
      p
        img.avatar(:src='post.icon')
        span.el-dialog__title
          | {{post.author}}
          span(v-if="index === 0")
            |  提問
          span(v-else)
            |  回應
            sup  {{post.time}}
      p.sereply(v-html='post.content')

    wisdomreply(:userId='userId', :topicid='content.topicid', :slug='undefined', :categoryId='undefined')

</template>

<script>
  // import axios from 'axios'
  import wisdomprivate from './Wisdom_Private.vue'
  import wisdomreply from './Wisdom_Reply.vue'
  export default {
    name: 'wisdom',
    props: ['content', 'userId'],
    components: {
      wisdomprivate,
      wisdomreply
    },
    data () {
      return {
        wisdomPublic: {
          title: [],
          icon: [],
          content: [],
          author: [],
          time: [],
          topicid: []
        },
        page: 0,
        lazyload_count: 0,
        Pubilc_Category: [],
        loading: false,
        loadmore: false,
        autoload: true,
        ProfileCategoryId: ''
      }
    }
    // computed: {
    //   profileLink: function () {
    //     return 'https://talk.pdis.nat.gov.tw/c/wiselike/profile-' + this.userId
    //   }
    // },
    // methods: {
    //   getUserData: async function () {
    //     /* reset init data like init() */
    //     Object.assign(this.$data, this.$options.data())
    //     this.Pubilc_Category = await this.getDiscussion_Category(this.profileLink + '.json?page=0')
    //     await this.Lazy_Pubilc()
    //   },
    //   Lazy_Pubilc: async function (val) { // lazyload
    //     let topic = []
    //     let standard = Number
    //     let PubilcCategorylength = this.Pubilc_Category.data.topic_list.topics.length
    //     let remain = PubilcCategorylength - this.lazyload_count
    //     this.loadmore = (PubilcCategorylength > 0)
    //     /* check how many topics remain */
    //     remain === 1
    //       ? ((this.lazyload_count += 1), (standard = 1))
    //       : ((this.lazyload_count += 2), (standard = 2))
    //     /* determine if topics are all fetched */
    //     if (this.loadmore === true) {
    //       this.loading = true
    //       for (let i = (this.lazyload_count - standard); i < this.lazyload_count; i++) {
    //         let topicdata = await this.getDiscussion_Topic(this.Pubilc_Category, i)
    //         topic.push(topicdata)
    //         this.loading = false
    //       }
    //     }
    //     await this.Data_Processing(topic)
    //     if (this.lazyload_count === PubilcCategorylength) {
    //       this.lazyload_count = 0
    //       this.page += 1
    //       this.Pubilc_Category = await this.getDiscussion_Category(this.profileLink + '/l/latest.json?page=' + this.page)
    //     }
    //   },
    //   getDiscussion_Category: function (url) { // 抓取作者全部的category
    //     return new Promise((resolve, reject) => {
    //       axios.get(url).then((val) => {
    //         (val['data']['topic_list']['topics'].length > 0) && (this.ProfileCategoryId = val['data']['topic_list']['topics'][0]['category_id'])
    //         val['data']['topic_list']['topics'] = val['data']['topic_list']['topics'].slice(1)
    //         // val['data']['topic_list']['topics'] = val['data']['topic_list']['topics'].filter((post) => {
    //         //   return post.posts_count > 1
    //         // })
    //         resolve(val)
    //       })
    //     })
    //   },
    //   getDiscussion_Topic: async function (url, i) { // 抓topic
    //     return new Promise((resolve, reject) => {
    //       let id = url['data']['topic_list']['topics']
    //       axios.get('https://talk.pdis.nat.gov.tw/t/' + id[i].id + '.json?include_raw=1').then((val) => {
    //         resolve(val)
    //       })
    //     })
    //   },
    //   Data_Processing: function (topic) {
    //     for (let i in topic) {
    //       let content = []
    //       let icon = []
    //       let author = []
    //       let time = []
    //       for (let j in topic[i]['data']['post_stream']['posts']) {
    //         content.push(topic[i]['data']['post_stream']['posts'][j]['cooked'])
    //         author.push(topic[i]['data']['post_stream']['posts'][j]['username'])
    //         time.push(topic[i]['data']['post_stream']['posts'][j]['created_at'].replace(/T.*/, ''))
    //         if (topic[i]['data']['post_stream']['posts'][j]['avatar_template'].indexOf('https:') === -1) {
    //           icon.push('https://talk.pdis.nat.gov.tw' + topic[i]['data']['post_stream']['posts'][j]['avatar_template'].replace(/{size}/, '100'))
    //         }
    //       }
    //       this.wisdomPublic.title.push(topic[i]['data']['title'])
    //       this.wisdomPublic.content.push(content)
    //       this.wisdomPublic.author.push(author)
    //       this.wisdomPublic.time.push(time)
    //       this.wisdomPublic.icon.push(icon)
    //       this.wisdomPublic.topicid.push(topic[i]['data']['id'])
    //     }
    //   },
    //   /* trigger 'load more' when window scroll to bottom */
    //   hitLoad: function () {
    //     let wBottom = window.pageYOffset + window.innerHeight
    //     /* cross-browser highest document finding */
    //     let dHeight = Math.max(
    //       document.body.scrollHeight, document.documentElement.scrollHeight,
    //       document.body.offsetHeight, document.documentElement.offsetHeight,
    //       document.body.clientHeight, document.documentElement.clientHeight
    //     )
    //     /* check if scroll to bottom */
    //     if (wBottom === dHeight && this.autoload) {
    //       this.Lazy_Pubilc()
    //     }
    //   }
    // },
    // watch: {
    //   userId: function () {
    //     this.getUserData()
    //   }
    // },
    // created: function () {
    //   this.getUserData()
    //   /* bind event 'scroll' to window */
    //   window.addEventListener('scroll', this.hitLoad)
    // }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
// .wisdom {
//   margin: 3em auto;
//   max-width: $maxWidth;
//   @media all and (max-width: $breakpoint) {
//     margin: 3em 3ch;
//   }
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
    // .el-dialog__title{
    //   font-size:1.5rem;
    // }
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
// }

</style>
