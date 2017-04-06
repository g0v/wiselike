<template lang="pug">
  .Search
    el-autocomplete(popper-class="my-autocomplete",
      v-model="state2",
      icon="search",
      custom-item="my-item-zh",
      :fetch-suggestions="querySearch",
      placeholder="搜尋用戶...",
      :on-icon-click="handleIconClick",
      :trigger-on-focus="false",
      @select="handleSelect")


</template>

<script>
  import Vue from 'vue'
  Vue.component('my-item-zh', {
    functional: true,
    render: function (h, ctx) {
      var item = ctx.props.item
      var route = '/profile/' + item.userId
      return h('li', ctx.data, [
        h('router-link', { attrs: { class: 'name', to: route } }, [item.userId])
        // h('span', { attrs: { class: 'addr' } }, [item.title])
      ])
    },
    props: {
      item: { type: Object, required: true }
    }
  })
  import profile from './Profile.vue'
  export default {
    name: 'search',
    components: {
      profile
    },
    props: ['myKey', 'users'],
    data () {
      return {
        userList: [],
        state2: '',
        sUser: []
      }
    },
    methods: {
      querySearch (queryString, cb) {
        var users = this.userList
        console.log(users)
        var results = queryString ? users.filter(this.createFilter(queryString)) : users
        cb(results)
      },
      createFilter (queryString) {
        var reg = new RegExp(queryString, 'i')
        return (o) => {
          // return (restaurant.value.indexOf(queryString) === 0)
          return (reg.test(o.userId) || reg.test(o.title))
        }
      },
      handleSelect (item) {
        this.sUser = item
        console.log(this.sUser)
      },
      handleIconClick (ev) {
        console.log(ev)
      }
    },
    mounted () {
      this.userList = this.users
      this.sUser = this.sUser
    }
  }
</script>


<style lang="scss">
.my-autocomplete{
  li {
    line-height: normal;
    padding: 7px;
    .name {
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .addr {
      font-size: 12px;
      color: #b4b4b4;
    }
    .highlighted .addr {
      color: #ddd;
    }
  }
}
</style>
