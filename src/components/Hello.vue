<template lang="pug">

  .hello
    el-row
      el-alert.tos(title="Terms of Service", type="info", description="我們深信網路言論自由就是一切，本網站不會進行任何形式的內容審查；除非應法院或其他政府機關依法提出的要求，本網站也不會主動移除他人在上面發表的內容。", close-text="我瞭解了", show-icon)

    //- Popular People
    el-row
      Slider(:users='users')

    el-row
      //- Category
      el-col(:lg="16", :sm='24')
        Categories(:users='users')

      //- Recent Activity
      el-col(:lg="8", :sm='24')
        .activity
          h3 最新回應
          router-link.say.shadow(v-for='o in activityTop10', :to="'/user/' + o.profile + '-' + o.id", :data="o", :key="o.title")
            h4
              i.fa.fa-retweet
              |  {{o.title}} &nbsp;
              span.meta
                | {{o.userName}}

</template>

<script>
  import axios from 'axios'
  import profile from './Profile.vue'
  import wisdom from './Wisdom.vue'
  import Slider from './Slider.vue'
  import Categories from './Categories.vue'
  export default {
    name: 'hello',
    props: ['users', 'topics'],
    components: {
      wisdom,
      profile,
      Slider,
      Categories
    },
    data () {
      return {
        activityTop10: []
      }
    },
    methods: {
      getActivity: function () {
        /* get recent activity */
        axios.get('https://talk.pdis.nat.gov.tw/c/wiselike.json')
        .then((response) => {
          /* get a list of topics under one category */
          let topics = response.data.topic_list.topics
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
    watch: {
      topics: function () {
        this.activityTop10 = this.topics.slice(0, 10)
      }
    },
    created: function () {
      this.activityTop10 = this.topics.slice(0, 10)
      this.getActivity()
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
@import 'node_modules/font-awesome/scss/font-awesome';
.hello{
  .tos {
    background-color: teal;
    border-radius: 0;
  }
  .el-row {
    max-width: $maxWidth;
    margin: 0 auto;
  }
  .background {
    background-color: #333;
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

  @media all and (max-width: $breakpoint) {
    h3{
      font-size:1.2rem;
      // text-align: center;
    }
    .people, .hot, .activity{
      margin: 0 3ch;
    }
    .user .avatar{
      width: 4rem;
      height: 4rem;
    }
    .user {
      padding: 0;
    }
    .user .name {
      font-size: 1rem;
    }
    .category {
      font-size: 1.2rem;
      line-height: 2;
      padding: 0.2em;
    }
  }
}


</style>
