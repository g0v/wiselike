<template lang="pug">
  el-row.component
    el-col.logos(:lg='8', :sm='24')
      //- router-link.logo(to='/', exact='', title="Home")
        img(src='../assets/logo.png', alt='logo')
      a.logo(href="https://github.com/g0v/wiselike", title="Github", target="_blank")
        i.fa.fa-github
      a.el-button(href="https://github.com/g0v/wiselike/issues", title="Issue", target="_blank")
        | 錯誤回報
    el-col.license(:lg='16', :sm='24')
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
@import 'node_modules/font-awesome/scss/font-awesome';
.component {
    max-width: $maxWidth;
    margin: 0 auto;
  // hr {
  //   width: 50%;
  // }
  .logos {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
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
    padding: 1em;
    font-size: 0.5em;
    color: gray;
  }
}
</style>
