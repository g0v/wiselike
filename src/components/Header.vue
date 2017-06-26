<template lang="pug">
  .header
    el-menu.menu(theme='dark', mode='horizontal')
      el-row.row-bg(type='flex', justify='space-between')
        el-col.left(:sm='8', :xs='7')
          Search.nav(:users="users")
          el-menu-item.desktop.operation.text(v-if="!username", @click.native="howtouse", index='0') 如何登入
        el-col.center(:sm='8', :xs='10')
          router-link.logo(to='/', exact='') wiselike
        el-col.right(:sm='8', :xs='7')
          el-menu-item.mobile.operation.text(v-if="!username", @click.native="howtouse", index='0') 如何登入
          el-menu-item.operation.text(v-if="!username", @click.native="login", index='0') Sign in
          template(v-else)
            el-button.signout2.text(v-if="checkprofile", @click='logout') Sign out
            el-menu-item.create.text(v-if="checkprofile", @click="CreateProfile", index='1') Create My Profile
            el-submenu.operation(v-else, index='2')
              template(slot='title')
                img.avatar(:src='userIcon', :title='username')
              el-menu-item(index='2-1', disabled='')
                router-link.submenu(:to="'/user/' + username") My Profile
              el-menu-item(index='2-2')
                span.submenu(@click="logout") Sign out

</template>

<script>
  import { Loading } from 'element-ui'
  import Search from './Searchbar.vue'
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
        userIcon: '',
        checkprofile: true,
        local_storage: ''
      }
    },
    methods: {
      howtouse: function () {
        this.$router.push({
          path: '/howtouse'
        })
      },
      warningmessage: function () {
        this.$message({
          showClose: true,
          message: '請先登入',
          type: 'warning'
        })
      },
      Link: function (localstorage) {
        // return config.runtime.proxyHost + '/users/' + this.username + '/createprofile?sso=' + localstorage.sso + '&sig=' + localstorage.sig
        return process.env.proxyHost + '/users/' + this.username + '/createprofile?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      login: function (event) {
        // window.open(config.runtime.proxyHost + '/login')
        window.open(process.env.proxyHost + '/login')
      },
      logout: function (event) {
        window.localStorage.removeItem('userIcon')
        window.localStorage.removeItem('username')
        window.localStorage.removeItem('sso')
        window.localStorage.removeItem('sig')
        window.location.reload()
      },
      CreateProfile: async function (event) {
        let loadingInstance = Loading.service({ fullscreen: true, text: '資料建構中，請稍等' })
        this.local_storage = window.localStorage
        if (this.username === null) {
          this.warningmessage()
        } else {
          let vm = this
          let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          let form = new URLSearchParams()
          form.append('local_storage', this.local_storage)
          axios.post(this.Link(this.local_storage), form, config)
          .then(() => {
            loadingInstance.close()
            location.reload()
            vm.$router.push({
              path: '/user/' + this.username
            })
          })
          .catch(function (error) {
            console.log(error)
            loadingInstance.close()
            this.$message.error('建立失敗，請稍後重試。')
          })
        }
      },
      setlocalstorage: function () {
        // this.username = window.localStorage.getItem('username')
        // this.local_storage = window.localStorage
        // console.log('setlocalstorage')
        window.addEventListener('message', (event) => {
          // if (event.origin !== config.runtime.proxyHost) {
          if (event.origin === process.env.proxyHost) {
            this.username = event.data.username.toLowerCase()
            window.localStorage.setItem('userIcon', this.userIcon)
            window.localStorage.setItem('username', event.data.username.toLowerCase())
            window.localStorage.setItem('sso', event.data.sso)
            window.localStorage.setItem('sig', event.data.sig)
            // console.log(event.data.username)
            window.location.reload()
          }
        }, false)
      }
    },
    mounted: function () {
      this.setlocalstorage()
    },
    updated: function () {
      this.username = window.localStorage.getItem('username')
      this.users.filter((post) => {
        (post.name === this.username) && (this.checkprofile = false)
        if (post.name === this.username) {
          this.checkprofile = false
          this.userIcon = post.avatar
        }
      })
    }
  }
</script>

<style lang="scss" >
@import url('https://fonts.googleapis.com/css?family=Kadwa');
@import '../global.scss';
.header {
  .menu{
    padding: 0.5em 1em;
    background: none;
  }
  .text {
    color: #0f78f3;
    font-size: 1.3rem;
    font-weight: 700;
  }
  .left {
    margin: auto;
    text-align: left;
  }
  .center{
    text-align: center;
    margin: auto;
    .logo{
      color: $logocolor;
      font-family: $logofont;
      text-decoration: none;
      font-size: 2.2rem;
      padding: 0 1ch;
      &:hover {
        background: $fontcolor;
      }
    }
  }
  .right{
    text-align: right;
    margin: auto;
    .create{
      margin-right: 6px;
      float:right;
    }
    .operation{
      float:right;
    }
    .submenu{
      display: block;
      font-size: 16px;
    }
    .signout2{
      font-size: 1.3rem;
      background-color: transparent;
      border: 0;
      margin-top: 0.5em;
    }
    .avatar{
      display: inline-block;
      width: 3em;
      border-radius: 4px;
      margin-right: 8px;
      vertical-align: middle;
    }
    .username{
      font-size: 16px;
    }
  }
  .el-submenu.is-active .el-submenu__title {
    border-bottom:none;
  }
  .el-menu--horizontal.el-menu--dark .el-submenu .el-menu-item.is-active{
    color: #48576a;
  }
  // .el-menu--horizontal.el-menu--dark .el-menu-item:hover, .el-menu--horizontal.el-menu--dark .el-submenu__title:hover {
      
  // }
  @media all and (max-width: $breakpoint) {
    .center .logo {
      font-size: 1.8rem;
      padding: 0;
    }
    .menu {
        padding: 0.5em 0.5em;
    }
    .nav {
      display: none;
    }
    .mobile{
      display: none;
    }
    .right .avatar {
      width: 2em;
    }
    .text {
      font-size: 1rem;
      padding: 0;
    }
  }
  @media all and (min-width: $breakpoint) {
    .desktop{
      display: none;
    }
  }
}
</style>
