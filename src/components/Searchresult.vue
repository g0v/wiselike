<template lang="pug">
  .result
    el-row.user_search(v-if='category === "Users"')
      h3(v-if='user_results !== null') {{count}} results of " {{search_string}} "
      h3(v-else) {{count}} results of " {{search_string}} ", try another keyword.
      .users
        router-link.user(:to="'/user/' + user.name", v-for='user in search_results', :key='user', :data='user')
          img.avatar.shadow(:src='user.avatar')
          p.name {{user.nickname}}
    el-row.issue_search(v-if='category === "Issues"')
        .activity
          h3(v-if='issues_results !== null') {{count}} results of " {{search_string}} "
          h3(v-else) {{count}} results of " {{search_string}} ", try another keyword.
          router-link.say.shadow(v-for='o in search_results', :to="'/user/' + o.userName + '-' + o.id", :data="o", :key="o.title")
            h4
              i.fa.fa-retweet
              |  {{o.title}}
              span.meta
                | {{o.userName}}

</template>

<script>
import axios from 'axios'

export default {
  name: 'result',
  props: ['users'],
  data () {
    return {
      search_results: [],
      search_string: '',
      search_category: '',
      issue: []
    }
  },
  computed: {
    user_results: function () {
      var str = this.$route.params.result
      var reg = new RegExp(str, 'i')
      this.search_string = str
      this.search_results = []
      var result = this.users.filter(function (o) {
        return (reg.test(o.name) || reg.test(o.nickname))
      })
      if (result.length === 0) {
        return null
      } else {
        this.search_results = result
        // return result
      }
    },
    count: function () {
      return this.search_results.length
    },
    issues_results: function () {
      var str = this.$route.params.result
      this.search_string = str
      axios.get('https://talk.pdis.nat.gov.tw/search.json?q=' + this.search_string + '%20category%3A21').then((response) => {
        this.issue = []
        this.search_results = []
        var topics = response.data.topics
        if (topics.length > 0) {
          topics.forEach((t) => {
            var tmp = {}
            tmp['title'] = t['title']
            tmp['id'] = t['id']
            tmp['date'] = t['created_at']
            tmp['category_id'] = t['category_id']
            axios.get('https://talk.pdis.nat.gov.tw/c/wiselike/' + t['category_id'] + '.json').then((response) => {
              var owner = response.data.topic_list.topics[0]
              var str = owner.slug
              tmp['userName'] = str.split('-')[1]
              this.issue.push(tmp)
            })
          })
          this.issue.sort((a, b) => b.date - a.date)
          this.search_results = this.issue
        } else {
          return null
        }
      })
    },
    category: function () {
      return this.$route.params.category
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../global.scss';
@import 'node_modules/font-awesome/scss/font-awesome';
.result{
  padding: 3rem 0 0 0;
  .el-row{
    max-width: $maxWidth;
    margin: 0 auto;
  }
  h3 {
    text-align: center;
    margin-top: 50px;
  }
  .users { 
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
          width: 7em;
          height: 7em;
          border-radius: 50%;
          margin: 0 auto;
          display: block;
        }
        .name {
          text-align: center;
          margin: 1em 0 0.5em 0;
          color: black;
          font-weight: 700
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
}

</style>
