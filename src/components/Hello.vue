<template lang="pug">
  .hello
    el-row
      el-col.userList(:span='4', v-for='(o, index) in users', v-bind:data="o", v-bind:key="o.userId")
        el-card.box-card(:body-style="{ padding: '0px' }")
          .clearfix(slot='header')
            img.icon(:src='o.userIcon')
          .detail
            .userId {{o.userId}}
            .bottom
              router-link(:to="'/profile/'+o.userId") My Profile

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
.hello{
  padding: 2em 2ch;
}
.userList{
  margin-top:60px;
  // margin-left: 20px;
  .time {
    font-size: 13px;
    color: #999;
  }
  .box-card{
    width: 200px;
  }
  .bottom{
    margin-top:13px;
    a{
      text-decoration: none;
      color:blue;
    }
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
.el-col-offset-2 {
  margin-left: 11%;
}
</style>
