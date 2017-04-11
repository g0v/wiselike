<template lang="pug">
  .profile
    .info
      h2 {{ userId }}
      p: img.avatar(v-if="users", :src="getAvatar")
      p: el-button(type="primary", size="large") 我要發問

    wisdom(:userId = "userId")
</template>

<script>
  import wisdom from './Wisdom.vue'
  export default {
    name: 'profile',
    props: ['users', 'default'],
    components: {
      wisdom
    },
    data () {
      return {
        userId: this.$route.params.userId || this.default,
        icon: ''
      }
    },
    computed: {
      getAvatar: function () {
        // let user = this.users.filter((o) => {
        //   return o.userId === this.userId
        // })
        let pos = this.users.map(e => e.userId).indexOf(this.userId)
        let user = this.users[pos]
        // console.log(user)
        if (user === undefined) {
          return 'http://placehold.it/300x300'
        } else {
          return user.userIcon
        }
      }
    }
  }

</script>

<style lang="scss" scoped>
  .info {
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
