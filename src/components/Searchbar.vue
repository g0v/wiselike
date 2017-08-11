<<template lang="pug">
  .Search
    el-input(placeholder="Search...", v-model='input', @keyup.enter.native='submit', icon='search', :on-icon-click="submit")
        el-select(v-model='select', slot='prepend', placeholder="Select")
          el-option(label='Users', value='Users')
          el-option(label='Issues', value='Issues')
        //- el-button.icon(slot='append', icon='search', @click='submit')
        Searchresult(:users='users')  
</template>

<script>

import Searchresult from '../components/Searchresult.vue'

export default {
  name: 'search',
  props: ['users'],
  components: [
    Searchresult
  ],
  data () {
    return {
      input: '',
      select: '',
      search_string: ''
    }
  },
  methods: {
    submit: function () {
      this.search_string = this.input
      if (this.select === '') {
        alert('請選擇搜尋類別!')
      } else {
        var str = '/Searchresult/' + this.select + '/' + this.input
        this.$router.push({path: str})
      }
    }
  }
}
</script>

<style lang="scss">
@import '../global.scss';
.el-select .el-input {
    width: 90px;
}
.el-input-group {
    width: 25em;
}
.el-input-group__append{
  padding: 0 5px;
}
@media all and (max-width: $mobilebreakpoint){
  .el-input-group {
    width: 21em;
  }
}
</style>
