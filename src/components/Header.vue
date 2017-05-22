<template lang="pug">
  .header
    el-menu.menu(theme='dark', mode='horizontal')
      el-row.row-bg(type='flex', justify='space-between')
        el-col.left(:span='8')
          Search(:users="users")
        el-col.center(:span='8')
          router-link.logo(to='/', exact='') wiselike
        el-col.right(:span='8')
          template(v-if="username === null")
            el-button.login(@click.native="login") Sign in
          template(v-else)
            template(v-if="checkprofile === true")
              el-button.create(@click="CreateProfile") Create My Profile
            template(v-else)
              el-submenu.operation(index='1') 
                template(slot='title') Hello, {{username}}
                el-menu-item(index='1-1')
                  router-link(:to="'/user/' + username") My Profile
                el-menu-item(index='1-2')
                  .logout(@click="logout") Sign out

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
      // router: async function () {
      //   this.$router.push({
      //     path: '/user/' + this.username
      //   })
      // },
      Link: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.username + '/createprofile?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      login: function (event) {
        window.open(config.runtime.proxyHost + '/login')
      },
      logout: function (event) {
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
      }
    },
    mounted: function () {
      this.username = window.localStorage.getItem('username')
      this.local_storage = window.localStorage
      window.addEventListener('message', (event) => {
        // console.log(event)
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
      // color: white;
      font-size: 2.2rem;
      color: gold;
      // text-shadow: 1px 1px 0 lightgray;
    }
  }
  .right{
    text-align: right;
    margin: auto;
    .create{
      margin-right: 6px;
      // text-decoration: none;
    }
    .operation{
      float:right;
    }
    .hello{
      float:right;
    }
  }
}
</style>
