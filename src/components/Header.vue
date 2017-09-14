<template lang="pug">
  .header
    router-link.logo(to='/', exact='') wiselike
    span.right
      //- search
      el-button.mob.hide-on-fat(type="text", icon='search', @click='dialogTableVisible = true')
      el-dialog.dialog( v-model='dialogTableVisible', :modal-append-to-body='false', :show-close='false')
        Search(:users="users")
      //- sign-in
      template(v-if="username")
        el-button.text.mobtext(v-if="checkprofile", @click="CreateProfile", index='1') 創建專頁
        el-button.text.mobtext(v-if="checkprofile", @click='logout') 登出
      template(v-else)
        el-button.text(@click.native="login", index='0') 登入
        router-link.link(:to='"/howtouse"')
          i.el-icon-information
      //- my profile
      el-dropdown(trigger='click', v-if='username', :hide-on-click="false")
        span.el-dropdown-link.link
          img.avatar(v-if="username && !checkprofile", :src='userIcon', :title='username')
          i.el-icon-setting
        el-dropdown-menu(slot='dropdown')
          el-dropdown-item: router-link(:to="'/user/' + username", style="display:block;") 我的專頁
          el-dropdown-item: div(@click="logout") 登出
    Search.right.hide-on-thin(:users="users")

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
        window.open(process.env.proxyHost + '/login', '_blank')
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
      let googleTranslateCombobox = document.querySelector('.goog-te-combo')
      if (!navigator.languages) return
      if (navigator.languages.find(function (lang) { return lang.match(/^zh/) })) return
      googleTranslateCombobox.value = navigator.language.split('-')[0] // "en-US" to "en"
      googleTranslateCombobox.dispatchEvent(new Event('change'))
    }
  }
</script>

<style lang="scss" >
@import url('https://fonts.googleapis.com/css?family=Kadwa');
@import '../global.scss';
.header {
  padding: 1em 0 0 0;
  max-width: $maxWidth;
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
  }
  .avatar{
    display: inline-block;
    width: 3em;
    border-radius: 50%;
    vertical-align: middle;
  }
  .link {
    margin: 0 0 0 1ch;
    &:hover {
      cursor: pointer;
    }
  }
  .right{
    float:right;
    margin-right: 1ch;
  }
  .left {
    float: left;
    margin-left: 1ch;
  }
  @media all and (max-width: $mobilebreakpoint) {
    .logo{
      font-size: 1.5rem;
    }
    .right .avatar {
      width: 2em;
    }
    .mobtext{
      font-size: 0.9rem !important;
      padding: 0.3em !important;
      margin: 0.1em !important;
    }
    .hide-on-thin {
      display: none;
    }
  }
  @media all and (min-width: $mobilebreakpoint) {
    .hide-on-fat{
      display: none;
    }
  }
}
</style>
