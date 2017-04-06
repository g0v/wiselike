<template lang="pug">
  .profile
    h2 {{$route.params.userId}}
    p: img.avatar(src="../assets/avatar.png")
    p: el-button(type="primary", size="large") 我要發問
</template>

<script>
  export default {
    name: 'profile',
    props: ['sUser']
  }
</script>

<style lang="scss" scoped>
  .profile {
    text-align: center;

    .avatar {
      border-radius: 50%;
      width: 250px;
      height: 250px;
    }
  }
</style>
