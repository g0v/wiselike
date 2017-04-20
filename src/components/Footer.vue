<template lang="pug">
  .footer
    .logos
      router-link.logo(to='/', exact='', title="Home")
        img(src='../assets/logo.png', alt='logo')
      a.logo(href="https://github.com/g0v/wiselike" title="Github" target="_blank")
        i.fa.fa-github
    .license
      p This license lets others distribute, remix, tweak, and build upon your work, even commercially, as long as they credit you for the original creation. This is the most accommodating of licenses offered. Recommended for maximum dissemination and use of licensed materials.
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
  .logos {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    // vertical-align: bottom;
    .logo {
      margin: 1ch;
      i {
      color: gray;
      font-size: 5rem;
      }
      img {
        max-width: 5rem;
        height: auto;
      }
    }
  }
  .license {
    margin: 0 auto;
    max-width: $maxWidth;
    color: lightgray;
  }
}
</style>
