<template lang="pug">
  .ask
    el-button(@click='dialogFormVisible = true', icon='edit', size='large')
      | 我要提問
    el-dialog(title='提問', v-model='dialogFormVisible', :close-on-click-modal='false', :modal-append-to-body='false')
      .anonymously(v-if='loginalert === true') 您尚未登入網站，將以匿名提問！
      //- el-alert(v-if='loginalert === true', title='請先登入', type='error', show-icon='')
      el-form.demo-ruleForm(:model='ruleForm', :rules='rules', ref='ruleForm')
        el-form-item(prop='title', label='標題')
          el-input(v-model='ruleForm.title', auto-complete='off',type='textarea', autosize="", placeholder='請輸入標題')
        el-form-item(prop='content', label='內容')
          el-input(v-model='ruleForm.content', auto-complete='off',type='textarea', :autosize="{ minRows: 10, maxRows: 30}", placeholder='請輸入內容')
      .dialog-footer(slot='footer')
        el-button(type='text', @click='dialogFormVisible = false') 取 消
        el-button(type='primary', @click="submit('ruleForm')") 確 定
</template>

<script>
  import axios from 'axios'
  import config from '../../config'
  export default {
    name: 'ask',
    props: ['userId'],
    data () {
      var CheckContent = (rule, value, callback) => {
        if (String(value).length < 15) {
          callback(new Error('欄位長度需大於15個字'))
        } else {
          callback()
        }
      }
      return {
        ruleForm: {
          title: '',
          content: ''
        },
        rules: {
          content: [
            { validator: CheckContent, trigger: 'blur' }
          ],
          title: [
            { validator: CheckContent, trigger: 'blur' }
          ]
        },
        local_storage: {},
        dialogTableVisible: false,
        dialogFormVisible: false,
        loginalert: false
      }
    },
    methods: {
      AskLink: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.userId + '/wisdoms?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      submit: function (formName) {
        this.local_storage = window.localStorage
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.dialogFormVisible = false
            let vm = this
            let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            let form = new URLSearchParams()
            form.append('title', this.ruleForm.title)
            form.append('raw', this.ruleForm.content)
            axios.post(this.AskLink(this.local_storage), form, config)
            .then((val) => {
              /* push mock data into wisdom */
              vm.sucessful()
            })
            .catch(function (error) {
              console.log(error)
              vm.error()
            })
          } else {
            return false
          }
        })
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
          message: '成功發送提問，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。',
          type: 'success'
        })
      }
    },
    created: function () {
      this.local_storage = window.localStorage
      if (this.local_storage.username === undefined) {
        this.loginalert = true
      }
    }
  }
</script>

<style lang="scss" scoped>
.title {
  margin: 1em 0;
}
.ask {
  .anonymously {
    margin-top: -1em;
    color: blue;
    font-size: 1.2rem;
    font-weight: 700;
  }
}
</style>
