<template lang="pug">
  .wisdom_private
    div(v-if="wisdom_Private.content.length > 0") 
      p 等待回答
      el-collapse(v-model='activeName', accordion='')
        .pan(v-for='(item, contentindex) in wisdom_Private.content')
          el-collapse-item
            template(slot='title')
                | {{wisdom_Private.title[contentindex]}}
                i.notifi.header-icon.el-icon-information
            img(:src='wisdom_Private.icon[contentindex][0]')
            span.el-dialog__title {{wisdom_Private.aouther[contentindex][0]}}
            span &nbsp;&nbsp;提問:
            p(v-html='wisdom_Private.content[contentindex][0]')
            el-input.sereply(type='textarea', autosize='', placeholder='我要回應...')
      el-button.loader(type="primary",v-on:click="Lazy_Private", v-if='loadmore > 0')
        | 更多問題        
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'hello',
    props: ['userId'],
    components: {
    },
    data () {
      return {
        activeName: '1',
        wisdom_Private: {
          title: [],
          icon: [],
          content: [],
          aouther: [],
          time: []
        },
        page: 0,
        Private_Category: [],
        loadmore: ''
      }
    },
    computed: {
    },
    methods: {
      profile_PrivateLink: function (categoryid) {
        return 'https://talk.pdis.nat.gov.tw/tags/c/wiselike/profile-' + categoryid + '/尚未回覆.json'
      },
      getUserData: async function () {
        this.Private_Category = await this.getDiscussion_Category(this.profile_PrivateLink(this.userId) + '?page=0')
        await this.Lazy_Private()
      },
      Lazy_Private: async function () { // lazyload
        let topic = []
        for (let i = 0, length = this.Private_Category.data.topic_list.topics.length; i < length; i++) {
          let topicdata = await this.getDiscussion_Topic(this.Private_Category, i)
          topic.push(topicdata)
        }
        await this.Data_Processing(topic.reverse())
        this.page += 1
        this.Private_Category = await this.getDiscussion_Category(this.profile_PrivateLink(this.userId) + '?page=' + this.page)
        this.loadmore = this.Private_Category.data.topic_list.topics.length
      },
      getDiscussion_Category: function (url) { // 抓取作者全部的category
        return new Promise((resolve, reject) => {
          axios.get(url).then((val) => {
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
      Data_Processing: function (topic) {
        for (let i in topic) {
          let content = []
          let icon = []
          let aouther = []
          let time = []
          for (let j in topic[i]['data']['post_stream']['posts']) {
            content.push(topic[i]['data']['post_stream']['posts'][j]['cooked'])
            aouther.push(topic[i]['data']['post_stream']['posts'][j]['name'])
            time.push(topic[i]['data']['post_stream']['posts'][j]['created_at'].replace(/T.*/, ''))
            if (topic[i]['data']['post_stream']['posts'][j]['avatar_template'].indexOf('https:') === -1) {
              icon.push('https://talk.pdis.nat.gov.tw' + topic[i]['data']['post_stream']['posts'][j]['avatar_template'].replace(/{size}/, '50'))
            }
          }
          this.wisdom_Private.title.push(topic[i]['data']['title'])
          this.wisdom_Private.content.push(content)
          this.wisdom_Private.aouther.push(aouther)
          this.wisdom_Private.time.push(time)
          this.wisdom_Private.icon.push(icon)
        }
      }
    },
    created: function () {
      this.getUserData()
    }
  }
</script>

<style lang="scss" >
.wisdom_private{
  .el-collapse-item__header {
    color: black;
    font-size: 1.2rem !important;
    .notifi{
      color: red !important;
    }
  }
  .el-collapse-item__content {
    padding: 1.5em;
    font-size: 1rem;
    img {
      vertical-align: middle;
      margin-right: 1em;
    }
    p {
      font-size: 1rem;
    }    
  }
}


</style>
