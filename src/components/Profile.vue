<template lang="pug">
  .profile(v-if="user")
    .info(:style="{ backgroundImage: `url(${user.userBg})` }")
      img.avatar(:src="user.userIcon")
      h1 {{ user.userId }}
      p(v-html='introduce')
      ask(:userId = "user.userId")
    wisdom(:userId = "user.userId")
  .profile(v-else)
    h1 no such user
</template>

<script>
  import wisdom from './Wisdom.vue'
  import ask from './Ask.vue'
  import axios from 'axios'
  export default {
    name: 'profile',
    props: ['users'],
    components: {
      wisdom,
      ask
    },
    data () {
      return {
        introduce: ''
      }
    },
    updated: function () {
      console.log(this.user.userfirsttopicid)
      if (this.user.userfirsttopicid !== undefined) {
        axios.get('https://talk.pdis.nat.gov.tw/t/' + this.user.userfirsttopicid + '.json?include_raw=1').then((val) => {
          this.introduce = val.data.post_stream.posts[0].cooked
          console.log(val.data.post_stream.posts[0].cooked)
        })
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
@import '../global.scss';
.profile {
  .info {
    position: relative;
    color: white;
    text-align: center;
    padding: 5em 0 3em;
    background-size: cover;
    * {
      position: relative;
      z-index: 100;
    }
    .avatar {
      border-radius: 50%;
      width: 200px;
      height: 200px;
      box-shadow: 0 3px 6px -1px black;
    }
    p, h1 {
      padding: 0 calc((100% - #{$maxWidth}) / 2);
    }
    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 10;
      background: rgba(black, 0.5);
    }
  }

}
</style>
