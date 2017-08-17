<template lang="pug">
  .header
    router-link.logo(to='/', exact='') wiselike
    span.right
      //- search
      el-button.mob(type="text", icon='search', @click='dialogTableVisible = true')
      el-dialog.dialog( v-model='dialogTableVisible', :modal-append-to-body='false', :show-close='false')
        Search(:users="users")
      //- sign-in
      template(v-if="username")
        el-button.text.mobtext(v-if="checkprofile", @click="CreateProfile", index='1') Create
        el-button.text.mobtext(v-if="checkprofile", @click='logout') LogOut
      template(v-else)
        el-button.text(@click.native="login", index='0') Sign in
        el-button.text(@click.native="howtouse", index='0') ?
      //- my profile
      el-dropdown(trigger='click')
        span.el-dropdown-link
          img.avatar(v-if="username && !checkprofile", :src='userIcon', :title='username')
        el-dropdown-menu(slot='dropdown')
          el-dropdown-item: router-link.submenu(:to="'/user/' + username") My Profile
          el-dropdown-item: span.submenu(@click="logout") Log Out
    .search
      Search.nav(:users="users")

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
        dialogTableVisible: false,
        myKey: '',
        username: '',
        userIcon: '',
        checkprofile: true,
        visible2: false,
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
  padding-top: 1em;
  .search{
    float:right;
    margin-right:1rem;
  }

  .mob{
    margin-right:0.5em;
    color: $fontcolor;
    font-size: 1.3rem;
    font-weight: 700;
    padding: 0.3em;
    vertical-align: middle;
  }
  .logo{
    color: $logocolor;
    font-family: $logofont;
    text-decoration: none;
    font-size: 2.2rem;
    padding: 0 1ch;
    vertical-align: -webkit-baseline-middle;
  }
  .avatar{
    display: inline-block;
    width: 3em;
    border-radius: 4px;
    margin-right: 8px;
    vertical-align: middle;
    &:hover {
      cursor: pointer;
    }
  }
  .text {
    color: whilte;
    font-size: 1.3rem;
    font-weight: 500;
  }
  .right{
    float:right;
    margin-right: 2em;
  }
  @media all and (max-width: $mobilebreakpoint) {
    .logo{
      font-size: 1.5rem;
    }
    .nav {
      display: none;
    }
    .right .avatar {
      width: 2em;
    }
    .text {
      font-size: 1.2rem;
      padding: 0.3em;
    }
    .mobtext{
      font-size: 0.9rem !important;
      padding: 0.3em !important;
      margin: 0.1em !important;
    }
  }
  @media all and (min-width: $mobilebreakpoint) {
    .mob{
      display: none;
    }
    .search{
      font-size: 2rem;
    }
  }
}
</style>
