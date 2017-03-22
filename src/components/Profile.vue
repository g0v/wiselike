<template lang="pug">
  .profile
    h1 Hello World
    p: img.avatar(src="../assets/avatar.png")
    p: el-button(type="primary", size="large") 我要發問
</template>

<script>
  export default {
    name: 'profile'
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
