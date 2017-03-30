<template lang="pug">
  .hello
<<<<<<< HEAD
    h2 {{msg}}
=======
    profile
>>>>>>> 50904edda493aa4c567183340f2ec3f183f8a3af
    wisdom
</template>

<script>
  import profile from './Profile.vue'
  import wisdom from './Wisdom.vue'
  export default {
    name: 'hello',
    components: {
      wisdom,
      profile
    },
    data () {
      return {
        msg: 'Welcome to Wiselike!'
      }
    }
  }
</script>

<style lang="scss" scoped>
h2{
  text-align: center;
}
</style>
