<template lang="pug">
  .hello
    h2 {{msg}}
    profile
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
