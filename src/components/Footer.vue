<template lang="pug">
  .footer
    router-link.logo(to='/', exact='', title="Home")
      img(src='../assets/logo.png', alt='logo')
    a.github(href="https://github.com/g0v/wiselike" title="Github" target="_blank")
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
$fa-font-path:"../../node_modules/font-awesome/fonts";
@import 'node_modules/font-awesome/scss/font-awesome';
.footer {
  flex: 0 0 10rem;
  background: $lightblack;
  text-align: center;
  .logo {
    img {
      max-width: 50px;
      height: auto;
    }
  }
  .github {
    color: gray;
    font-size: 50px;
  }
}
</style>
