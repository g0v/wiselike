<template lang="pug">
  .howtouse
    div(v-html='howtousetext')
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'howtouse',
    components: {
    },
    data () {
      return {
        howtousetext: ''
      }
    },
    methods: {
      HowToUse: function () {
        axios.get('https://talk.pdis.nat.gov.tw/t/731.json?include_raw=1')
        .then((topic) => {
          this.howtousetext = topic.data.post_stream.posts[0].cooked
        })
      }
    },
    created: function () {
      this.HowToUse()
    }
  }
</script>

<style lang="scss" scoped>
// @import url('https://fonts.googleapis.com/css?family=Kadwa');
// @import '../global.scss';
.howtouse {
  padding: 5rem 0 1rem 0;
  max-width: 1120px;
  margin: 0 auto;
}
</style>
