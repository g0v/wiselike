<template lang="pug">
  .wisdom
    el-row(:gutter='20')
      el-col(:span='4')
        p 
      el-col(:span='16')
        div(v-for='(item, contentindex) in wisdom.content', v-if="contentindex<lazyload && wisdom.content != undefined")
          el-card.box-card
            .clearfix(slot='header')
              span(style='line-height: 36px;')
              img(:src='wisdom.icon[contentindex][0]')
              span.el-dialog__title {{wisdom.aouther[contentindex][0]}}
              span 提問:
              h2 {{wisdom.title[contentindex]}}
              p(v-html='wisdom.content[contentindex][0]')
              
            .text.item(v-for='(item, index) in wisdom.content[contentindex]',v-if='index!=0',v-bind:class="{sereply: index>=2}")
                
              img(:src='wisdom.icon[contentindex][index]')
              span.el-dialog__title {{wisdom.aouther[contentindex][index]}}
              span 回應:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{wisdom.time[contentindex][index]}}
              span.sereply(v-html='wisdom.content[contentindex][index]')

            el-input.sereply(type='textarea', autosize='', placeholder='我要回應...')
        el-button(type="primary",v-on:click="lazy")
         | load more
      el-col(:span='4')
        P 

</template>

<script>
  import axios from 'axios'
  export default {
    name: 'hello',
    components: {
    },
    data () {
      return {
        wisdom: {
          title: [],
          icon: [],
          content: [],
          aouther: [],
          time: []
        },
        page: Number,
        lazyload: '',
        lazyload_count: '',
        All_category: []
      }
    },
    methods: {
      getUserData: async function () {
        // this.getDiscussion_Comment('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt/l/latest.json?page=0')
        this.lazyload = 0
        this.lazyload_count = 0
        this.page = 0
        this.All_category = await this.getDiscussion_Category('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt/l/latest.json?page=0')
        await this.lazy()
      },
      lazy: async function (val) { // lazyload
        let topic = []
        let length = this.All_category.data.topic_list.topics.length
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
        await this.Data_Processing(topic)
        if (this.lazyload_count === length) {
          this.lazyload_count = 0
          this.page += 1
          this.All_category = await this.getDiscussion_Category('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt/l/latest.json?page=' + this.page)
        }
      },
      getDiscussion_Category: function (url) { // 抓取作者全部的category
        return new Promise((resolve, reject) => {
          axios.get(url).then((val) => {
            val['data']['topic_list']['topics'] = val['data']['topic_list']['topics'].slice(1)
            resolve(val)
            // if (url.indexOf('page=0') > -1) {
            //   val['data']['topic_list']['topics'] = val['data']['topic_list']['topics'].slice(1)
            //   resolve(val)
            // } else {
            //   resolve(val)
            // }
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
              icon.push('https://talk.pdis.nat.gov.tw' + topic[i]['data']['post_stream']['posts'][j]['avatar_template'].replace(/{size}/, '100'))
            }
          }
          this.wisdom.title.push(topic[i]['data']['title'])
          this.wisdom.content.push(content)
          this.wisdom.aouther.push(aouther)
          this.wisdom.time.push(time)
          this.wisdom.icon.push(icon)
        }
      }
    },
    created: function () {
      this.getUserData()
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
  el-input{
    width:50%;
  }
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
    
</style>
