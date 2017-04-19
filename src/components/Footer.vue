<template lang="pug">
  .footer
    a(href="https://www.facebook.com/vtaiwan.tw/" title="Fackbook" target="_blank")
      i.fa.fa-facebook
    a(href="https://www.youtube.com/channel/UChC85hbUuDAvFpc7Uuj69DA/" title="Youtube" target="_blank")
      i.fa.fa-youtube
    router-link(to='/', exact='', title="Home")
      img(src='../assets/logo.png', alt='logo')
    a(href="https://github.com/g0v/vue.vtaiwan.tw" title="Github" target="_blank")
      i.fa.fa-github
</template>

<script>
  export default {
    name: 'footer',
    components: {
    },
    data () {
      return {
      }
    },
    methods: {
    },
    mounted: function () {
    }
  }
</script>

<style lang="scss" scoped>
@import '../global.scss';
.footer {
  flex: 0 0 10rem;
  background: $lightblack;
  text-align: center;
}
</style>
