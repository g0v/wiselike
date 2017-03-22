<template lang="pug">
  .header
    el-menu
      el-menu-item
        el-row.row-bg(type='flex', justify='space-between')
          el-col(:span='6')
            el-input(icon='search', :on-icon-click='search')
          el-col(:span='6') 
            h1 Wiselike
          el-col(:span='6')
            .btn-group
              el-button Create My Profile
              el-button Login

</template>

<script>
  export default {
    name: 'header',
    data () {
    }
  }
</script>

<style lang="scss" scoped>
  .btn-group{
    text-align: right;
  }
  h1{
    margin-top: 0px;
    text-align: center
  }
</style>
