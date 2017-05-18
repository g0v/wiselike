<template lang="pug">
  .Search
    el-autocomplete(popper-class="my-autocomplete",
      v-model="state2",
      icon="search",
      custom-item="my-item-zh",
      :fetch-suggestions="querySearch",
      placeholder="Search...",
      :trigger-on-focus="false")


</template>

<script>
  import Vue from 'vue'
  Vue.component('my-item-zh', {
    functional: true,
    render: function (h, ctx) {
      var item = ctx.props.item
      var route = '/user/' + item.userId
      var userIcon = item.userIcon
      return h('li', ctx.data, [
        h('router-link', { attrs: { class: 'userList', to: route } }, [
          h('img', { attrs: { class: 'avatar', src: userIcon } }),
          h('span', { attrs: { class: 'user' } }, [item.userName])
        ])
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
        state2: ''
      }
    },
    methods: {
      querySearch (queryString, cb) {
        var users = this.userList
        var results = queryString ? users.filter(this.createFilter(queryString)) : users
        cb(results)
      },
      createFilter (queryString) {
        var reg = new RegExp(queryString, 'i')
        return (o) => {
          return (reg.test(o.userName))
        }
      }
    },
    mounted () {
      this.userList = this.users
    },
    watch: {
      users: function () {
        this.userList = this.users
      }
    }
  }
</script>


<style lang="scss">

  .my-autocomplete{
    li {
      line-height: normal;
      padding: 7px;
      // border-bottom: 1px solid rgba(34,36,38,.1);
      .userList {
        display: block;
        text-decoration: none;
        cursor: pointer;
        overflow: hidden;
        margin: auto;
        .user {
          position: relative;
          bottom: 14px;
          padding: 1em;
          color: black;
          font-size: 18px;
        }
        .avatar {
          border-radius: 50%;
          width: 40px;
        }
      }
    }
  }


</style>
