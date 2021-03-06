import Vue from 'vue'
import Router from 'vue-router'
// import Hello from '@/components/Hello'
// import Me from '@/components/Me'
// import Profile from '../components/Profile.vue'
// import Searchresult from '../components/Searchresult.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      // component: Hello，
      component: resolve => require(['@/components/Hello'], resolve)
    },
    {
      path: '/me',
      name: 'Me',
      // component: Me
      component: resolve => require(['@/components/Me'], resolve)
    },
    {
      path: '/user/:userId',
      name: 'profile',
      // component: Profile
      component: resolve => require(['../components/Profile.vue'], resolve)
    },
    {
      path: '/Searchresult/:category/:result',
      name: 'Search_result',
      // component: Searchresult
      component: resolve => require(['../components/Searchresult.vue'], resolve)
    },
    {
      path: '/howtouse',
      name: 'howtouse',
      // component: Profile
      component: resolve => require(['../components/Howtouse.vue'], resolve)
    }
  ]
})
