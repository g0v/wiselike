<template lang="pug">
  .profile(v-if="user")
    .info
      p: img.avatar(:src="user.userIcon")
      h1 {{ user.userId }}
      p {{ user.userDesc }}
      ask
    wisdom(:userId = "user.userId")
  .profile(v-else)
    .info
      h1 no such user
</template>

<script>
  import wisdom from './Wisdom.vue'
  import ask from './Ask.vue'
  export default {
    name: 'profile',
    props: ['users'],
    components: {
      wisdom,
      ask
    },
    data () {
      return {
      }
    },
    computed: {
      user: function () {
        let pos = this.users.map(e => e.userId).indexOf(this.$route.params.userId)
        if (pos < 0) {
          return false
        } else {
          return this.users[pos]
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
