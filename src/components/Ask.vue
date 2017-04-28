<template lang="pug">
  .ask
    el-button(@click='dialogFormVisible = true', icon='edit', size='large')
      | 我要提問
    el-dialog(title='提問', v-model='dialogFormVisible', :close-on-click-modal='false', :modal-append-to-body='false')
      el-alert(v-if='loginalert === true', title='請先登入', type='error', show-icon='')
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
        if (this.local_storage.length === 3) {
          this.loginalert = false
          this.$refs[formName].validate((valid) => {
            if (valid) {
              this.dialogFormVisible = false
              axios({
                method: 'post',
                url: this.AskLink(this.local_storage),
                data: {title: this.ruleForm.title, raw: this.ruleForm.content}
              }).catch(function (error) {
                console.log(error)
              })
              this.sucessful()
            } else {
              return false
            }
          })
        } else {
          this.loginalert = true
          // this.dialogFormVisible = false
          // alert('請先登入')
        }
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
    }
  }
</script>

<style lang="scss">
.title {
  margin: 1em 0;
}
</style>
