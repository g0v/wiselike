<template lang="pug">
.wisdom(:class='[type]', v-if='!deleteCloseComponet && topicContent.title')
  .share-button
    //- 刪除按鈕
    el-popover(ref='popover5', placement='top', width='160', v-model='visible2')
      h2 確認刪除此問題？
      div(style='text-align: right; margin: 0')
        el-button(size='mini', type='text', @click='visible2 = false') 取消
        el-button(type='primary', size='mini', @click='DeletePrivate') 確定
    el-button.delete(v-if="deleteQ", v-popover:popover5='') 删 除

    //- 分享按鈕
    el-popover(ref='popover1', placement='top')
      h2 分享連結
      el-input(v-model='shareLink', readonly)
      span(v-for='(share, index) of shares')
        i.shareIcon(v-if="share !== 'line'",:class="share", aria-hidden='true', @click='sharing(share)')
        img.lineIcon(v-else, src='../assets/line.png', @click='sharing(share)')
    el-button.share(v-if="!deleteQ && !myQuestion", type='text', icon="share", v-popover:popover1='')

  .title
    i.fa.fa-lg.fa-question-circle
    span  {{topicContent.title}}

  .question
    div(v-for='(post, index) of topicContent.posts')
      .reply
        .authorName
          img.avatar(:src='post.icon')
          .meta {{post.author}}
          // span {{post.author}}

        .content
          .e(v-html='post.content')
          .time {{post.time}}
      div.replyCount(v-if='index === 0')
        | {{replyCount}} 個回答
        .line

  div.replyButton(v-if="!reply && local_storage.username !== undefined")
    el-button(type='primary', @click="reply = true", v-if="!myQuestion") Reply
  div.replyButton(v-else-if="local_storage.username === undefined")
    el-button(@click.native="login",type="warning") Login to reply

  .editor(v-if='reply')
    mavon-editor(v-model="markdownText", :toolbars="toolbars", :language = "'en'")
    el-button.button(type='primary', @click="submit") 送 出
    el-button.button(@click="reply = false") 取 消
    el-tag.tag(type='primary') 欄位長度需大於10個字。

</template>

<script>
  import LocalStorage from '../js/LocalStorage.js'
  import { Loading } from 'element-ui'
  import { mavonEditor } from 'mavon-editor'
  import '../css/index.css'
  import axios from 'axios'
  // import config from '../../config'
  import $ from 'jquery'
  export default {
    name: 'wisdom',
    props: ['userId', 'type', 'topicId'],
    components: {
      'mavon-editor': mavonEditor
    },
    data () {
      return {
        local_storage: {},
        visible2: false,
        deleteQ: false,
        deleteCloseComponet: false,
        topicContent: {},
        shareLink: '',
        markdownText: '',
        reply: false,
        myQuestion: false,
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
        },
        shares: [
          'fa fa-facebook-square facebook',
          'fa fa-twitter-square twitter',
          'line',
          'fa fa-envelope mail'
        ],
        replyCount: 0
      }
    },
    methods: {

      login: function (event) {
        window.open(process.env.proxyHost + '/login')
      },

      sharing: function (share) {
        let descrip = this.topicContent.posts[0].content.substr(0, 200).replace(/<.>|<..>/g, '') + '...'
        let Twitterdescrip = descrip.substr(0, 70) + '...'
        let url = encodeURIComponent(this.UrlLink(this.local_storage, 'shareLink'))
        /* facebook share */
        if (share.indexOf('facebook') > 1) {
          window.open('http://www.facebook.com/share.php?u=' + url + '&title=' + this.topicContent.title + '&description=' + descrip + '&picture=https://talk.pdis.nat.gov.tw/uploads/default/original/1X/b5e4c37b44fd9b15ff8751061d1648bfb5048291.PNG', 'sharer', 'toolbar=0,status=0,width=626,height=436'); return
        }
        /* Twitter share */
        if (share.indexOf('twitter') > 1) {
          window.open('https://www.twitter.com/intent/tweet?text=' + this.topicContent.title + '%0D%0A' + Twitterdescrip + '%0D%0A' + url, 'sharer', 'toolbar=0,status=0,width=626,height=436'); return
        }
        /* mail share */
        if (share.indexOf('mail') > 1) {
          window.location.href = 'mailto:?subject=' + this.topicContent.title + '&body=' + this.UrlLink(this.local_storage, 'shareLink')
        }
        /* line share */
        if (share === 'line') {
          let lineurl = 'http://line.naver.jp/R/msg/text/?' + this.topicContent.title + '%0D%0A' + Twitterdescrip + '%0D%0A' + url
          window.location.href = lineurl
        }
      },

      UrlLink: function (localstorage, type) {
        // console.log(this.$route.params.userId)
        let dele = process.env.proxyHost + '/users/' + this.userId + '/delete?sso=' + localstorage.sso + '&sig=' + localstorage.sig
        let submit = process.env.proxyHost + '/users/' + this.userId + '/wisdoms/topic?sso=' + localstorage.sso + '&sig=' + localstorage.sig + '&topicid=' + this.topicId + '&type=' + this.type
        let shareLink = 'https://wiselike.tw/#/user/' + this.$route.params.userId.replace(/-.*/, '') + '-' + this.topicId

        if (type === 'DeletePrivate') return dele
        else if (type === 'submit') return submit
        else if (type === 'shareLink') return shareLink
      },

      DeletePrivate: function () {
        /* turn on full screen loading */
        let loadingInstance = Loading.service({ fullscreen: true, text: '刪除中，請稍等' })
        this.local_storage = window.localStorage
        this.visible2 = false
        let vm = this
        let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        let form = new URLSearchParams()
        form.append('topid', this.topicId)
        axios.post(this.UrlLink(this.local_storage, 'DeletePrivate'), form, config)
        .then(() => {
          /* turn off full screen loading */
          loadingInstance.close()
          vm.$message.success('成功刪除，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')

          /* create localstorage record delete data */
          LocalStorage.setLocalStorage('delete', this.topicId)

          /* close component */
          this.deleteCloseComponet = true
        })
        .catch(function (error) {
          console.log(error)
          /* turn off full screen loading */
          loadingInstance.close()
          vm.$message.error('刪除失敗，請稍後重試。')
        })
      },

      /* reply question */
      submit: function (e) {
        /* cheack Character > 10 */
        let strLength = this.markdownText.replace(/\s/g, '')
        if (strLength.length < 10) {
          this.$message.error('欄位長度需大於10個字。')
          return
        }
        /* turn on full screen loading */
        let loadingInstance = Loading.service({ fullscreen: true, text: '資料發送中，請稍等' })
        /* set form */
        let vm = this
        let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        let form = new URLSearchParams()
        form.append('raw', this.markdownText)

        /* reply question via proxy.wiselike.tw */
        axios.post(this.UrlLink(this.local_storage, 'submit'), form, config)
        .then(() => {
          let date = new Date()
          let temporaryPost = {
            content: '',
            author: '',
            time: '',
            icon: ''
          }
          // temporaryPost.content = $('.v-show-content')[0].innerHTML
          temporaryPost.content = this.markdownText
          temporaryPost.time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate())
          // temporaryPost.author = this.local_storage.username

          /* create temporary data */
          axios.get('https://talk.pdis.nat.gov.tw/users/' + this.local_storage.username + '.json')
          .then((response) => {
            var user = response.data.user
            temporaryPost.author = user.name
            temporaryPost.icon = 'https://talk.pdis.nat.gov.tw' + user['avatar_template'].replace(/{size}/, '300')
            this.topicContent.posts.push(temporaryPost)
            this.markdownText = ''
            this.reply = false
            /* turn off full screen loading */
            loadingInstance.close()
            vm.$message.success('成功回覆，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')
            LocalStorage.setLocalStorage('reply', this.topicId, this.topicContent)
          })
        })
        .catch(function (error) {
          console.log(error)
          /* turn off full screen loading */
          loadingInstance.close()
          vm.$message.error('回覆失敗，請稍後重試。')
        })
      },
      goAnchor: function (anchor) {
        let anchorY = $(anchor).offset().top
        $('html, body').animate({
          scrollTop: anchorY
        }, 1000)
      },
      getData: async function () {
        let id = this.topicId
        let vm = this
        // let wis = await LocalStorage.LocalStorageRepply('reply', this.topicId)
        // if (wis !== null) {
        //   this.topicContent = wis.data
        //   this.replyCount = wis.data.posts.length - 1
        //   this.local_storage = window.localStorage
        //   this.shareLink = this.UrlLink(this.local_storage, 'shareLink')
        // } else {
        axios.get('https://talk.pdis.nat.gov.tw/t/' + id + '.json?include_raw=1')
        .then(async function (topic) {
          /* convert topic to wisdom */
          vm.local_storage = window.localStorage
          vm.shareLink = vm.UrlLink(vm.local_storage, 'shareLink')
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
              wisdomPost.icon = 'https://talk.pdis.nat.gov.tw' + post.avatar_template.replace(/{size}/, '300')
            }
            wisdom.posts.push(wisdomPost)
          }
          // LocalStorageRepply
          wisdom.title = topic.data.title
          wisdom.topicId = topic.data.id
          wisdom.category = vm.type
          let localstorageReply = await LocalStorage.LocalStorageReply('reply', vm.topicId, wisdom)
          if (localstorageReply !== null) {
            wisdom = localstorageReply.data
          }
          /* save the wisdom */
          vm.topicContent = wisdom
          vm.replyCount = vm.topicContent.posts.length - 1
          setTimeout(() => {
            if (vm.type === 'top') {
              vm.goAnchor('.top')
            }
          }, 1000)
        })
        // }
      }
    },
    watch: {
      userId: function () {
        this.local_storage = window.localStorage
      }
    },
    created: function () {
      if (this.type === 'private') this.deleteQ = true
      if (this.type === 'myQuestion') this.myQuestion = true
      /* fetch topic by id */
      this.getData()
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
@import 'node_modules/font-awesome/scss/font-awesome';
  .editor {
    margin: 0 1em;
    .button,
    .tag {
      margin: .5em 1ch 0 0;
    }
  }
  .wisdom {
    box-sizing: border-box;
    border: 1px solid #d1dbe5;
    border-radius: 4px;
    background-color: #fff;
    overflow: hidden;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,.12), 0 0 6px 0 rgba(0,0,0,.04);
    font-family: $font;
    line-height: 2em;
    width: 100%;
    margin-bottom: 2em;
    padding: 1em;
    &.top {
      border: 2px solid salmon;
    }
    .share-button {
      float: right;
    }
    .title {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .question {
      padding: 1em 0;
    }
    .reply {
      padding: 0 3em;
      position: relative;
      display: flex;
      flex-flow: row nowrap;
      align-items: baseline;
      .authorName {
        position: absolute;
        text-align: center;
        left: 0;
        width: 6em;
      }
      .content {
        border-left: 5px solid lightgray;
        padding: 0 0 0 1ch;
        margin: 0 0 2em 3.5em;
        line-height: 2rem;
        text-align: left;
      }
      .time {
        color: #7d7a7a;
        font-family: monospace;
      }
    }
    .avatar {
      width: 80px;
      border-radius: 50%;
      vertical-align: middle;
    }
    .replyCount {
      text-align: left;
      margin: 1em 0;
    }
    .line {
      border: 1px solid #d1dbe5;
    }
    .replyButton {
      text-align: center;
    }
  }
  .delete {
    color: white;
    background-color: red;
  }
  .shareIcon {
    font-size: 4em;
  }
  .facebook {
    color: #3b5998;
    margin-right: 0.1em;
  }
  .twitter {
    color: #00abf1;
    margin-right: 0.1em;
  }
  .mail {
    color: gray;
    font-size: 3.5em !important;
    vertical-align: text-bottom;
  }
  .lineIcon {
    vertical-align: sub;
    margin-right: 0.5em;
   }
  .share {
    color: $fontcolor;
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
  .loader {
    font-size: large;
    height: 3em;
    width: 100%;
  }
  @media all and (max-width: $breakpoint) {
    .wisdom {
      .title {
        font-size: 1rem;
      }
      .reply {
        padding: 0;
        .authorName {
          left: -30px;
        }
      }
      .avatar {
        width: 50px;
      }
      .meta {
        font-size: 70%;
        // background: none;
      }
    }
  }
@media all and (max-width: $mobilebreakpoint) {
  .wisdom {
    .meta {
      font-size: 1.2rem;
      // background: none;
      position: absolute;
      top: 0.5em;
      left: 4.5em;
      width: 6em;
      padding: 0;
      text-align: left;
      font-weight: 700;
    }
    .reply {
      .content {
        border-left: none;
        padding: 0 0 0 1ch;
        margin: 3em 0 ;
        line-height: 2rem;
        text-align: left;
      }
    }
  }
}
</style>
