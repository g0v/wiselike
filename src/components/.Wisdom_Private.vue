<template lang="pug">
  .wisdom_private
    div(v-if="wisdom_Private.content.length > 0")
      p 等待回答
      el-collapse(accordion='')
        .pan(v-for='(item, contentindex) in wisdom_Private.content')
          el-collapse-item
            template(slot='title')
              span.test {{wisdom_Private.title[contentindex]}}
              i.notifi.header-icon.el-icon-information
            p
              img(:src='wisdom_Private.icon[contentindex][0]')
              span.el-dialog__title {{wisdom_Private.author[contentindex][0]}}
                |  提問
            p(v-html='wisdom_Private.content[contentindex][0]')
            wisdomreply(:userId='userId', :topicid='wisdom_Private.topicid[contentindex]', :slug='wisdom_Private.slug[contentindex]', :ProfileCategoryId='ProfileCategoryId')
      el-button.loader(type="primary",v-on:click="Lazy_Private", v-if='loadmore > 0')
        | 更多問題
</template>

<script>
  import axios from 'axios'
  import wisdomreply from './Wisdom_Reply.vue'
  export default {
    name: 'wisdom_private',
    props: ['userId', 'LocalStorageUsername', 'ProfileCategoryId'],
    components: {
      wisdomreply
    },
    data () {
      return {
        wisdom_Private: {
          title: [],
          icon: [],
          content: [],
          author: [],
          time: [],
          topicid: [],
          slug: []
        },
        page: 0,
        Private_Category: [],
        loadmore: '',
        local_storage_username: '',
        local_self: false
      }
    },
    computed: {
    },
    methods: {
      profile_PrivateLink: function (userId) {
        return 'https://talk.pdis.nat.gov.tw/c/wiselike/inbox-' + userId + '.json'
      },
      getUserData: async function () {   // find user category
        this.Private_Category = await this.getDiscussion_Category(this.profile_PrivateLink(this.userId) + '?page=0')
        await this.Lazy_Private()
      },
      Lazy_Private: async function () { // lazyload
        let topic = []
        // Gat thirty topic
        for (let i = 0, length = this.Private_Category.data.topic_list.topics.length; i < length; i++) {
          let topicdata = await this.getDiscussion_Topic(this.Private_Category, i)
          this.local_self === true // Show my question
            ? topic.push(topicdata)
            : (this.Private_Category.data.topic_list.topics[i].slug === this.local_storage_username) && (topic.push(topicdata))
        }
        await this.Data_Processing(topic.reverse())
        this.page += 1
        this.Private_Category = await this.getDiscussion_Category(this.profile_PrivateLink(this.userId) + '?page=' + this.page)
        this.loadmore = this.Private_Category.data.topic_list.topics.length
      },
      getDiscussion_Category: function (url) { // get user all category
        return new Promise((resolve, reject) => {
          axios.get(url).then((val) => {
            val['data']['topic_list']['topics'] = val['data']['topic_list']['topics'].slice(1)
            resolve(val)
          })
        })
      },
      getDiscussion_Topic: async function (url, i) { // get topic
        return new Promise((resolve, reject) => {
          let id = url['data']['topic_list']['topics']
          axios.get('https://talk.pdis.nat.gov.tw/t/' + id[i].id + '.json?include_raw=1').then((val) => {
            resolve(val)
          })
        })
      },
      Data_Processing: function (topic) { // topic data processing
        for (let i in topic) {
          let content = []
          let icon = []
          let author = []
          let time = []
          for (let j in topic[i]['data']['post_stream']['posts']) {
            content.push(topic[i]['data']['post_stream']['posts'][j]['cooked'])
            author.push(topic[i]['data']['post_stream']['posts'][j]['name'])
            time.push(topic[i]['data']['post_stream']['posts'][j]['created_at'].replace(/T.*/, ''))
            if (topic[i]['data']['post_stream']['posts'][j]['avatar_template'].indexOf('https:') === -1) {
              icon.push('https://talk.pdis.nat.gov.tw' + topic[i]['data']['post_stream']['posts'][j]['avatar_template'].replace(/{size}/, '50'))
            }
          }
          this.wisdom_Private.title.push(topic[i]['data']['title'])
          this.wisdom_Private.content.push(content)
          this.wisdom_Private.author.push(author)
          this.wisdom_Private.time.push(time)
          this.wisdom_Private.icon.push(icon)
          this.wisdom_Private.topicid.push(topic[i]['data']['id'])
          this.wisdom_Private.slug.push(topic[i]['data']['slug'])
        }
      }
    },
    watch: {
      userId: function () {
        this.local_storage_username = window.localStorage.getItem('username');
        (this.local_storage_username === this.userId) ? (this.local_self = true) : (this.local_self = false);
        (this.userId !== null) && (this.getUserData())
      }
    },
    created: function () {
      // if local_storage data
      Object.assign(this.$data, this.$options.data())
      this.local_storage_username = window.localStorage.getItem('username');
      (this.local_storage_username === this.userId) ? (this.local_self = true) : (this.local_self = false);
      (this.userId !== null) && (this.getUserData())
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
.wisdom_private{
  .test {
    color: black;
    font-size: 1.2rem;
  }
  .notifi{
    color: red;
    font-size: 1.2rem;
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
