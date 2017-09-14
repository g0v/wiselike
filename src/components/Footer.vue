<template lang="pug">
  el-row.component
    el-col.logos(:lg='10', :sm='24')
      router-link.logo(to='/', exact='') wiselike
      //- router-link.logo(to='/', exact='', title="Home")
        img(src='../assets/wiselikelogo.png', alt='logo')
      a.github(href="https://github.com/g0v/wiselike", title="Github", target="_blank")
        i.fa.fa-github
      a.el-button(href="https://github.com/g0v/wiselike/issues", title="Issue", target="_blank")
        p
          | 網頁錯誤
          br
          | 回報建議
    el-col.license(:lg='14', :sm='24')
      p
        i.fa.fa-creative-commons
        |  This license lets others distribute, remix, tweak, and build upon your work, even commercially, as long as they credit you for the original creation. This is the most accommodating of licenses offered. Recommended for maximum dissemination and use of licensed materials.
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
  .logos {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    padding: 1em;
    >* {
      margin-right: 1ch;
    }
    .logo {
      color: $logocolor;
      font-family: $logofont;
      text-decoration: none;
      font-size: 2.2rem;
    }
    .github i {
      color: gray;
      font-size: 5rem;
    }
  }
  .license {
    padding: 1em;
    font-size: 0.8rem;
    color: gray;
    text-align: left;
  }
}
</style>
