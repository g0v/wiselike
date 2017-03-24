<template lang="pug">
  .wisdom
    el-row(:gutter='20')
      el-col(:span='4')
        p 
      el-col(:span='16')
       div(v-for='(item, contentindex) in wisdom.content')
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
              span 回應:
              span.sereply(v-html='wisdom.content[contentindex][index]')

          el-input.sereply(type='textarea', autosize='', placeholder='我要回應...', v-model='textarea2')
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
        }
      }
    },
    methods: {
      getDiscussion_Comment: function (val) {
        axios.get('https://talk.pdis.nat.gov.tw/c/wiselike/profile-audreyt.json')
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
            })
          }
          console.log(this.wisdom)
        })
      }
    },
    watch: {
      wisdom: function () {
        this.getDiscussion_Comment()
      }
    },
    created: function () {
      this.getDiscussion_Comment()
    }
  }
</script>

<style lang="scss" scoped>
  .wisdom {
    // text-align: center;

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
    
</style>
