<template lang="pug">
  .header

    el-row.row-bg(type='flex', justify='space-between')
      el-col.left(:span='6')
        router-link.logo(to='/', exact='') Wiselike
          //- span Wiselike
        Search(:users="users")
      el-col(:span='6')
        .btn-group
          el-button.create Create My Profile
          span(v-if="username === ''")
            el-button.login(@click.native="login") Login
          span(v-else)
            el-button {{username}}

</template>

<script>
  import Search from './Search.vue'

  export default {
    name: 'header',
    props: ['users'],
    components: {
      Search
    },
    data () {
      return {
        myKey: '',
        username: ''
      }
    },
    methods: {
      login: function (event) {
        window.open('http://139.162.109.88:9000/login') // FIXME
      }
    },
    mounted: function () {
      window.addEventListener('message', (event) => {
        if (event.origin !== 'http://139.162.109.88:9000') { // FIXME
          console.log('Incorrect origin')
          return
        }
        this.username = event.data.username
      }, false)
    }
  }
</script>

<style lang="scss" scoped>
  .header {
    position: absolute;
    padding: 1.5em 6ch;
    box-sizing: border-box;
    width: 100%;
    .left {
      display: flex;
      h1 {
        color: white;
      }
    }
  }
  .btn-group{
    text-align: right;
    margin-top: 5px;
    .el-button.create{
      margin-right: 6px;
    }
  }
  .logo{
    text-decoration: none;
    color: white;
    font-size: 2rem;
  }
  .logo:hover{
    color:#20a0ff;
  }
</style>
