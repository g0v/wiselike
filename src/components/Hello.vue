<template lang="pug">

  .hello
    el-row
      el-col(:span="16")
        .people
          h3 Popular People
          .users
            router-link.user(:to="'/user/' + o.userId", v-for='(o, index) in users', v-bind:data="o", v-bind:key="o.userId")
              el-card.box-card
                .clearfix(slot='header')
                  img.icon(:src='o.userIcon')
                .detail
                  .userId {{o.userId}}
        .hot
          h3 Hot issue
          p(v-for="o in Lorem") {{o}}

      el-col(:span="8")
        .activity
          h3 Recent Activity
          router-link.say(:to="'/say/' + o.id + '#post_id'", v-for='o in topics', v-bind:data="o", v-bind:key="o.title")
            el-card
              .text.item
                h3 {{o.title}}
                p {{o.userName}}

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
        Lorem: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris euismod convallis leo, a volutpat enim pulvinar nec. Sed vel urna ante. Nulla consequat justo felis, a elementum dolor maximus sed. Ut vitae eros vitae neque venenatis condimentum. Nunc libero magna, fermentum in tellus non, tincidunt tempus lectus. Integer in massa feugiat, suscipit justo venenatis, scelerisque erat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed id metus magna. Duis quis ipsum fringilla turpis sodales consequat ut eget sem. Vestibulum ut ex eget ante varius laoreet. Fusce at luctus leo. Mauris ut nisi egestas diam eleifend facilisis eget vitae nunc. Integer consectetur tellus neque, nec condimentum enim consequat at. Maecenas neque metus, blandit eget dolor quis, pretium feugiat tellus.', 'Aenean eget viverra risus, nec tincidunt justo. Donec a nisl ac purus consequat tincidunt malesuada eget lacus. Nulla fringilla neque id nulla congue, id eleifend felis aliquam. Aliquam viverra auctor eros. Etiam congue libero vitae lacinia hendrerit. Nulla quis diam at tortor pulvinar maximus. Ut pharetra elit eu arcu pulvinar, nec suscipit eros euismod. Proin fringilla lectus ipsum, in accumsan ipsum aliquet fermentum. Proin nisi justo, feugiat sit amet nunc rutrum, vehicula ultrices est. Nullam pharetra malesuada orci, quis tincidunt arcu pulvinar nec.', 'Maecenas euismod consectetur metus. Phasellus consequat dictum pellentesque. Nulla sed ultrices magna. Fusce iaculis laoreet porta. Cras arcu diam, pulvinar ac molestie vitae, mollis in metus. Curabitur ac est blandit, sagittis nibh eu, vehicula enim. Quisque id neque eget risus efficitur ornare in sed urna. Donec id sollicitudin eros. Nunc nec nisi nisi. Duis semper, dolor in auctor iaculis, est mauris molestie odio, at pharetra leo turpis sit amet enim. Proin consectetur magna eu dui eleifend iaculis. Nunc et facilisis tellus. Nulla sagittis, velit vehicula dictum auctor, arcu nunc ullamcorper erat, quis maximus lacus mi hendrerit turpis. Morbi nunc quam, ultrices ut egestas quis, viverra vitae augue. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.']
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
.hello{
  h3 {
    text-align: center;
  }
  .users {
    margin: 1em auto;
    max-width: $maxWidth;
    display: flex;
    flex-flow: row wrap;
    .user {
      display: inline-block;
      // width: 25%;
      width: 180px;
      margin: 0 auto;
      .detail{
        text-align: center;
      }
      .icon {
        border-radius: 50%;
        margin: auto;
        display: block;
      }
    }
  }
  .hot {
    padding: 0 1ch;
  }
  .activity {
    max-width: 300px;
    margin: 0 auto;
    .say{
      display: block;
      // width: 500px;
      text-align: center;
      margin: 1em 0;
    }
  }
}
</style>
