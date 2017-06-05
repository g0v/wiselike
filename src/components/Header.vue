<template lang="pug">
  .header
    el-menu.menu(theme='dark', mode='horizontal')
      el-row.row-bg(type='flex', justify='space-between')
        el-col.left(:sm='8', :xs='10')
          Search(:users="users")
        el-col.center(:sm='8', :xs='4')
          router-link.logo(to='/', exact='') wiselike
        el-col.right(:sm='8', :xs='10')
          el-menu-item.operation(v-if="!username", @click.native="login", index='0') Sign in
          template(v-else)
            el-menu-item.create(v-if="checkprofile", @click="CreateProfile", index='1') Create My Profile
            el-submenu.operation(v-else, index='2')
              template(slot='title')
                img.avatar(:src='userIcon')
                span.username {{username}}
              el-menu-item(index='2-1')
                router-link.profile(:to="'/user/' + username") My Profile
              el-menu-item(index='2-2')
                span.signout(@click="logout") Sign out

</template>

<script>
  import Search from './Searchbar.vue'
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
        userIcon: '',
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
      Link: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.username + '/createprofile?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      login: function (event) {
        window.open(config.runtime.proxyHost + '/login')
      },
      logout: function (event) {
        window.localStorage.removeItem('userIcon')
        window.localStorage.removeItem('username')
        window.localStorage.removeItem('sso')
        window.localStorage.removeItem('sig')
        window.location.reload()
      },
      CreateProfile: async function (event) {
        if (this.username === null) {
          this.warningmessage()
        } else {
          let vm = this
          axios({
            method: 'post',
            url: this.Link(this.local_storage)
          })
          .then(() => {
            location.reload()
            vm.$router.push({
              path: '/user/' + this.username
            })
          })
          .catch(function (error) {
            console.log(error)
            vm.error()
          })
        }
      },
      error () {
        this.$message({
          showClose: true,
          message: '建立失敗，請稍後重試。',
          type: 'error'
        })
      },
      sucessful () {
        this.$message({
          showClose: true,
          message: '成功建立 Profile。',
          type: 'success'
        })
      },
      setlocalstorage: function () {
        // this.username = window.localStorage.getItem('username')
        // this.local_storage = window.localStorage
        console.log('setlocalstorage')
        window.addEventListener('message', (event) => {
          console.log(event)
          console.log(config.runtime.proxyHost)
          if (event.origin !== config.runtime.proxyHost) {
            console.log('Incorrect origin')
            return
          }
          this.username = event.data.username
          window.localStorage.setItem('userIcon', this.userIcon)
          window.localStorage.setItem('username', event.data.username)
          window.localStorage.setItem('sso', event.data.sso)
          window.localStorage.setItem('sig', event.data.sig)
          console.log(event.data.username)
          window.location.reload()
        }, false)
      }
    },
    mounted: function () {
      this.setlocalstorage()
    },
    updated: function () {
      this.username = window.localStorage.getItem('username')
      this.users.filter((post) => {
        (post.userId === this.username) && (this.checkprofile = false)
        if (post.userId === this.username) {
          this.checkprofile = false
          this.userIcon = post.userIcon
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
    padding: .5em 1em;
    // background: none;
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
      font-size: 2.2rem;
      color: gold;
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
    .profile{
      display: block;
      font-size: 16px;
    }
    .signout{
      font-size: 16px;
    }
    .avatar{
      display: inline-block;
      width: 25px;
      height: 25px;
      border-radius: 4px;
      margin-right: 8px;
      vertical-align: middle;
    }
    .username{
      font-size: 16px;
    }
  }
  .el-submenu.is-active .el-submenu__title {
    border-bottom-color: #324157;
  }
  .el-menu--horizontal .el-submenu>.el-menu {
    top:70px;
    cursor: pointer;
    right:17px;
    min-width: 77%
  }
  .el-menu--horizontal.el-menu--dark .el-submenu .el-menu-item.is-active, .el-menu-item.is-active {
    color: #48576a;
  }
}
</style>
