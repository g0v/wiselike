<template lang="pug">
  .header
    el-menu.menu(mode='horizontal')
      el-row.row-bg(type='flex', justify='space-between')
        el-col.left(:span='8')
          Search(:users="users")
        el-col.center(:span='8')
          router-link.logo(to='/', exact='') wiselike
        el-col.right(:span='8')
          span(v-if="checkprofile === true")
            el-button.create(v-on:click="CreateProfile") Create My Profile
          span(v-else)
            el-button.create(v-on:click="router") My Profile
          span(v-if="username === null")
            el-button.login(@click.native="login") Login
          span(v-else)
            el-button {{username}}
            //- (v-on:click="CreateProfile", v-if='checkprofile === true')

</template>

<script>
  import Search from './Search.vue'
  import config from '../../config'
  import axios from 'axios'
  export default {
    name: 'header',
    props: ['users'],
    components: {
      Search
    },
    data () {
      return {
        myKey: '',
        username: '',
        checkprofile: true,
        local_storage: ''
      }
    },
    methods: {
      warningmessage: function () {
        this.$message({
          showClose: true,
          message: '請先登入',
          type: 'warning'
        })
      },
      router: async function () {
        this.$router.push({
          path: '/user/' + this.username
        })
      },
      Link: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.username + '/createprofile?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      login: function (event) {
        window.open(config.runtime.proxyHost + '/login')
      },
      CreateProfile: async function (event) {
        if (this.username === null) {
          this.warningmessage()
        } else {
          axios({
            method: 'post',
            url: this.Link(this.local_storage)
          })
          location.reload()
          this.$router.push({
            path: '/user/' + this.username
          })
        }
      }
    },
    mounted: function () {
      this.username = window.localStorage.getItem('username')
      this.local_storage = window.localStorage
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
    },
    updated: function () {
      this.users.filter((post) => { (post.userId === this.username) && (this.checkprofile = false) })
    }
  }
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=Kadwa');
// @import '../global.scss';
.header {
  .menu{
    padding: .5em 1em;
    background: none;
  }
  .left {
    margin: auto;
    text-align: left;
  }
  .center{
    text-align: center;
    margin: auto;
    .logo{
      font-family: 'Kadwa', serif;
      text-decoration: none;
      // color: white;
      font-size: 2.2rem;
      color: gold;
      text-shadow: 1px 1px 0 lightgray;
    }
  }
}
.right{
  text-align: right;
  margin: auto;
  .el-button.create{
    margin-right: 6px;
  }
}
</style>
