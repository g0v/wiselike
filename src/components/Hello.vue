<template lang="pug">
  .hello

    el-row

      el-col.userList(:span="16")
        h3 Popular People

        el-col.user(v-for='(o, index) in users', v-bind:data="o", v-bind:key="o.userId", :span='4')
          .card
            router-link.user(:to="'/user/' + o.userId")
              el-card.box-card(:body-style="{ padding: '0px' }")
                .clearfix(slot='header')
                  img.icon(:src='o.userIcon')
                .detail
                  .userId {{o.userId}}

        el-col
          h3 Hot issue
          p(v-for="o in Lorem") {{o}}

      el-col.activity(:span="8")
        h3 Recent Activity

        el-col(v-for='o in topics', v-bind:data="o", v-bind:key="o.title")
          router-link(:to="'#' + o.id")
            el-card.box-card
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
  max-width: 2000px;
  margin: 1em auto;
  h3 {
    text-align: center;
  }
  .activity {
    .box-card{
      width: 500px;
      text-align: center;
      margin: 1em auto;
    }
  }
}
.user{
  .card {
    margin: 1em;
    // .user {
    //   text-decoration: none;
    //   color: black;
    // }
  }
  .time {
    font-size: 13px;
    color: #999;
  }
  .box-card{
    width: 180px;
    margin: 1em auto;
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
</style>
