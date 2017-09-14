<template lang="pug">
  #app
    Navbar.nav(:users="users")
    transition(name='fade', mode='out-in')
      router-view.view(:users="users", :topics="topicList", :watchCategory="watchCategory")
    el-button.page-up(@click='goAnchor', icon='arrow-up', size='large')
    Foot.footer
</template>
<script>
  import LocalStorage from './js/LocalStorage.js'
  import es6promise from 'es6-promise'
  import Navbar from './components/Header.vue'
  import Foot from './components/Footer.vue'
  import axios from 'axios'
  // import config from '../config'
  import $ from 'jquery'
  export default {
    name: 'app',
    components: {
      Navbar,
      Foot
    },
    data () {
      return {
        users: [],
        topicList: [],
        local_storage: '',
        watchCategory: []
      }
    },
    methods: {
      proxyUrlLink: function (link) {
        let localstorage = window.localStorage
        let subscribeStatus = process.env.proxyHost + '/users/' + localstorage.username + '/subscribestatus?sso=' + localstorage.sso + '&sig=' + localstorage.sig

        if (link === 'subscribeStatus') return subscribeStatus
      },
      goAnchor: function (anchor) {
        $('html, body').animate({
          scrollTop: 0
        }, 1000)
      },
      getAllUser: function () {
        axios.get('https://talk.pdis.nat.gov.tw/groups/wiselike/members.json?limit=100000')
        .then((Users) => {
          let allUsers = Users.data.members
          // let
          // console.log(allUsers)
          for (let users of allUsers) {
            let user = {
              id: '',
              name: '',
              nickname: '',
              avatar: '',
              background: ''
            }
            user.id = users.id
            user.name = users.username.toLowerCase()
            user.avatar = 'https://talk.pdis.nat.gov.tw' + users.avatar_template.replace(/{size}/, '200')
            /* check users.name data */
            users.name !== '' ? (user.nickname = users.name) : (user.nickname = users.username)
            this.users.push(user)
            // console.log(user)
          }
        })
      },
      /* get user watch category list */
      getWatchCategory: function () {
        this.local_storage = window.localStorage
        if (this.local_storage.username !== undefined) {
          axios.get(this.proxyUrlLink('subscribeStatus'))
          .then((val) => {
            this.watchCategory = val.data
          })
        }
      }
    },
    created: function () {
      this.getAllUser()
      this.getWatchCategory()
      /* axios for IE11 */
      es6promise.polyfill()
      LocalStorage.ClearLocalStorage('delete')
      LocalStorage.ClearLocalStorage('Ask')
      LocalStorage.ClearLocalStorage('reply')
    }
  }
</script>

<style lang="scss" scoped>
@import 'global.scss';
#app {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  min-height: 100vh;
  background: $bgcolor;
  .nav {
    // flex: 0 0 3rem;
    position: absolute;
    z-index: 1000;
    width: 100%;
  }
  .view {
    flex: 1 0 auto; /* ie11 hates 0px */
    margin-top: 5rem;
    width: 100%;
  }
  .footer {
    flex: 0 0 7rem;
    text-align: center;
    border-top: 1px solid lightgray;
    width: 100%; /* fix for ie11 */
  }
  .page-up {
    background-color: #324157;
    position: fixed;
    color: white;
    right: 0.5em;
    bottom: 1em;
    width: 2.5em;
    height: 2.5em;
    border-radius: 2.5em;
    cursor: pointer;
    font-size: 1.5em;
    opacity: 1;
    transition: .3s;
    z-index: 100;
  }
}
@media all and (max-width: $mobilebreakpoint) {
  #app {
    .page-up {
      font-size: 1rem;
      padding: 0 0 0 0.2em;
    }
  }
}
</style>
