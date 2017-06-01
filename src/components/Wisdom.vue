<template lang="pug">
 .wisdom
  div.card
    div.title
      i.fa.fa-long-arrow-right
      | {{topicContent.title}}

    div.question
      el-popover(ref='popover5', placement='top', width='160', v-model='visible2')
        h2 確認刪除此問題？
        div(style='text-align: right; margin: 0')
          el-button(size='mini', type='text', @click='visible2 = false') 取消
          el-button(type='primary', size='mini', @click='DeletePrivate') 确定
      el-button.delete(v-if="deleteQ === true", v-popover:popover5='') 删除

      el-popover(ref='popover1', placement='top', width='400', v-model='shareVisible')
        h2 分享連結
        el-input(v-model='shareLink', placeholder='请输入内容')
        i.fa.fa-facebook-square.fa6(aria-hidden='true', @click='open')
      el-button.share(v-if="deleteQ === false", v-popover:popover1='', @click='share') 分享
      div(v-if='topicContent.posts !== undefined')
        img.avatar(:src='topicContent.posts[0].icon')
        span.authorName {{topicContent.posts[0].author}} 提問：
        div.content(v-html='topicContent.posts[0].content')

    div.line

    div.reply(v-for='(post, index) of topicContent.posts', v-if='index > 0')
      div
        img.avatar(:src='post.icon')
        span.authorName {{post.author}} 回應：
        div.content(v-html='post.content')
    
    el-form.demo-ruleForm(:model='ruleForm', :rules='rules', ref='ruleForm')
      el-form-item(prop='content')
        .reply
          el-tooltip(placement="bottom")
            div(slot="content")
              .meta
                | You could use
                a(href='http://commonmark.org/help/', target='_blank')  markdown
                |  to write the posts!
            el-input(v-model='ruleForm.content', auto-complete='off', type='textarea', autosize='', placeholder='我要回應...')
          el-button(type='primary', @click="submit('ruleForm')") 送 出

  //- el-card.box-card(v-if="deleteCom && topicContent", :class='[type]')
  //-   .clearfix(slot='header')
  //-     h2
  //-       i.fa.fa-long-arrow-right
  //-       |  {{topicContent.title}}
  //-       //- delete button
  //-       el-popover(ref='popover5', placement='top', width='160', v-model='visible2')
  //-         h2 確認刪除此問題？
  //-         div(style='text-align: right; margin: 0')
  //-           el-button(size='mini', type='text', @click='visible2 = false') 取消
  //-           el-button(type='primary', size='mini', @click='DeletePrivate') 确定
  //-       el-button.delete(v-if="deleteQ === true", v-popover:popover5='') 删除

  //-       el-popover(ref='popover1', placement='top', width='400', v-model='shareVisible')
  //-         h2 分享連結
  //-         el-input(v-model='shareLink', placeholder='请输入内容')
  //-         i.fa.fa-facebook-square.fa6(aria-hidden='true', @click='open')
  //-       el-button.share(v-if="deleteQ === false", v-popover:popover1='', @click='share') 分享

  //-   .text.item(v-for='(post, index) of topicContent.posts', :class="{sereply: index >= 2}")
  //-     p
  //-       img.avatar(:src='post.icon')
  //-       span.el-dialog__title
  //-         | {{post.author}}
  //-         span(v-if="index === 0")
  //-           |  提問
  //-         span(v-else)
  //-           |  回應
  //-           sup  {{post.time}}
  //-     p.sereply(v-html='post.content')

  //-   //- wisdomreply(:userId='userId', :topicid='content.topicId', :type='content.category')
  //-   el-form.demo-ruleForm(:model='ruleForm', :rules='rules', ref='ruleForm')
  //-     el-form-item(prop='content')
  //-       .reply
  //-         el-tooltip(placement="bottom")
  //-           div(slot="content")
  //-             .meta
  //-               | You could use
  //-               a(href='http://commonmark.org/help/', target='_blank')  markdown
  //-               |  to write the posts!
  //-           el-input(v-model='ruleForm.content', auto-complete='off', type='textarea', autosize='', placeholder='我要回應...')
  //-         el-button(type='primary', @click="submit('ruleForm')") 送 出
</template>

<script>
  import axios from 'axios'
  import config from '../../config'
  export default {
    name: 'wisdom',
    props: ['userId', 'type', 'topicId'],
    components: {
    },
    data () {
      var CheckContent = (rule, value, callback) => {
        if (String(value).length < 10) {
          callback(new Error('欄位長度需大於10個字'))
        } else {
          callback()
        }
      }
      return {
        ruleForm: {
          content: ''
        },
        rules: {
          content: [
            { validator: CheckContent, trigger: 'blur' }
          ]
        },
        local_storage: {},
        visible2: false,
        shareVisible: false,
        deleteQ: false,
        deleteCom: true,
        topicContent: {},
        shareLink: ''
      }
    },
    methods: {
      open: function () {
        let descrip = this.topicContent.posts[0].content.substr(0, 200).replace(/<.>|<..>/g, '') + '...'
        window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(this.shareLink) + '&title=' + this.topicContent.title + '&description=' + descrip + '&picture=https://talk.pdis.nat.gov.tw/uploads/default/original/1X/b5e4c37b44fd9b15ff8751061d1648bfb5048291.PNG', 'sharer', 'toolbar=0,status=0,width=626,height=436'); return false
      },
      share: function () {
        this.shareLink = 'https://wiselike.tw/#/user/' + this.userId + '#' + this.topicId
      },
      DeleteLink: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.userId + '/delete?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      DeletePrivate: function () {
        this.local_storage = window.localStorage
        this.visible2 = false
        let vm = this
        let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        let form = new URLSearchParams()
        form.append('topid', this.content.topicId)
        axios.post(this.DeleteLink(this.local_storage), form, config)
        .then(() => {
          vm.$message.success('成功刪除，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')
          this.deleteCom = false
        })
        .catch(function (error) {
          console.log(error)
          vm.error()
        })
      },
      AskLink: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.userId + '/wisdoms/topic?sso=' + localstorage.sso + '&sig=' + localstorage.sig + '&topicid=' + this.topicId + '&type=' + this.type
      },
      temporaryData: function () {
        let date = new Date()
        date.g
        let temporaryPost = {
          content: '',
          author: '',
          time: '',
          icon: ''
        }
        temporaryPost.content = this.ruleForm.content
        temporaryPost.time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate())
        temporaryPost.author = this.local_storage.username
        axios.get('https://talk.pdis.nat.gov.tw/users/' + this.local_storage.username + '.json')
        .then((response) => {
          var user = response.data.user
          temporaryPost.icon = 'https://talk.pdis.nat.gov.tw' + user['avatar_template'].replace(/{size}/, '100')
          this.topicContent.posts.push(temporaryPost)
          this.ruleForm.content = ''
        })
      },
      submit: function (formName) {
        this.local_storage = window.localStorage
        if (this.local_storage.length === 3) {
          this.$refs[formName].validate((valid) => {
            if (valid) {
              let vm = this
              // let form = new FormData()
              let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
              let form = new URLSearchParams()
              form.append('raw', this.ruleForm.content)
              axios.post(this.AskLink(this.local_storage), form, config)
              .then(() => {
                vm.sucessful()
                vm.temporaryData()
              })
              .catch(function (error) {
                console.log(error)
                vm.error()
              })
            } else {
              return false
            }
          })
        } else {
          this.dialogFormVisible = false
          this.$message({
            showClose: true,
            message: '請先登入',
            type: 'warning'
          })
        }
      },
      error () {
        this.$message({
          showClose: true,
          message: '發送失敗，請稍後重試。',
          type: 'error'
        })
      },
      sucessful () {
        this.$message({
          showClose: true,
          message: '成功發送，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。',
          type: 'success'
        })
      }
    },
    created: function () {
      if (this.type === 'private') this.deleteQ = true
      /* fetch topic by id */
      let id = this.topicId
      axios.get('https://talk.pdis.nat.gov.tw/t/' + id + '.json?include_raw=1')
        .then((topic) => {
          /* convert topic to wisdom */
          let wisdom = {
            posts: [],
            title: '',
            topicId: 0,
            category: ''
          }
          for (let post of topic.data.post_stream.posts) {
            let wisdomPost = {
              content: '',
              author: '',
              time: '',
              icon: ''
            }
            wisdomPost.content = post.cooked
            wisdomPost.author = post.username
            wisdomPost.time = post.created_at.replace(/T.*/, '')
            if (post['avatar_template'].indexOf('https:') === -1) {
              wisdomPost.icon = 'https://talk.pdis.nat.gov.tw' + post.avatar_template.replace(/{size}/, '100')
            }
            wisdom.posts.push(wisdomPost)
          }
          wisdom.title = topic.data.title
          wisdom.topicId = topic.data.id
          wisdom.category = this.type
          /* save the wisdom */
          this.topicContent = wisdom
        })
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
@import 'node_modules/font-awesome/scss/font-awesome';
  // .clearfix {
  //   background-color: #324157;
  //   padding: 0.1em;
  //   color: white;
  // }
  .wisdom {
    .card {
      border: 1px solid #d1dbe5;
      border-radius: 4px;
      background-color: #fff;
      overflow: hidden;
      box-shadow: 0 2px 4px 0 rgba(0,0,0,.12), 0 0 6px 0 rgba(0,0,0,.04);
      margin-bottom: 2em;
      font-family: $font;
      .title {
        background-color: #324157;
        font-size: 1.5rem;
        color: white;
        padding: 0.5em;
        font-weight: 700;
      }
      .question {
        padding: 1.5em;
        font-size: 1.2rem;
      }
      .content {
        line-height: 2.5rem;
        margin: 0 2em 0 2em;
      }
      .avatar {
        width: 70px;
        vertical-align: middle;
        margin-right: 1em;
        border-radius: 50%;
      }
      .authorName {
        font-size: 1.5rem;
        font-weight: 700;
      }
      .line {
        border: 1px solid #d1dbe5;
      }
      .reply {
        padding: 1.5em;
      }
    }
  }
  .delete {
    float: right;
    color: white;
    font-weight: 700;
    background-color: red;
  }
  .fa6 {
    font-size: 4em;
  }
  .share {
    float: right;
    color: white;
    font-weight: 700;
    background-color: #324157;
  }
  .shareBox{
    width:300px;
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
    &.top {
      border-left: 2px solid salmon;
    }
    &.public {
      border-left: 2px solid mediumaquamarine;
    }
    &.private {
      border-left: 2px solid cyan;
    }
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
    // .el-textarea {
    //   display: inline-block;
    //   width: 88%;
    //   vertical-align: bottom;
    // }
  }
  .loader {
    font-size: large;
    height: 3em;
    width: 100%;
  }

.reply {
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
  .el-button {
    margin: 0 0 0 1ch;
  }
}
</style>
