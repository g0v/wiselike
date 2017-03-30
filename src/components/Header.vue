<template lang="pug">
  .header
    el-menu
      el-menu-item
        el-row.row-bg(type='flex', justify='space-between')
          el-col(:span='6')
            //- el-input(icon='search', v-model="myKey", :on-icon-click='search')
            Search(:users="users")
          el-col(:span='6') 
            h1 Wiselike 
          el-col(:span='6')
            .btn-group
              el-button Create My Profile
              el-button Login

</template>

<script>
  import Search from './Search.vue'

  export default {
    name: 'header',
    props: ['users'],
    components: {
      Search
    },
    data () {
      return {
        myKey: ''
      }
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
