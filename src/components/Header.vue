<template lang="pug">
  .header
    el-menu(theme='dark', mode='horizontal')
      el-row.row-bg(type='flex', justify='space-between')
       el-col.left(:span='8')
        Search(:users="users")
       el-col.center(:span='8')
        router-link.logo(to='/', exact='') Wiselike
       el-col.btn-group(:span='8')
          el-button.create Create My Profile
          span(v-if="username === null")
            el-button.login(@click.native="login") Login
          span(v-else)
            el-button {{username}}

</template>

<script>
  import Search from './Search.vue'
  import config from '../../config'

  export default {
    name: 'header',
    props: ['users'],
    components: {
      Search
    },
    data () {
      return {
        myKey: '',
        username: ''
      }
    },
    methods: {
      login: function (event) {
        window.open(config.runtime.proxyHost + '/login')
      }
    },
    mounted: function () {
      this.username = window.localStorage.getItem('username')
      window.addEventListener('message', (event) => {
        console.log(event)
        if (event.origin !== config.runtime.proxyHost) {
          console.log('Incorrect origin')
          return
        }
        this.username = event.data.username
        window.localStorage.setItem('username', event.data.username)
        window.localStorage.setItem('sso', event.data.sso)
        window.localStorage.setItem('sig', event.data.sig)
      }, false)
    }
  }
</script>

<style lang="scss" scoped>
  .header {
    position: fixed;
    z-index: 99;
    box-sizing: border-box;
    width: 100%;
    // .el-menu{
    //   height: 50px;
    // }
    .left {
      margin: auto;
      text-align: left;
    }
    .center{
      text-align: center;
      margin: auto;
      .logo{
        text-decoration: none;
        color: white;
        font-size: 2.2rem;
      }
      .logo:hover{
        color:#20a0ff;
      }
    }
  }
  .btn-group{
    text-align: right;
    margin: auto;
    .el-button.create{
      margin-right: 6px;
    }
  }
  // .logo{
  //   text-decoration: none;
  //   color: white;
  //   font-size: 2rem;
  // }
  // .logo:hover{
  //   color:#20a0ff;
  // }
</style>
