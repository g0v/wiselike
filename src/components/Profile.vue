<template lang="pug">
  .profile(v-if="user")
    .info(:style="{ backgroundImage: `url(${user.userBg})` }")
      img.avatar(:src="user.userIcon")
      h1 {{ user.userId }}
      el-row(:gutter='20')
        el-col(:span='12', :offset='6')
          el-form.demo-ruleForm(:model='ruleForm', :rules='rules', ref='ruleForm', :show-message='errmessage')
            el-form-item.acenter(prop='introduceraw')
              el-input.input(v-model='ruleForm.introduceraw', auto-complete='off', type='textarea', :autosize="{ minRows: 5, maxRows: 15}", v-if='edit === true')
            div
              el-button.button(type='primary', @click="EditIntroduction('ruleForm')", v-if='edit === true') 送 出
              el-button.button(type='primary', @click='init', v-if='edit === true') 取 消
      .reply
        el-button.button(@click='edit = true, editbutton = false, errmessage = true', icon='edit', size='large', v-if='editbutton === true')
        h3(v-html='introduce', v-if='edit === false')
      ask(:userId = "user.userId", v-if='edit === false')
    wisdom(:userId = "user.userId")
  .profile(v-else)
    h1 no such user
</template>

<script>
  import wisdom from './Wisdom.vue'
  import ask from './Ask.vue'
  import axios from 'axios'
  import config from '../../config'
  export default {
    name: 'profile',
    props: ['users'],
    components: {
      wisdom,
      ask
    },
    data () {
      var CheckContent = (rule, value, callback) => {
        if (String(value).length < 15) {
          callback(new Error('欄位長度需大於15個字'))
        } else {
          callback()
        }
      }
      return {
        ruleForm: {
          introduceraw: ''
        },
        rules: {
          introduceraw: [
            { validator: CheckContent, trigger: 'blur' }
          ]
        },
        introduce: '',
        edit: false,
        editbutton: false,
        errmessage: true,
        local_storage: '',
        id: ''
      }
    },
    methods: {
      init: function () {
        this.edit = false
        this.errmessage = false
        this.editbutton = true
      },
      Link: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.user.userId + '/introduction?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      EditIntroduction: function (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            axios({
              method: 'post',
              url: this.Link(this.local_storage),
              data: {id: this.id, raw: this.ruleForm.introduceraw}
            }).then(
              this.edit = false,
              this.sucessful(),
              this.init()
            )
            .catch(function (error) {
              console.log(error)
            })
          }
        })
      },
      ShowYourself: function () {
        this.local_storage = window.localStorage
        if (this.user.userfirsttopicid !== undefined) {
          if (this.local_storage.username === this.user.userId) {
            this.editbutton = true
          }
          axios.get('https://talk.pdis.nat.gov.tw/t/' + this.user.userfirsttopicid + '.json?include_raw=1').then((val) => {
            this.introduce = val.data.post_stream.posts[0].cooked
            this.ruleForm.introduceraw = val.data.post_stream.posts[0].raw
            this.id = val.data.post_stream.posts[0].id
          })
        }
      },
      sucessful () {
        this.$message({
          showClose: true,
          message: '成功更改簡介，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。',
          type: 'success'
        })
      }
    },
    watch: {
      user: function () {
        this.ShowYourself()
      }
    },
    created: function () {
      this.ShowYourself()
    },
    computed: {
      user: function () {
        let pos = this.users.map(e => e.userId).indexOf(this.$route.params.userId)
        if (pos < 0) {
          return false
        } else {
          return this.users[pos]
        }
      }
    }
  }

</script>

<style lang="scss" scoped>
@import '../global.scss';
.profile {
  .info {
    position: relative;
    color: white;
    text-align: center;
    padding: 5em 0 3em;
    background-size: cover;
    * {
      position: relative;
      z-index: 100;
    }
    .avatar {
      border-radius: 50%;
      width: 200px;
      height: 200px;
      box-shadow: 0 3px 6px -1px black;
    }
    p, h1 {
      padding: 0 calc((100% - #{$maxWidth}) / 2);
    }
    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 10;
      background: rgba(black, 0.5);
    }
  }
  .input {
    margin-bottom: 1em;
  }
  .right {
    text-align: right !important;
    margin-right: 10em;
  }
  .button {
    margin-left: 1em;
    margin-right: 0.5em;
    line-height: 0.5 !important;
    font-size: 0.5em !important;
  }
  .reply {
    display: flex;
    flex-flow: row nowrap;
    -webkit-align-items: center;
          align-items: center;
  -webkit-justify-content: center;
          justify-content: center;
  }
  .acenter {
    position: inherit !important;
  }
}
</style>
