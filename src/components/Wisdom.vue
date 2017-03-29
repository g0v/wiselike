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
        All_category: []
      }
    },
    methods: {
      getUserData: async function () {
        // this.getDiscussion_Comment('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt/l/latest.json?page=0')
        this.lazyload = 2
        this.page = 0
        this.All_category = await this.getDiscussion_Category('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt/l/latest.json?page=0')
        console.log(this.All_category)
        let topic = await this.getDiscussion_Topic(this.All_category)
        await this.Data_Processing(topic)
      },
      lazy: async function (val) { // lazyload
        this.lazyload += 2
        let topic = await this.getDiscussion_Topic(this.All_category)
        await this.Data_Processing(topic)
        if ((this.lazyload % 30) === 0) {
          this.page += 1
          this.All_category = await this.getDiscussion_Category('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt/l/latest.json?page=' + this.page)
          // ['data']['topic_list']['topics']
          console.log(this.All_category)
        }
        console.log(this.page)
        console.log(this.lazyload)
      },
      getDiscussion_Category: function (url) { // 抓取作者全部的category
        return new Promise((resolve, reject) => {
          axios.get(url).then((val) => {
            resolve(val)
          })
        })
      },
      getDiscussion_Topic: function (url) { // 一次抓兩篇topic
        return new Promise((resolve, reject) => {
          let id = url['data']['topic_list']['topics']
          console.log(id[0].id)
          let data = []
          for (let i = (this.lazyload - 2); i < this.lazyload; i++) {
          // for (let i in id) {
            axios.get('https://talk.pdis.nat.gov.tw/t/' + id[i % 10].id + '.json?include_raw=1').then((val) => {
              data.push(val)
              if (data.length === 2) {
                resolve(data)
              }
            })
          }
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
      },
      getDiscussion_Comment: function (url) {
        return new Promise((resolve, reject) => {
          axios.get(url)
          .then((val) => {
            val['data']['topic_list']['topics'] = val['data']['topic_list']['topics'].slice(1)
            for (let i in val.data.topic_list.topics) {
              axios.get('https://talk.pdis.nat.gov.tw/t/' + val.data.topic_list.topics[i].id + '.json?include_raw=1')
              .then((topic) => {
              //   this.wisdom.title.push(i)
                this.wisdom.title.push(topic['data']['title'])
                let content = []
                let icon = []
                let aouther = []
                let time = []
                for (let j in topic['data']['post_stream']['posts']) {
                  content.push(topic['data']['post_stream']['posts'][j]['cooked'])
                  aouther.push(topic['data']['post_stream']['posts'][j]['name'])
                  time.push(topic['data']['post_stream']['posts'][j]['created_at'].replace(/T.*/, ''))
                  if (topic['data']['post_stream']['posts'][j]['avatar_template'].indexOf('https:') === -1) {
                    icon.push('https://talk.pdis.nat.gov.tw' + topic['data']['post_stream']['posts'][j]['avatar_template'].replace(/{size}/, '100'))
                  }
                }
                this.wisdom.content.push(content)
                this.wisdom.icon.push(icon)
                this.wisdom.aouther.push(aouther)
                this.wisdom.time.push(time)
                if (this.wisdom.content.length === val.data.topic_list.topics.length) {
                  this.lazyload = 2
                  resolve(this.wisdom)
                }
                // this.lazyload(this.wisdom)
              })
            }
          })
        })
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
