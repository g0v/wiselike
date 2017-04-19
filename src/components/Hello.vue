<template lang="pug">
  .hello
    el-row
      el-col.userList(v-for='(o, index) in users', v-bind:data="o", v-bind:key="o.userId", :span='6')
        .card
          router-link.user(:to="'/user/'+o.userId")
            el-card.box-card(:body-style="{ padding: '0px' }")
              .clearfix(slot='header')
                img.icon(:src='o.userIcon')
              .detail
                .userId {{o.userId}}

</template>

<script>
  import profile from './Profile.vue'
  import wisdom from './Wisdom.vue'
  export default {
    name: 'hello',
    props: ['users'],
    components: {
      wisdom,
      profile
    },
    data () {
      return {
        currentDate: new Date()
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
.hello{
  max-width: $maxWidth;
  margin: 0 auto;
}
.userList{
  .card {
    margin: 2em;
    .user {
      text-decoration: none;
      color: black;
    }
  }
  .time {
    font-size: 13px;
    color: #999;
  }
  .box-card{
    width: 200px;
    margin: 1em auto;
  }
  .detail{
    text-align: center;
    padding: 14px;
  }

  .icon {
    border-radius: 50%;
    margin: auto;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
      display: table;
      content: "";
  }

  .clearfix:after {
      clear: both
  }
}
</style>
