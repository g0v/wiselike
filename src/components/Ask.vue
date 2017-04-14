<template lang="pug">
  el-form
    el-form-item
      el-input(type='textarea' v-model="question")
    el-form-item
      el-button(type="primary", @click="submit") 提問
    
</template>

<script>
  import axios from 'axios'
  import querystring from 'querystring'
  export default {
    name: 'ask',
    data () {
      return {
        question: ''
      }
    },
    computed: {
      AskLink: function () {
        return 'http://localhost:9000/users/smith02620/wisdoms?sso=bm9uY2U9NTMzYjQxZjYzYjIxNTQxZDQ5NjVjOGI5MDZlMjg4ZDcmbmFtZT1zbWl0aCZ1c2VybmFtZT1zbWl0aDAyNjIwJmVtYWlsPXN3aXRoMDI2MjAlNDBleS5nb3YudHcmZXh0ZXJuYWxfaWQ9MjMmcmV0dXJuX3Nzb191cmw9aHR0cCUzQSUyRiUyRmxvY2FsaG9zdCUzQTkwMDAlMkZzc29fZG9uZSZhZG1pbj10cnVlJm1vZGVyYXRvcj10cnVl&sig=ea618945d270af69cefcd65a7d930a5ed102b0a4458547e5263bb18233bbb66d'
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
    }
  }
</script>

<style lang="scss" scoped>
</style>
