import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Me from '@/components/Me'
import Profile from '../components/Profile.vue'
import Searchresult from '../components/Searchresult.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/me',
      name: 'Me',
      component: Me
    },
    {
      path: '/user/:userId',
      name: 'profile',
      component: Profile
    },
    {
      path: '/Searchresult/:category/:result',
      name: 'Search_result',
      component: Searchresult
    }
  ]
})
