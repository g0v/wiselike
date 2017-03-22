<template lang="pug">
  el-form
    el-form-item
      el-input(type='textarea' v-model="question")
    el-form-item
      el-button(type="primary", @click="submit") 提問
    
</template>

<script>
  export default {
    name: 'ask',
    data () {
      return {
        question: ''
      }
    },
    methods: {
      submit: function () {
        console.log(this.question)
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
