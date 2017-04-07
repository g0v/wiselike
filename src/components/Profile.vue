<template lang="pug">
  .profile
    h2 {{$route.params.userId}}
    p: img.avatar(v-if="users != null", :src="userInfo")
    p: el-button(type="primary", size="large") 我要發問
</template>

<script>
  export default {
    name: 'profile',
    props: ['sUser', 'users'],
    data () {
      return {
        icon: ''
      }
    },
    computed: {
      userInfo: function () {
        var userid = this.$route.params.userId
        var t = this.users.filter((o) => {
          return o.userId === userid
        })[0]['userIcon']
        if (t === undefined) {
          return null
        } else {
          return t
        }
      }
    }
  }
  
</script>

<style lang="scss" scoped>
  .profile {
    text-align: center;
    padding: 3em 0;
    margin: 0 0 1em 0;
    background: url("https://images.unsplash.com/photo-1440397699230-0a8b8943a7bd?dpr=1&auto=compress,format&fit=crop&w=767&h=512&q=80&cs=tinysrgb&crop=&bg=");
    background-size: cover;

    .avatar {
      border-radius: 50%;
      width: 250px;
      height: 250px;
    }
  }
</style>
