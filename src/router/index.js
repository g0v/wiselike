import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Me from '@/components/Me'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    }, {
      path: '/me',
      name: 'Me',
      component: Me
    }
  ]
})
