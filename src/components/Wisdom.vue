<template lang="pug">

  el-card.box-card(v-if="deleteCom")
    .clearfix(slot='header')
      h2
        i.fa.fa-long-arrow-right
        |  {{content.title}}
        el-popover(ref='popover5', placement='top', width='160', v-model='visible2')
          h2 確認刪除此問題？
          div(style='text-align: right; margin: 0')
            el-button(size='mini', type='text', @click='visible2 = false') 取消
            el-button(type='primary', size='mini', @click='DeletePrivate') 确定
        el-button.delete(v-if="deleteQ === true", v-popover:popover5='') 删除
    .text.item(v-for='(post, index) of content.posts', :class="{sereply: index >= 2}")
      p
        img.avatar(:src='post.icon')
        span.el-dialog__title
          | {{post.author}}
          span(v-if="index === 0")
            |  提問
          span(v-else)
            |  回應
            sup  {{post.time}}
      p.sereply(v-html='post.content')

    //- wisdomreply(:userId='userId', :topicid='content.topicId', :type='content.category')
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
</template>

<script>
  // import axios from 'axios'
  import wisdomprivate from './Wisdom_Private.vue'
  import wisdomreply from './Wisdom_Reply.vue'
  import axios from 'axios'
  import config from '../../config'
  export default {
    name: 'wisdom',
    props: ['content', 'userId', 'type'],
    components: {
      wisdomprivate,
      wisdomreply
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
        deleteQ: false,
        deleteCom: true
      }
    },
    methods: {
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
        return config.runtime.proxyHost + '/users/' + this.userId + '/wisdoms/topic?sso=' + localstorage.sso + '&sig=' + localstorage.sig + '&topicid=' + this.content.topicId + '&type=' + this.content.category
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
          this.content.posts.push(temporaryPost)
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
      // let date = new Date()
      // let D = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate())
      // console.log(this.local_storage = window.localStorage)
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
@import 'node_modules/font-awesome/scss/font-awesome';
  .delete {
    float: right;
    color: white;
    font-weight: 700;
    background-color: red;
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
    .el-textarea {
      display: inline-block;
      width: 88%;
      vertical-align: bottom;
    }
  }
  .loader {
    font-size: large;
    height: 3em;
    width: 100%;
  }
</style>
