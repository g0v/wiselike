// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'normalize.css'
import 'element-ui/lib/theme-default/index.css'
import Vue from 'vue'
import App from './App'
import router from './router'
import Element from 'element-ui'
import 'url-search-params-polyfill'
import VueBus from 'vue-bus'
Vue.use(VueBus)
// import mavonEditor from 'mavon-editor'
// import 'mavon-editor/dist/css/index.css'

//     // use
// Vue.use(mavonEditor)

var editor = require('./components/Wisdom.vue')

Vue.use(Element)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
},
  {
    el: '#app',
    render: h => h(editor)
  }
)
