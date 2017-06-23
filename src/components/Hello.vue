<template lang="pug">

  .hello
    el-row 
      .slides <!-- Popular People -->
        h3 Popular Users
        swiper(:options='swiperOption1')
          swiper-slide(v-for='(o, idx) in topStar', :key='o', :data='o', v-if='topStar !== undefined')
            router-link.user.background(:to="'/user/' + o.name")
              el-badge(:value='o.topic_count')
                img.avatar.shadow(:src='o.avatar')
              p.name {{ o.nickname }}
              .link
                | ask me
    
    el-row 
      el-col(:lg="16", :sm='24') <!-- Category -->
        .hot
          h3 Category
          .buttonset
            el-button.category(:type="(idx === activeCate)?'warning':'basic'", v-for='(tag, idx) in tags', :key='tag', :data='tag', @click='showCategory(tag); activeCate = idx')
              h6 {{tag}}
            swiper(:options='swiperOption2')
              swiper-slide.card(v-for='user in selectedUsers', :key='user', :data='user')
                .users
                  router-link.user(:to="'/user/' + user.name")
                    img.avatar.shadow(:src='user.avatar')
                    p.name {{user.nickname}}
              //- .swiper-pagination(slot='pagination')
              .swiper-button-prev(slot='button-prev')
              .swiper-button-next(slot='button-next')

      el-col(:lg="8", :sm='24') <!-- Recent Activity -->
        .activity
          h3 Recent Activity
          router-link.say.shadow(v-for='o in activityTop10', :to="'/user/' + o.profile + '#' + o.id", :data="o", :key="o.title")
            h4
              i.fa.fa-retweet
              |  {{o.title}} &nbsp;
              span.meta
                | {{o.userName}}

</template>

<script>
  import axios from 'axios'
  import Vue from 'vue'
  import VueAwesomeSwiper from 'vue-awesome-swiper'
  Vue.use(VueAwesomeSwiper)
  import profile from './Profile.vue'
  import wisdom from './Wisdom.vue'
  export default {
    name: 'hello',
    props: ['users', 'topics'],
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
        sortUser: [],
        tags: [],
        swiperOption1: {
          effect: 'coverflow',
          grabCursor: true,
          autoplay: 3000,
          centeredSlides: true,
          slidesPerView: 2,
          coverflow: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1
          }
        },
        swiperOption2: {
          // pagination: '.swiper-pagination',
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          slidesPerView: 3,
          slidesPerColumn: 2,
          grabCursor: true,
          paginationClickable: true,
          spaceBetween: 30
        }
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
      top3: function () {
        axios.get('https://talk.pdis.nat.gov.tw/categories.json?parent_category_id=21')
        .then((subCategory) => { // get user list
          let Category = subCategory.data.category_list.categories
          let allProfile = []
          Category.forEach((Profile) => {
            if (Profile['name'].indexOf('profile-') > -1) allProfile.push(Profile)
          })
          /* sort by topic count */
          this.sortUser = allProfile.sort((a, b) => { return a.topic_count - b.topic_count }).reverse()
          this.matchUser()
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
      showCategory: function (tag) {
        this.selectedUsers = []
        if (tag !== '全部') {
          /* get user from tag */
          axios.get('https://talk.pdis.nat.gov.tw/tags/wiselike-' + tag + '.json')
          .then((tagUsers) => {
            let tagUser = tagUsers.data.users
            this.users.forEach((singleUser) => {
              tagUser.forEach((taguser) => {
                if (singleUser.id === taguser.id) this.selectedUsers.push(singleUser)
              })
            })
          })
          return this.selectedUsers
        } else if (tag === '全部') this.selectedUsers = this.users
      },
      slice (array, number) {
        return array.slice(0, number)
      },
      getActivity: function () {
        /* get recent activity */
        axios.get('https://talk.pdis.nat.gov.tw/c/wiselike.json')
        .then((response) => {
          /* get a list of topics under one category */
          let topics = response.data.topic_list.topics
          let tags = response.data.topic_list.tags
          let all = '全部'
          for (var i in tags) {
            if (tags[i].indexOf('wiselike') > -1) {
              this.tags.push(tags[i].replace(/wiselike-/, ''))
            }
          }
          this.tags.unshift(all)
          let newTopicsFilter = []
          topics.map((topic) => {
            let newTopic = {}
            newTopic.title = topic.title
            newTopic.userName = topic.last_poster_username
            newTopic.id = topic.id
            newTopic.category = topic.category_id
            /* filter posts_count > 1 */
            if (topic.posts_count > 1 && newTopicsFilter.length < 10) {
              newTopicsFilter.push(newTopic)
            }
          })
          /* drop first topic which is actually meta */
          this.topicList = newTopicsFilter
          // console.log(newTopicsFilter)
          /* find the profile owner by category id from each topic */
          return Promise.all(newTopicsFilter.map((topic) => axios.get('https://talk.pdis.nat.gov.tw/c/wiselike/' + topic.category + '.json')))
        }).then((responses) => {
          for (let res of responses) {
            /* sort the topics and then get the oldest one(meta) */
            let first = res.data.topic_list.topics.sort((a, b) => a.id - b.id)[0]
            /* split profile-username -> username */
            let user = first.slug.split('-')[1]
            /* pop out one topic, modify, then push back */
            let oldTopic = this.topicList.splice(0, 1)
            oldTopic[0].profile = user
            this.activityTop10.push(oldTopic[0])
          }
          // console.log(this.activityTop10)
        }).catch(err => console.log('getActivity error: ' + err))
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
      this.top3()
      this.getActivity()
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
  .background {
    background-color: #333;
  }
  .user { // For Category users
    .avatar {
      width: 7em;
      height: 7em;
      border-radius: 50%;
      margin: 10px auto;
      display: block;
    }
    .name {
      text-align: center;
      margin:0.8rem 0 0.5rem 0;
      color: white;
    }
  }
  .slides { // Popular People
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
        line-height: 2em;
        padding: 0 3ch;
      }
    }
  }
  .users { // Category
    padding: 1em 0 2em 0;
    .user {
      &:hover {
        transform: scale(1.05, 1.05)
      }
      .avatar {
        margin: 1em auto 0.5em auto;
      }
      .name {
        color: black;
      }
    }
  }
  .activity { // Recent Activity
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
  .category {
    border-radius: 0;
    h6 {
      margin: 0
    }
  }
  
  @media all and (max-width: $breakpoint) {
    h3{
      font-size:1.5rem;
      text-align: center;
    }
    .people, .hot, .activity{
      margin: 0 3ch;
    }
    .slides{
      margin: 5ch 3ch 0 3ch;
        .user {
          font-size: 120%;
          .link{
            padding: 0 1ch;
          }
        }
    }
    .user .avatar{
      width: 4rem;
      height: 4rem;
    }
    .users .name {
      font-size: 1rem;
    }
    .category {
      font-size: 0.5rem;
      line-height: 2;
      padding: 5px 20px;
      margin: 3px;
    }
  }
}

</style>
