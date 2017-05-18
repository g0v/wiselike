<template lang="pug">

  .hello
    el-row
      .slides
        h3 Popular Users
        el-carousel(trigger='click', type='card', height='400px', arrow='always')
          el-carousel-item(v-for='(o, idx) in slice(sortedUsers, 3)', :key='o', :data='o')
            router-link.user.dim(:to="'/user/' + o.userId", :style="{ backgroundImage: `url(${o.userBg})`}")
              el-badge(:value='o.topic_count')
                img.avatar.shadow(:src='o.userIcon')
              h4.name {{ o.userName }}
              .meta.link
                i.fa.fa-arrow-circle-right
                |  into wisdom
              //- .info(v-bind:style="{ backgroundImage: `url(${o.userBg})`}")

    el-row
      el-col(:lg="16", :sm='24')
        .hot
          h3 Category
          //- el-button(:type="(idx === activeCate)?'primary':'basic'", v-for='(tag, idx) in tags', :key='tag', :data='tag', @click='show(tag); activeCate = idx') {{tag}}
          el-button.category(:type="(idx === activeCate)?'warning':'basic'", v-for='(tag, idx) in tags', :key='tag', :data='tag', @click='showCategory(tag); activeCate = idx')
            h6 {{tag}}
          .users
            router-link.user(:to="'/user/' + user.userId", v-for='user in selectedUsers', :key='user', :data='user')
              img.avatar.shadow(:src='user.userIcon')
              p.name {{user.userName}}
      el-col(:lg="8", :sm='24')
        .activity
          h3 Recent Activity
          router-link.say.shadow(v-for='o in slice(topics, 10)', :to="'/user/' + o.profile + '#' + o.id", :data="o", :key="o.title")
            h4
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
        currentDate: new Date(),
        selectedUsers: [],
        activeCate: 0
      }
    },
    computed: {
      sortedUsers: function () {
        /* sort base on wisdom numbers */
        return this.users.sort((a, b) => b.topic_count - a.topic_count)
      }
    },
    methods: {
      showCategory: function (t) {
        this.selectedUsers = []
        if (t !== '全部') {
          for (var i in this.users) {
            var category = this.users[i].userCategory
            for (var j in category) {
              if (category[j] === t) {
                var tmp = {}
                tmp['userId'] = this.users[i]['userId']
                tmp['userName'] = this.users[i]['userName']
                tmp['userIcon'] = this.users[i]['userIcon']
                this.selectedUsers.push(tmp)
              }
            }
          }
          return this.selectedUsers
        }
        if (t === '全部') {
          this.selectedUsers = this.users
        }
      },
      slice (array, number) {
        return array.slice(0, number)
      }
    },
    mounted () {
      this.selectedUsers = this.users
    },
    watch: {
      users: function () {
        // console.log(this.users)
        this.selectedUsers = this.users
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
@import 'node_modules/font-awesome/scss/font-awesome';
.hello{
  padding: 3rem 0 0 0;
  h3 {
    font-family: 'Kadwa', serif;
  }
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
      color: white;
      font-weight: 700
    }
  }
  .slides {
    margin: 3em 0;
    .user {
      background-size: cover;
      background-position: center;
      height: 100%;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      font-size: 150%;
      .link {
        background: $highlight;
        color: white;
        border-radius: .8em;
        line-height: 2em;
        padding: 0 5ch;
      }
      // * {
      //   position: relative;
      //   z-index: 100;
      // }
      // &::after {
      //   content: "";
      //   position: absolute;
      //   left: 0;
      //   right: 0;
      //   top: 0;
      //   bottom: 0;
      //   z-index: 10;
      //   background: rgba(gray, 0.5);
      // }
    }
  }
  .users { // Popular People
    display: flex;
    flex-flow: row wrap;
    padding: 3em 0;
    .user {
      flex: 0 25%;
      display: inline-block;
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
      &:hover {
        transform: translate(1px, 1px)
      }
      h4 {
        line-height: 1.5em;
      }
    }
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }

  .category {
    border-radius: 1em;
    h6 {
      margin: 0
    }
  }
  @media all and (max-width: $breakpoint) {
    .people, .hot, .activity {
      margin: 0 3ch;
    }
  }
}
</style>
