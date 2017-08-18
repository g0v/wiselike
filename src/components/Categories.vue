<template lang="pug">
  .hot
    h3 Category
    .buttonset
      el-button.category(:type="(idx === activeCate)?'warning':'basic'", v-for='(tag, idx) in tags', :key='tag', :data='tag', @click='showCategory(tag); activeCate = idx')
        p.tag {{tag}}

    .users
      router-link.user(v-for='user in selectedUsers', :key='user.id', :to='"/user/" + user.name')
        img.avatar.shadow(:src='user.avatar')
        p.name {{user.nickname}}

      //- swiper(:options='swiperOption2')
      //-   swiper-slide.users(v-for='user in selectedUsers', :key='user', :data='user')
      //-       router-link.user(:to="'/user/' + user.name")
      //-         img.avatar.shadow(:src='user.avatar')
      //-         p.name {{user.nickname}}
      //-   .swiper-button-prev.swiper-button-black(slot='button-prev')
      //-   .swiper-button-next.swiper-button-black(slot='button-next')
</template>

<script>
  import axios from 'axios'
  require('swiper/dist/css/swiper.css')
  import Vue from 'vue'
  import VueAwesomeSwiper from 'vue-awesome-swiper'
  Vue.use(VueAwesomeSwiper)

  export default {
    name: 'Slider',
    props: ['users'],
    components: {
    },
    data () {
      return {
        tags: [],
        activeCate: 0,
        selectedUsers: this.users,
        swiperOption2: {
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          slidesPerView: 3,
          slidesPerColumn: 2,
          autoplay: 3000,
          grabCursor: true,
          paginationClickable: true,
          spaceBetween: 30
        }
      }
    },
    methods: {
      showCategory: function (tag) {
        if (tag !== '全部') {
          /* get user from tag */
          axios.get('https://talk.pdis.nat.gov.tw/tags/wiselike-' + tag + '.json')
          .then((resp) => {
            let tagUsers = resp.data.users
            let tagIds = tagUsers.map(tagUser => tagUser.id)
            this.selectedUsers = this.users.filter(user => tagIds.indexOf(user.id) >= 0)
          })
        } else {
          /* back to default 'all' */
          this.selectedUsers = this.users
        }
      }
    },
    watch: {
    },
    mounted: function () {
      axios.get('https://talk.pdis.nat.gov.tw/c/wiselike.json')
      .then((response) => {
        let tags = response.data.topic_list.tags
        let all = '全部'
        for (var i in tags) {
          if (tags[i].indexOf('wiselike') > -1) {
            this.tags.push(tags[i].replace(/wiselike-/, ''))
          }
        }
        this.tags.unshift(all)
      })
    }
  }

</script>

<style lang="scss" scoped>
@import '../global.scss';

  h3 {
    font-family: 'Kadwa', serif;
  }
  .category {
    border-radius: 0;
    margin: 5px 5px 0 0;
    padding: 0.5em;
    font-size:1.5rem;
  }
  .tag {
    font-size: 1rem;
    margin: 0;
  }

  .users {
    display: flex;
    flex-flow: row wrap;
    max-height: 50rem;
    overflow-y: auto;
    overflow-x: hidden;
    .user {
      flex: 0 0 25%;
      padding: 1em;
      box-sizing: border-box;
      &:hover {
        transform: scale(1.05, 1.05);
      }
      .avatar {
        margin: 1em auto 0.5em auto;
        width: 7em;
        height: 7em;
        border-radius: 50%;
        display: block;
      }
      .name {
        color: black;
        text-align: center;
        margin:0.8rem 0 0.5rem 0;
      }
    }
  }
</style>
