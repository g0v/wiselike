<template lang="pug">
  .hello
    h2 {{msg}}
    wisdom
</template>

<script>
  import wisdom from './Wisdom.vue'
  export default {
    name: 'hello',
    components: {
      wisdom
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
