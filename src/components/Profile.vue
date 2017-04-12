<template lang="pug">
  .profile
    .info
      h2 {{ userId }}
      p
        img.avatar(v-if="user", :src="user.userIcon")
        img.avatar(v-else, src="../assets/avatar.png")
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
      user: function () {
        let pos = this.users.map(e => e.userId).indexOf(this.userId)
        return this.users[pos]
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
