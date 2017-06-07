<template lang="pug">

  .hello
    el-row
      .slides
          h3 Popular Users
          el-carousel(trigger='click', type='card', height='400px', arrow='always')
            el-carousel-item(v-for='(o, idx) in topStar', :key='o', :data='o', v-if='topStar !== undefined')
              router-link.user.dim(:to="'/user/' + o.name")
                el-badge(:value='o.topic_count')
                  img.avatar.shadow(:src='o.avatar')
                p.name {{ o.nickname }}
                .link
                  | ask me
    
    el-row
      el-col(:lg="16", :sm='24')
        .hot
          h3 Category
          el-button.category(:type="(idx === activeCate)?'warning':'basic'", v-for='(tag, idx) in tags', :key='tag', :data='tag', @click='showCategory(tag); activeCate = idx')
            h6 {{tag}}
          .users
            router-link.user(:to="'/user/' + user.name", v-for='user in selectedUsers', :key='user', :data='user')
              img.avatar.shadow(:src='user.avatar')
              p.name {{user.nickname}}
      el-col(:lg="8", :sm='24')
        .activity
          h3 Recent Activity
          router-link.say.shadow(v-for='o in activityTop10', :to="'/user/' + o.profile + '#' + o.id", :data="o", :key="o.title")
            h4
              i.fa.fa-retweet
              |  {{o.title}} &nbsp;
              span.meta
                | {{o.userName}}

    //- el-row
    //-   el-col(:lg="16", :sm='24')
    //-     .hot
    //-       h3 Category
    //-       el-button.category(:type="(idx === activeCate)?'warning':'basic'", v-for='(tag, idx) in tags', :key='tag', :data='tag', @click='showCategory(tag); activeCate = idx')
    //-         h6 {{tag}}
    //-       .users
    //-         router-link.user(:to="'/user/' + user.userId", v-for='user in selectedUsers', :key='user', :data='user')
    //-           img.avatar.shadow(:src='user.userIcon')
    //-           p.name {{user.userName}}
    //-   el-col(:lg="8", :sm='24')
    //-     .activity
    //-       h3 Recent Activity
    //-       router-link.say.shadow(v-for='o in activityTop10', :to="'/user/' + o.profile + '#' + o.id", :data="o", :key="o.title")
    //-         h4
    //-           i.fa.fa-retweet
    //-           |  {{o.title}} &nbsp;
    //-           span.meta
    //-             | {{o.userName}}

</template>

<script>
  import axios from 'axios'
  // import config from '../../config'
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
        activeCate: 0,
        activityTop10: [],
        topStar: [],
        sortUser: []
      }
    },
    computed: {
      sortedUsers: function () {
        /* sort base on wisdom numbers */
        this.users.sort((a, b) => {
          b.topic_count - a.topic_count
        })
      }
    },
    methods: {
      top: function () {
        axios.get('https://talk.pdis.nat.gov.tw/categories.json?parent_category_id=21')
        .then((subCategory) => { // get user list
          // console.log(subCategory.data.category_list.categories)
          let Category = subCategory.data.category_list.categories
          let allProfile = []
          Category.forEach((Profile) => {
            if (Profile['name'].indexOf('profile-') > -1) allProfile.push(Profile)
          })
          /* sort by topic count */
          this.sortUser = allProfile.sort((a, b) => { return a.topic_count - b.topic_count }).reverse()
          this.matchUser()
          // console.log(this.topStar)
          // for (let i = 0; i < 3; i++) {
          //   let user = {
          //     id: '',
          //     name: '',
          //     nickname: '',
          //     avatar: '',
          //     background: ''
          //   }
          //   let name = top[i].name.replace(/profile-/, '')
          //   axios.get('https://talk.pdis.nat.gov.tw/users/' + name + '.json').then((userdata) => {
          //     let profile = userdata.data.user
          //     user.nickname = profile.name
          //     user.name = profile.username
          //     user.avatar = 'https://talk.pdis.nat.gov.tw' + profile.avatar_template.replace(/{size}/, '1000')
          //     if (profile.profile_background === undefined) {
          //       user.background = 'https://images.unsplash.com/photo-1484199408980-5918a796a53f?dpr=1&auto=compress,format&fit=crop&w=1199&h=776&q=80&cs=tinysrgb&crop=&bg='
          //     } else {
          //       user.background = 'https://talk.pdis.nat.gov.tw' + profile.profile_background
          //     }
          //     this.topStar.push(user)
          //   })
          // }
        })
      },
      matchUser: function () {
        // this.sortUser
        this.users.filter((user) => {
          // console.log(user)
          for (let i = 0; i < 3; i++) {
            let name = this.sortUser[i].name.replace(/profile-/, '')
            // console.log(user.name.indexOf(name))
            if (user.name.indexOf(name) > -1) this.topStar.push(user)
          }
        })
      },
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
        this.matchUser()
      },
      topics: function () {
        this.activityTop10 = this.slice(this.topics, 10)
      }
    },
    created: function () {
      this.activityTop10 = this.slice(this.topics, 10)
      this.top()
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
      // font-weight: 700
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
        font-family: $logofont;
        color: white;
        // border-radius: .8em;
        line-height: 2em;
        padding: 0 3ch;
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

  // .el-carousel__item:nth-child(2n) {
  //   background-color: #99a9bf;
  // }

  // .el-carousel__item:nth-child(2n+1) {
  //   background-color: #d3dce6;
  // }

  .category {
    border-radius: 0;
    h6 {
      margin: 0
    }
  }
  @media all and (max-width: $breakpoint) {
    .people, .hot, .activity{
      margin: 0 3ch;
    }
    .slides{
      margin: 5ch 3ch 0 3ch;
    }
  }
}

</style>
