<template lang="pug">
  el-row.component
    el-col.logos(:lg='8', :sm='24')
      router-link.logo(to='/', exact='', title="Home")
        img(src='../assets/wiselikelogo.png', alt='logo')
      a.logo(href="https://github.com/g0v/wiselike", title="Github", target="_blank")
        i.fa.fa-github
      a.el-button(href="https://github.com/g0v/wiselike/issues", title="Issue", target="_blank")
        p
          | 網頁錯誤
          br
          | 回報建議
    el-col.license(:lg='16', :sm='24')
      p This license lets others distribute, remix, tweak, and build upon your work, even commercially, as long as they credit you for the original creation. This is the most accommodating of licenses offered. Recommended for maximum dissemination and use of licensed materials.
      p 我們深信網路言論自由就是一切，本網站不會進行任何形式的內容審查；除非應法院或其他政府機關依法提出的要求，本網站也不會主動移除他人在上面發表的內容。
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
    padding:1em;
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
    font-size: 0.8rem;
    color: gray;
    font-weight:800;
  }
}
</style>
