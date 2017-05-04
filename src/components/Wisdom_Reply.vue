<template lang="pug">
  .wisdom_reply
    el-form.demo-ruleForm(:model='ruleForm', :rules='rules', ref='ruleForm')
      el-form-item(prop='content')
        .reply
          el-input(v-model='ruleForm.content', auto-complete='off', type='textarea', autosize='', placeholder='我要回應...')
          el-button(type='primary', @click="submit('ruleForm')") 送 出

</template>

<script>
  import axios from 'axios'
  import config from '../../config'
  export default {
    name: 'ask',
    props: ['userId', 'topicid', 'slug', 'ProfileCategoryId'],
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
        local_storage: {}
      }
    },
    methods: {
      AskLink: function (localstorage) {
        return config.runtime.proxyHost + '/users/inbox-' + this.userId + '/wisdoms/topic?sso=' + localstorage.sso + '&sig=' + localstorage.sig + '&topicid=' + this.topicid + '&categoryid=' + this.ProfileCategoryId + '&slug=' + this.slug
      },
      submit: function (formName) {
        this.local_storage = window.localStorage
        if (this.local_storage.length === 3) {
          this.$refs[formName].validate((valid) => {
            if (valid) {
              axios({
                method: 'post',
                url: this.AskLink(this.local_storage),
                data: {raw: this.ruleForm.content}
              })
              .then(() => {
                /* push mock data into wisdom */
              })
              this.sucessful()
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
      sucessful () {
        this.ruleForm.content = null
        this.$message({
          showClose: true,
          message: '成功發送回覆，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。',
          type: 'success'
        })
      }
    },
    created: function () {
    }
  }
</script>

<style lang="scss">
.title {
  margin: 1em 0;
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
