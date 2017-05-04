<template lang="pug">

  .hello
    el-row
      .slides.shadow
        h3 Popular Users
        el-carousel(trigger='click', height='400px')
          el-carousel-item(v-for='o in popular', :key='o', :data='o')
            .user
              img.avatar.shadow(:src='o.userIcon')
              h4.name {{ o.userName }}
              router-link.link.shadow(:to="'/user/' + o.userId")
                i.fa.fa-edit
                |  Ask me
    el-row
      el-col(:lg="16", :sm='24')
        .people
          h3 All Users
          el-carousel(:interval='4000', type='card', height='200px')
            el-carousel-item(v-for='o in users', :key='o', :data='o')
              .users
                router-link.user(:to="'/user/' + o.userId")
                  img.avatar.shadow(:src='o.userIcon')
                  h4.name {{o.userName}}
        .hot
          h3 Hot issue
          p(v-for="o in Lorem") {{o}}

      el-col(:lg="8", :sm='24')
        .activity
          h3 Recent Activity
          router-link.say.shadow(:to="'/wisdom/' + o.id + '#post_id'", v-for='o in topics', v-bind:data="o", v-bind:key="o.title")
            h4 {{o.title}}
            p
              i.fa.fa-retweet
              |  {{o.userName}}

</template>

<script>
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
        popular: [],
        Lorem: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris euismod convallis leo, a volutpat enim pulvinar nec. Sed vel urna ante. Nulla consequat justo felis, a elementum dolor maximus sed. Ut vitae eros vitae neque venenatis condimentum. Nunc libero magna, fermentum in tellus non, tincidunt tempus lectus. Integer in massa feugiat, suscipit justo venenatis, scelerisque erat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed id metus magna. Duis quis ipsum fringilla turpis sodales consequat ut eget sem. Vestibulum ut ex eget ante varius laoreet. Fusce at luctus leo. Mauris ut nisi egestas diam eleifend facilisis eget vitae nunc. Integer consectetur tellus neque, nec condimentum enim consequat at. Maecenas neque metus, blandit eget dolor quis, pretium feugiat tellus.', 'Aenean eget viverra risus, nec tincidunt justo. Donec a nisl ac purus consequat tincidunt malesuada eget lacus. Nulla fringilla neque id nulla congue, id eleifend felis aliquam. Aliquam viverra auctor eros. Etiam congue libero vitae lacinia hendrerit. Nulla quis diam at tortor pulvinar maximus. Ut pharetra elit eu arcu pulvinar, nec suscipit eros euismod. Proin fringilla lectus ipsum, in accumsan ipsum aliquet fermentum. Proin nisi justo, feugiat sit amet nunc rutrum, vehicula ultrices est. Nullam pharetra malesuada orci, quis tincidunt arcu pulvinar nec.', 'Maecenas euismod consectetur metus. Phasellus consequat dictum pellentesque. Nulla sed ultrices magna. Fusce iaculis laoreet porta. Cras arcu diam, pulvinar ac molestie vitae, mollis in metus. Curabitur ac est blandit, sagittis nibh eu, vehicula enim. Quisque id neque eget risus efficitur ornare in sed urna. Donec id sollicitudin eros. Nunc nec nisi nisi. Duis semper, dolor in auctor iaculis, est mauris molestie odio, at pharetra leo turpis sit amet enim. Proin consectetur magna eu dui eleifend iaculis. Nunc et facilisis tellus. Nulla sagittis, velit vehicula dictum auctor, arcu nunc ullamcorper erat, quis maximus lacus mi hendrerit turpis. Morbi nunc quam, ultrices ut egestas quis, viverra vitae augue. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.']
      }
    },
    methods: {
      getTop3: function (e) {
        this.popular = e.slice(0, 3)
      }
    },
    mounted () {
      this.getTop3(this.users)
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
      background: $card;
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
    // padding: 3em 0;
    .user {
      display: inline-block;
      margin: 0 auto;
      &:hover {
        transform: scale(1.05, 1.05)
      }
      .avatar {
        margin: 1em 0 0.5em 0;
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
