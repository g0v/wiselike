<template lang="pug">
  .wisdom
    el-row(:gutter='20')
      el-col(:span='4')
        p 
      el-col(:span='16')
        el-card.box-card
          .clearfix(slot='header')
            span(style='line-height: 36px;')
            p {{wisdom.title[0]}}
            p {{wisdom.content[0][0]}}
            
          .text.item(v-for='(item, index) in wisdom.content[0]')
            p(v-if='index!=0') {{wisdom.content[0][index]}}
      el-col(:span='4')
        P 456

    
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
          content: []
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
              for (let j in topic['data']['post_stream']['posts']) {
                content.push(topic['data']['post_stream']['posts'][j]['raw'])
                if (topic['data']['post_stream']['posts'][j]['avatar_template'].indexOf('https:') === -1) {
                  icon.push('https://talk.pdis.nat.gov.tw' + topic['data']['post_stream']['posts'][j]['avatar_template'].replace(/{size}/, '100'))
                }
              }
              this.wisdom.content.push(content)
              this.wisdom.icon.push(icon)
            })
          }
          console.log(this.wisdom)
        })
      }
    },
    created: function () {
      this.getDiscussion_Comment()
    }
  }
</script>

<style lang="scss" scoped>
  .wisdom {
    text-align: center;

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
    width: 100%;
  }
</style>
