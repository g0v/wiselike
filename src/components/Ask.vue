<template lang="pug">
  .ask

    el-button(@click='openAsk', icon='edit', size='large')
      | 我要提問

    el-dialog.askDialog.dim(title='建立新的問題', v-model='dialogFormVisible', :close-on-click-modal='false', :modal-append-to-body='false')
      .anonymously(v-if='hasLoginAlert() === true') 您尚未登入網站，將以匿名提問！
      
      el-input.input(v-model='title', auto-complete='off',type='textarea', :rows="2", placeholder='請輸入標題，欄位長度需大於10個字')
      #editor
        mavon-editor.mavon(style='height: 100%', v-model="markdownText", :toolbars="toolbars", :scrollStyle='true', :language = "'en'")
        el-tag.tag(type='primary') 欄位長度需大於10個字。
        //- el-button.button(style='float:right', type='primary', @click="tes") 測 試
        el-button.button(style='float:right', type='primary', @click="submit") 送 出
        el-button.button(style='float:right', @click="dialogFormVisible = false") 取 消

</template>

<script>
  import wisdom from './Wisdom.vue'
  import { mavonEditor } from 'mavon-editor'
  import '../css/index.css'
  import axios from 'axios'
  import config from '../../config'
  import $ from 'jquery'
  export default {
    name: 'ask',
    props: ['userId'],
    components: {
      'mavon-editor': mavonEditor,
      wisdom
    },
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
        loginalert: false,
        markdownText: '',
        reply: false,
        topId: '',
        title: '',
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
      // tes: function () {
      //   this.$bus.emit('add-todo', {
      //     type: 'temporary',
      //     title: this.title,
      //     content: $('.v-show-content')[0].innerHTML
      //   })
      // },
      border: function (attribute, color) {
        let property = '5px solid ' + color
        setTimeout(function () { $(attribute).css('border', property) }, 100)
        setTimeout(function () { $(attribute).css('border', 'none') }, 2000)
      },
      openAsk: function () {
        this.dialogFormVisible = true
        this.border('.input', 'rgba(0, 75, 250, 0.38)')
      },
      AskLink: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.userId + '/wisdoms?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      submit: function (formName) {
        this.local_storage = window.localStorage
        let strLength = this.markdownText.replace(/\s/g, '')

        if (this.title.length < 10) {
          this.$message.error('標題欄位長度需大於10個字。')
          this.border('.input', 'red')
          return
        } else if (strLength.length < 10) {
          this.border('.mavon', 'red')
          this.$message.error('內文欄位長度需大於10個字。')
          return
        }

        let vm = this
        let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        let form = new URLSearchParams()
        form.append('title', this.title)
        form.append('raw', this.markdownText)
        axios.post(this.AskLink(this.local_storage), form, config)
        .then((val) => {
          let id = val.data.success
          this.$bus.emit('add-todo', {
            type: 'myquestion',
            topicid: id
          })
          this.dialogFormVisible = false
          this.title = this.markdownText = ''
          vm.$message.success('成功回覆，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')
        })
        .catch(function (error) {
          console.log(error)
          vm.$message.error('回覆失敗，請稍後重試。')
        })
      },
      hasLoginAlert: function () {
        if (this.local_storage.username === undefined) {
          this.loginalert = true
        }
      }
    },
    created: function () {
      this.local_storage = window.localStorage
    }
  }
</script>

<style lang="scss" scoped>
.ask {
  .anonymously {
    margin-top: -1em;
    color: blue;
    font-size: 1.2rem;
    font-weight: 700;
  }
  .askDialog {
    position: fixed;
  }
  #editor {
    height: 50vh;
    margin-bottom: 3em;
    .mavon {
      margin-bottom: 1em;
    }
    .button {
      margin-left: 1em
    }
  
  }
  .input {
    margin-bottom: 1em;
    width: 50%;
    margin-right: 50%;
    // border: 5px solid rgba(0, 75, 250, 0.38);
  }
}
</style>
