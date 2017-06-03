<template lang="pug">
.wisdom
  .card(:class='[type]')
    .title
      i.fa.fa-lg.fa-question-circle
      span  {{topicContent.title}}

    .question
      el-popover(ref='popover5', placement='top', width='160', v-model='visible2')
        h2 確認刪除此問題？
        div(style='text-align: right; margin: 0')
          el-button(size='mini', type='text', @click='visible2 = false') 取消
          el-button(type='primary', size='mini', @click='DeletePrivate') 确定
      el-button.delete(v-if="deleteQ === true", v-popover:popover5='') 删 除

      el-popover(ref='popover1', placement='top', width='400', v-model='shareVisible')
        h2 分享連結
        el-input(v-model='shareLink', placeholder='请输入内容')
        i.fa.fa-facebook-square.fa6(aria-hidden='true', @click='shareFB')
      el-button.share(v-if="deleteQ === false", v-popover:popover1='') 分 享

    .reply(v-for='(post, index) of topicContent.posts')
      .authorName
        img.avatar(:src='post.icon')
        .meta {{post.author}}
      .content(v-html='post.content')
    
    div.replyButton(v-if="!reply && local_storage.username !== undefined")
      img.avatar(:src='local_storage.userIcon')
      el-button(type='primary', @click="reply = true") 我 要 回 覆
    div.center(v-else-if="local_storage.username === undefined")
      el-button(@click.native="login",type="warning") 請 先 登 入 方 可 留 言
    
    #editor(v-if='reply')
      mavon-editor(style='height: 100%', v-model="markdownText", :toolbars="toolbars")
      el-button.button(style='float:right', type='primary', @click="submit") 送 出
      el-button.button(style='float:right', @click="reply = false") 取 消

</template>

<script>
  import { mavonEditor } from 'mavon-editor'
  import '../css/index.css'
  import axios from 'axios'
  import config from '../../config'
  import $ from 'jquery'
  export default {
    name: 'wisdom',
    props: ['userId', 'type', 'topicId'],
    components: {
      'mavon-editor': mavonEditor
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
        shareLink: '',
        markdownText: '',
        reply: false,
        toolbars: {
          bold: true, // 粗体
          italic: true, // 斜体
          header: true, // 标题
          quote: true, // 引用
          ol: true, // 有序列表
          ul: true, // 无序列表
          link: true, // 链接
          imagelink: true, // 图片链接
          code: true, // code
          table: true, // 表格
          subfield: true, // 是否需要分栏
          fullscreen: true, // 全屏编辑
          help: true, // 帮助
          /* 1.3.5 */
          undo: true, // 上一步
          redo: true, // 下一步
          trash: true, // 清空
          htmlcode: true // 展示html源码
        }
      }
    },
    methods: {
      login: function (event) {
        window.open(config.runtime.proxyHost + '/login')
      },

      shareFB: function () {
        let descrip = this.topicContent.posts[0].content.substr(0, 200).replace(/<.>|<..>/g, '') + '...'
        window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(this.UrlLink(this.local_storage, 'shareFB')) + '&title=' + this.topicContent.title + '&description=' + descrip + '&picture=https://talk.pdis.nat.gov.tw/uploads/default/original/1X/b5e4c37b44fd9b15ff8751061d1648bfb5048291.PNG', 'sharer', 'toolbar=0,status=0,width=626,height=436'); return false
      },

      share: function () {
        this.shareLink = 'https://wiselike.tw/#/user/' + this.userId + '#' + this.topicId
      },

      UrlLink: function (localstorage, type) {
        let dele = config.runtime.proxyHost + '/users/' + this.userId + '/delete?sso=' + localstorage.sso + '&sig=' + localstorage.sig
        let submit = config.runtime.proxyHost + '/users/' + this.userId + '/wisdoms/topic?sso=' + localstorage.sso + '&sig=' + localstorage.sig + '&topicid=' + this.topicId + '&type=' + this.type
        let shareFB = 'https://wiselike.tw/#/user/' + this.userId + '#' + this.topicId

        if (type === 'DeletePrivate') return dele
        else if (type === 'submit') return submit
        else if (type === 'shareFB') return shareFB
      },

      DeletePrivate: function () {
        this.local_storage = window.localStorage
        this.visible2 = false
        let vm = this
        let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        let form = new URLSearchParams()
        form.append('topid', this.topicId)
        axios.post(this.UrlLink(this.local_storage, 'DeletePrivate'), form, config)
        .then(() => {
          vm.$message.success('成功刪除，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')
          this.deleteCom = false
        })
        .catch(function (error) {
          console.log(error)
          vm.$message.error('刪除失敗，請稍後重試。')
        })
      },

      submit: function () {
        /* cheack Character > 10 */
        let strLength = this.markdownText.replace(/\s/g, '')
        if (strLength.length < 10) {
          this.$message.error('欄位長度需大於10個字。')
          return
        }
        /* set form */
        let vm = this
        let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        let form = new URLSearchParams()
        form.append('raw', this.markdownText)

        axios.post(this.UrlLink(this.local_storage, 'submit'), form, config)
        .then(() => {
          let date = new Date()
          let temporaryPost = {
            content: '',
            author: '',
            time: '',
            icon: ''
          }
          temporaryPost.content = $('.v-show-content')[0].innerHTML
          temporaryPost.time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate())
          temporaryPost.author = this.local_storage.username

          axios.get('https://talk.pdis.nat.gov.tw/users/' + this.local_storage.username + '.json')
          .then((response) => {
            vm.$message.success('成功回覆，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')
            var user = response.data.user
            temporaryPost.icon = 'https://talk.pdis.nat.gov.tw' + user['avatar_template'].replace(/{size}/, '100')
            this.topicContent.posts.push(temporaryPost)
            this.markdownText = ''
            this.reply = false
          })
        })
        .catch(function (error) {
          console.log(error)
          vm.$message.error('回覆失敗，請稍後重試。')
        })
      }
    },
    watch: {
      userId: function () {
        this.local_storage = window.localStorage
      }
    },
    created: function () {
      if (this.type === 'private') this.deleteQ = true
      /* fetch topic by id */
      let id = this.topicId
      axios.get('https://talk.pdis.nat.gov.tw/t/' + id + '.json?include_raw=1')
        .then((topic) => {
          /* convert topic to wisdom */
          this.local_storage = window.localStorage
          this.shareLink = this.UrlLink(this.local_storage, 'shareFB')
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
            if (post.name === '') {
              wisdomPost.author = post.username
            } else {
              wisdomPost.author = post.name
            }
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
  #editor {
    margin: 1em;
    height: 20em;
    .button {
      margin: 1em;
    }
  }
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
        font-size: 1.5rem;
        padding: .5em 0 0 1em;
        font-weight: 700;
      }
      .question {
        text-align: right;
        padding: 0 1em;
      }
      .reply {
        padding: 0 3em;
        margin: 0 0 1em 0;
        position: relative;
        .authorName {
          position: absolute;
          text-align: center;
          left: 1em;
        }
        .content {
          border-left: 5px solid lightgray;
          padding: 0 0 0 1ch;
          margin: 0 0 2em 3.5em;
          line-height: 2rem;
        }
      }
      .avatar {
        width: 70px;
        border-radius: 50%;
        vertical-align: middle;
      }
      .line {
        border: 1px solid #d1dbe5;
      }
      .replyButton {
        text-align: center;
        margin: 2em;
      }
      .center {
        text-align: center;
      }
    }
  }
  .delete {
    // float: right;
    color: white;
    // font-weight: 700;
    background-color: red;
  }
  .fa6 {
    font-size: 4em;
  }
  .share {
    // float: right;
    color: white;
    // font-weight: 700;
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
  .card {
    line-height: 2em;
    width: 100%;
    margin-bottom: 2em;
    &.top {
      border: 2px solid salmon;
    }
    .el-dialog__title{
      margin-right: 1em;
    }
    .sereply{
      margin-left:3em;
    }
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
