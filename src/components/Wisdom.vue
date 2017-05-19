<template lang="pug">

  el-card.box-card
    .clearfix(slot='header')
      h2
        i.fa.fa-long-arrow-right
        |  {{content.title}}

    .text.item(v-for='(post, index) of content.posts', :class="{sereply: index >= 2}")
      p
        img.avatar(:src='post.icon')
        span.el-dialog__title
          | {{post.author}}
          span(v-if="index === 0")
            |  提問
          span(v-else)
            |  回應
            sup  {{post.time}}
      p.sereply(v-html='post.content')

    wisdomreply(:userId='userId', :topicid='content.topicId', :type='content.category')

</template>

<script>
  // import axios from 'axios'
  import wisdomprivate from './Wisdom_Private.vue'
  import wisdomreply from './Wisdom_Reply.vue'
  export default {
    name: 'wisdom',
    props: ['content', 'userId'],
    components: {
      wisdomprivate,
      wisdomreply
    },
    data () {
      return {
        wisdomPublic: {
          title: [],
          icon: [],
          content: [],
          author: [],
          time: [],
          topicid: []
        },
        page: 0,
        lazyload_count: 0,
        Pubilc_Category: [],
        loading: false,
        loadmore: false,
        autoload: true,
        ProfileCategoryId: ''
      }
    },
    created: function () {
      // console.log(this.content)
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
@import 'node_modules/font-awesome/scss/font-awesome';
  .text {
    font-size: 1em;
  }
  .item {
    padding: 18px 0;
  }
  .el-card__body {
      background-color: linen;
      padding: 20px;
  }
  .box-card {
    line-height: 2em;
    width: 100%;
    margin-bottom: 2em;
    img.avatar {
      width: 5%;
      vertical-align: middle;
      margin-right: 1em;
      border-radius: 50%;
    }
    .el-dialog__title{
      margin-right: 1em;
    }
    .sereply{
      margin-left:3em;
    }
    .el-textarea {
      display: inline-block;
      width: 88%;
      vertical-align: bottom;
    }
  }
  .loader {
    font-size: large;
    height: 3em;
    width: 100%;
  }

</style>
