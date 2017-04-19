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
  // import $ from 'jQuery'
  export default {
    name: 'ask',
    props: ['userId', 'topicid'],
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
      key: function () {
        console.log(this.topicid)
        console.log(this.AskLink())
      },
      AskLink: function (localstorage) {
        return 'http://localhost:9000/users/' + this.userId + '/wisdoms/' + this.topicid + '?sso=' + localstorage.sso + '&sig=' + localstorage.sig
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
              }).catch(function (error) {
                console.log(error)
                alert('內容不清楚')
              })
            } else {
              return false
            }
          })
        } else {
          this.dialogFormVisible = false
          alert('請先登入')
        }
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
}
</style>
