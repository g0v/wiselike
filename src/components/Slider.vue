<template lang="pug">

.slides
  // Searchbar.bar(:users="users")
  h3 Popular Users
  swiper.swipe(:options='swiperOption1')
    swiper-slide(v-for='(star, idx) in stars', :key='idx', :data='star')
      .user.dim(:style="{ backgroundImage: `url(${star.background})`}")
        router-link.link.clickable(:to="'/user/' + star.name" tag="div")
          img.avatar.shadow(:src='star.avatar')
          p.name {{ star.nickname }}
          .ask-btn
            i.el-icon-check
            |  ask me
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
        stars: [],
        sortedProfiles: [],
        swiperOption1: {
          autoplay: 9000,
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          paginationClickable: true,
          // Disable preloading of all images
          preloadImages: false,
          // Enable lazy loading
          lazyLoading: true
        }
      }
    },
    methods: {
      sortProfiles: function () {
        axios.get('https://talk.pdis.nat.gov.tw/categories.json?parent_category_id=21')
        .then((subCategory) => { // get user list
          let Category = subCategory.data.category_list.categories
          let allProfile = []
          Category.forEach((Profile) => {
            if (Profile['name'].indexOf('profile-') > -1) allProfile.push(Profile)
          })

          /* sort by topic count of the month, DESC */
          this.sortedProfiles = allProfile.sort((a, b) => a.topics_month - b.topics_month).reverse()

          /* sort users by sortedProfile */
          let sortedProfilesName = this.sortedProfiles.map(profile => profile.name.replace(/profile-/, ''))
          this.stars = this.users
                          /* make sure the user exist in profiles, and sort */
                          .filter(user => sortedProfilesName.indexOf(user.name) >= 0)
                          .sort((a, b) => sortedProfilesName.indexOf(a.name) - sortedProfilesName.indexOf(b.name))
                          .slice(0, 3)
          this.stars.map(star => {
            axios.get('https://talk.pdis.nat.gov.tw/users/' + star.name + '.json')
              .then((response) => {
                let user = response.data.user
                if (user.profile_background) {
                  star.background = 'https://talk.pdis.nat.gov.tw' + user.profile_background
                } else {
                  star.background = 'https://images.unsplash.com/photo-1484199408980-5918a796a53f?dpr=1&auto=compress,format&fit=crop&w=1199&h=776&q=80&cs=tinysrgb&crop=&bg='
                }
              })
          })
        })
      },
      matchUsers: function () {
        // this.sortedProfiles
        this.users.filter((user) => {
          // console.log(user)
          for (let i = 0; i < 3; i++) {
            let name = this.sortedProfiles[i].name.replace(/profile-/, '')
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
                this.stars.push(user)
              })
            }
          }
        })
      }
    },
    created: function () {
      this.sortProfiles()
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
  .clickable {
    cursor:pointer;
  }
  .user {
    background-size: cover;
    background-position: center;
    height: 25rem;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    font-size: 150%;
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
    .ask-btn {
      background: $highlight;
      font-family: $logofont;
      color: white;
      line-height: 2em;
      padding: 0 3ch;
    }
  }
}
@media all and (max-width: $breakpoint) {
  .slides{
    margin: 2ch 0 0 3ch;
    .swipe {
      margin: 0 0 0 -3ch;
    }
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
