<template lang="pug">

.slides
  // Searchbar.bar(:users="users")
  h3 Popular Users
  swiper(:options='swiperOption1')
    swiper-slide(v-for='(o, idx) in topStar', :key='o', :data='o', v-if='topStar !== undefined')
      router-link.user.background(:to="'/user/' + o.name", :style="{ backgroundImage: `url(${o.background})`}")
        el-badge(:value='o.topic_count')
          img.avatar.shadow(:src='o.avatar')
        p.name {{ o.nickname }}
        .link
          | ask me
    .swiper-button-prev.swiper-button-white(slot='button-prev')
    .swiper-button-next.swiper-button-white(slot='button-next')

</template>

<script>

  require('swiper/dist/css/swiper.css')
  import Vue from 'vue'
  import VueAwesomeSwiper from 'vue-awesome-swiper'
  Vue.use(VueAwesomeSwiper)
  import axios from 'axios'
  import Searchbar from './Searchbar.vue'

  export default {
    name: 'Slider',
    props: ['users'],
    components: {
      Searchbar
    },
    data () {
      return {
        topStar: [],
        sortUser: [],
        swiperOption1: {
          // effect: 'coverflow',
          // grabCursor: true,
          autoplay: 9000,
          // centeredSlides: true,
          // slidesPerView: 2,
          // coverflow: {
          //   rotate: 50,
          //   stretch: 0,
          //   depth: 100,
          //   modifier: 1
          // }
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          // pagination: '.swiper-pagination',
          paginationClickable: true,
          // Disable preloading of all images
          preloadImages: false,
          // Enable lazy loading
          lazyLoading: true
        }
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
            if (user.name.indexOf(name) > -1) {
              axios.get('https://talk.pdis.nat.gov.tw/users/' + name + '.json').then((userdata) => {
                let profile = userdata.data.user
                /* set avatar size 300px */
                if (profile.profile_background === undefined) {
                  user.background = 'https://images.unsplash.com/photo-1484199408980-5918a796a53f?dpr=1&auto=compress,format&fit=crop&w=1199&h=776&q=80&cs=tinysrgb&crop=&bg='
                } else {
                  user.background = 'https://talk.pdis.nat.gov.tw' + profile.profile_background
                }
                this.topStar.push(user)
                console.log(this.topStar)
              })
            }
          }
        })
      }
    },
    watch: {
      users: function () {
        this.matchUser()
      }
    },
    created: function () {
      this.top3()
    }
  }
</script>

<style lang="scss" scoped>

@import '../global.scss';

.slides { // Popular People
  margin: 3em 0;
  h3 {
    font-family: 'Kadwa', serif;
  }
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
}
@media all and (max-width: $breakpoint) {
  .slides{
    margin: 2ch 3ch 0 3ch;
      .user {
        font-size: 120%;
        .link{
          padding: 0 1ch;
        }
      }
    .swiper-button-next,.swiper-button-prev{
      background-size: 18px 44px;
    }
    .swiper-button-next{
      right: -3px;
    }
    .swiper-button-prev{
      left: -3px;
    }
  }
}

</style>
