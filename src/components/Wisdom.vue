<template lang="pug">
  .wisdom
    el-row
      el-col(:span='4')
        p
      el-col(:span='16')
        p(v-if="wisdom_Private.content.length > 0") 等待回答
          el-collapse(v-model='activeName', accordion='')
            div.private(v-for='(item, contentindex) in wisdom_Private.content', v-if="contentindex<lazyload && wisdom_Private.content.length > 0")
              el-collapse-item
                template(slot='title')
                  | {{wisdom_Private.title[contentindex]}}
                  i.header-icon.el-icon-information
                img(:src='wisdom_Private.icon[contentindex][0]')
                span.el-dialog__title {{wisdom_Private.aouther[contentindex][0]}}
                span 提問:
                p(v-html='wisdom_Private.content[contentindex][0]')
                el-input.sereply(type='textarea', autosize='', placeholder='我要回應...')
          el-button.loader(type="primary",v-on:click="Private")
            | load more
        p(v-if="wisdom_Private.content != undefined") 歷史問題
        div.pubilc(v-for='(item, contentindex) in wisdom_Pubilc.content', v-if="contentindex<lazyload && wisdom_Pubilc.content != undefined")
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
              span 回應:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{wisdom_Pubilc.time[contentindex][index]}}
              span.sereply(v-html='wisdom_Pubilc.content[contentindex][index]')

            el-input.sereply(type='textarea', autosize='', placeholder='我要回應...')
        el-button.loader(type="primary",v-on:click="Lazy_Pubilc", v-loading="loading")
         | load more
      el-col(:span='4')
        p

</template>

<script>
  import axios from 'axios'
  export default {
    name: 'hello',
    components: {
    },
    data () {
      return {
        activeName: '1',
        wisdom_Pubilc: {
          title: [],
          icon: [],
          content: [],
          aouther: [],
          time: []
        },
        wisdom_Private: {
          title: [],
          icon: [],
          content: [],
          aouther: [],
          time: []
        },
        page: '0',
        private_page: '0',
        lazyload: '',
        lazyload_count: '',
        All_category: [],
        loading: false
      }
    },
    methods: {
      getUserData: async function () {
        this.lazyload = 0
        this.lazyload_count = 0
        this.page = 0
        this.private_page = 0
        this.All_category = await this.getDiscussion_Category('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt.json?page=0')
        await this.Lazy_Pubilc()
        await this.Lazy_Private(this.All_category)
      },
      Lazy_Pubilc: async function (val) { // lazyload
        let topic = []
        let length = this.All_category.data.topic_list.topics.length
        let length1 = this.All_category.data.topic_list.topics.length % 2
        console.log(length1)
        if (length - this.lazyload_count === 1) {
          this.lazyload_count += 1
          this.lazyload += 1
          for (let i = (this.lazyload_count - 1); i < this.lazyload_count; i++) {
            let topicdata = await this.getDiscussion_Topic(this.All_category, i)
            topic.push(topicdata)
          }
        } else if (length - this.lazyload_count > 1) {
          this.lazyload_count += 2
          this.lazyload += 2
          for (let i = (this.lazyload_count - 2); i < this.lazyload_count; i++) {
            let topicdata = await this.getDiscussion_Topic(this.All_category, i)
            topic.push(topicdata)
          }
        }
        await this.Data_Processing(topic, true)
        if (this.lazyload_count === length) {
          this.lazyload_count = 0
          this.page += 1
          this.All_category = await this.getDiscussion_Category('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt/l/latest.json?page=' + this.page)
        }
      },
      Private: async function (val) { // lazyload
        this.private_page += 1
        let category = await this.getDiscussion_Category('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt/l/latest.json?page=' + this.page)
        this.Lazy_Private(category)
        console.log(category)
      },
      Lazy_Private: async function (val) { // lazyload
        let topic = []
        let id = val
        // let category = await this.getDiscussion_Category('https://talk.pdis.nat.gov.tw/c/wiselike/profile-smith/l/latest.json?page=0&api_key=e48e540665fe1382c47f47b73ec57b7c828871e8e43200fbc8f7ab79a5c9489c&api_username=smith02620')
        let category = val.data.topic_list.topics
        // id.data.topic_list.topics = []
        for (let i in category) {
          if (category[i].visible === false) {
            id.data.topic_list.topics.push(category[i])
          }
        }
        let idlength = id.data.topic_list.topics.length
        for (let i = 0; i < idlength; i++) {
          let topicdata = await this.getDiscussion_Topic(id, i)
          topic.push(topicdata)
        }
        // await this.Data_Processing(topic.reverse(), false)
        // if (this.lazyload_count === length) {
        //   this.lazyload_count = 0
        //   this.page += 1
        //   this.All_category = await this.getDiscussion_Category('https://talk.pdis.nat.gov.tw/c/wiselike/profile-smith/l/latest.json?page=0&api_key=e48e540665fe1382c47f47b73ec57b7c828871e8e43200fbc8f7ab79a5c9489c&api_username=smith02620')
        // }
      },
      getDiscussion_Category: function (url) { // 抓取作者全部的category
        return new Promise((resolve, reject) => {
          axios.get(url).then((val) => {
            val['data']['topic_list']['topics'] = val['data']['topic_list']['topics'].slice(1)
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
            aouther.push(topic[i]['data']['post_stream']['posts'][j]['name'])
            time.push(topic[i]['data']['post_stream']['posts'][j]['created_at'].replace(/T.*/, ''))
            if (topic[i]['data']['post_stream']['posts'][j]['avatar_template'].indexOf('https:') === -1) {
              icon.push('https://talk.pdis.nat.gov.tw' + topic[i]['data']['post_stream']['posts'][j]['avatar_template'].replace(/{size}/, '100'))
            }
          }
          if (topic[i]['data']['visible'] === true && pubilc === true) {
            this.wisdom_Pubilc.title.push(topic[i]['data']['title'])
            this.wisdom_Pubilc.content.push(content)
            this.wisdom_Pubilc.aouther.push(aouther)
            this.wisdom_Pubilc.time.push(time)
            this.wisdom_Pubilc.icon.push(icon)
          }
          if (topic[i]['data']['visible'] === false && pubilc === false) {
            this.wisdom_Private.title.push(topic[i]['data']['title'])
            this.wisdom_Private.content.push(content)
            this.wisdom_Private.aouther.push(aouther)
            this.wisdom_Private.time.push(time)
            this.wisdom_Private.icon.push(icon)
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
          this.loading = true
          /* pause for testing */
          setTimeout(() => {
            this.Lazy_Pubilc()
            this.loading = false
          }, 1000)
        }
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
.wisdom {
  .avatar {
    border-radius: 50%;
    width: 250px;
    height: 250px;
  }
}
.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
    clear: both
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
  // el-input{
  //   width:50%;
  // }
  .el-textarea {
    display: inline-block;
    width: 88%;
    vertical-align: bottom;
  }
}
.el-card__body {
  padding: 20px;
  background-color: rgba(11, 0, 236, 0.08) !important;
}
.el-button--primary {
  color: #fff;
  font-size: 2rem;
  width: 100%;
}

.loader {
  margin-bottom: 1em;
}

</style>
