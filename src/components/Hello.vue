<template lang="pug">

  .hello
    el-row
      .slides
        h3 Popular Users
        el-carousel(trigger='click', type='card', height='400px')
          el-carousel-item(v-for='(o, idx) in slice(sortedUsers, 3)', :key='o', :data='o')
            .user
              el-badge(:value='o.topic_count')
                img.avatar.shadow(:src='o.userIcon')
              h4.name {{ o.userName }}
              router-link.link.shadow(:to="'/user/' + o.userId")
                i.fa.fa-edit
                |  Ask me
    el-row
      el-col(:lg="16", :sm='24')
        .people
          h3 All Users
          .users
            router-link.user(:to="'/user/' + o.userId", v-for='o in users', :key='o', :data='o')
              img.avatar.shadow(:src='o.userIcon')
              p.name {{o.userName}}
        .hot
          h3 Category
          el-tabs
            el-tab-pane(v-for='t in tags', :label= 't', :key="t", :data='t')
              .users
                router-link.user(:to="'/user/' + o.userId", v-for='o in users', v-if='o.userCategory == t', :key='o', :data='o')
                  img.avatar.shadow(:src='o.userIcon')
                  p.name {{o.userName}}


      el-col(:lg="8", :sm='24')
        .activity
          h3 Recent Activity
          router-link.say.shadow(v-for='o in slice(topics, 10)', :to="'/user/' + o.profile + '#' + o.id", :data="o", :key="o.title")
            h4
              //- i.el-icon-caret-right
              i.fa.fa-retweet
              |  {{o.title}}
              span.meta
                | {{o.userName}}

</template>

<script>
  import profile from './Profile.vue'
  import wisdom from './Wisdom.vue'
  export default {
    name: 'hello',
    props: ['users', 'topics', 'tags'],
    components: {
      wisdom,
      profile
    },
    data () {
      return {
        currentDate: new Date()
      }
    },
    computed: {
      sortedUsers: function () {
        /* sort base on wisdom numbers */
        return this.users.sort((a, b) => b.topic_count - a.topic_count)
      }
    },
    methods: {
      // sortby (array, type) {
      //   if (type === 'user') {
      //     console.log(array)
      //     return array.sort((a, b) => b.topic_count - a.topic_count)
      //   } else {
      //     return array
      //   }
      // },
      slice (array, number) {
        return array.slice(0, number)
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
@import 'node_modules/font-awesome/scss/font-awesome';
.hello{
  padding: 3rem 0 0 0;
  .el-row {
    max-width: $maxWidth;
    margin: 0 auto;
  }
  .user {
    .avatar {
      width: 7em;
      height: 7em;
      border-radius: 50%;
      margin: 0 auto;
      display: block;
    }
    .name {
      text-align: center;
      margin: 1em 0 0.5em 0;
    }
  }
  .slides {
    margin: 3em 0;
    .user {
      height: 100%;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      // background: $card;
      font-size: 150%;
      .link {
        background: $highlight;
        color: white;
        border-radius: 1em;
        line-height: 2em;
        padding: 0 5ch;
      }
    }
  }
  .users { // Popular People
    display: flex;
    flex-flow: row wrap;
    padding: 3em 0;
    .user {
      flex: 0 25%;
      display: inline-block;
      // margin: 0 auto;
      &:hover {
        transform: scale(1.05, 1.05)
      }
      .avatar {
        margin: 1em auto 0.5em auto;
      }
      .name {
        margin: 0;
        color: black;
      }
    }
  }
  .activity {
    margin: 0 0 0 3ch;
    .say {
      display: block;
      margin: 1em 0;
      padding: 1px 1em;
      background: $card;
      // box-shadow: 0 5px 5px -2px lightgray;
      &:hover {
        transform: translate(1px, 1px)
      }
    }
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
  @media all and (max-width: $breakpoint) {
    // .el-col {
    //   width: 100%;
    // }
    .people, .hot, .activity {
      margin: 0 3ch;
    }
  }
}
</style>
