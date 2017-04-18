<template lang="pug">
  .ask
    el-button(@click='dialogFormVisible = true, open', icon='edit', size='large')
      | 我要提問
    el-dialog(title='提問', v-model='dialogFormVisible', close-on-click-modal='false', close-on-press-escape='false')
      template(attributes='close-on-press-escape = false')
      el-form(:model='form')
        el-input.title(type='textarea', autosize='', placeholder='請輸入標題', v-model='title')
        el-input.content(type='textarea', :rows='2', placeholder='請輸入內容', v-model='content')
      .dialog-footer(slot='footer')
        el-button(type='text', @click='dialogFormVisible = false') 取 消
        el-button(type='primary', @click='dialogFormVisible = false') 確 定

</template>

<script>
  import axios from 'axios'
  import querystring from 'querystring'
  export default {
    name: 'ask',
    data () {
      return {
        question: '',
        dialogTableVisible: false,
        dialogFormVisible: false,
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        formLabelWidth: '120px'
      }
    },
    computed: {
      AskLink: function () {
        return 'ht'
      }
    },
    methods: {
      key: function () {
      },
      submit: function () {
        let bobydata = querystring.stringify({ 'title': '第一次測是使用vue post', 'raw': '第一次內容測試測是使用vue post' })
        console.log(bobydata)
        axios({
          method: 'post',
          url: this.AskLink,
          data: {
            title: '第二次測是使用vue post',
            raw: '第二次內容測試測是使用vue post'
          }
        })
        // axios.post(this.AskLink, querystring.stringify({ 'title': '第一次測是使用vue post', 'raw': '第一次內容測試測是使用vue post' }))
        // .then(response => {})
        // .catch(e => {
        //   this.errors.push(e)
        // })
      }
    },
    created: function () {
      // $('.el-dialog').attributes({
      //   size: 'full'
      // })
    }
  }
</script>

<style lang="scss">
.title {
  margin: 1em 0;
}
</style>
