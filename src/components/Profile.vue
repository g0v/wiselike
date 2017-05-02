<template lang="pug">
  .profile(v-if="user")
    .info(:style="{ backgroundImage: `url(${user.userBg})` }")
      //- el-upload.avatar-uploader(action='https://jsonplaceholder.typicode.com/posts/', :show-file-list='false', :on-success='handleAvatarSuccess', :before-upload='beforeAvatarUpload')
      //-   img.avatar(v-if='imageUrl', :src='imageUrl')
      //-   i.el-icon-plus.avatar-uploader-icon(v-else='')

      //- div(v-if='!image')
      //-   h2 Select an image
      //-   input(type='file', @change='onFileChange')
      //- div(v-else='')
      //-   img.avatar(v-if='image', :src='image')
      //-   button(@click='removeImage') Remove image

      img.avatar(:src="user.userIcon")
      h1 {{ user.userName }}
      el-row(:gutter='20', v-if='edit === true')
        el-col(:span='12', :offset='6')
          el-form.demo-ruleForm(:model='ruleForm', :rules='rules', ref='ruleForm', :show-message='errmessage')
            el-form-item.acenter(prop='introduceraw')
              el-input.input(v-model='ruleForm.introduceraw', auto-complete='off', type='textarea', :autosize="{ minRows: 5, maxRows: 15}")
            div
              el-button.button(type='primary', @click="EditIntroduction('ruleForm')") 送 出
              el-button.button(type='primary', @click='init') 取 消
      .reply
        el-button.button(@click='edit = true, editbutton = false, errmessage = true', icon='edit', size='large', v-if='editbutton === true')
        h3(v-if='edit === false') {{user.userDescription}}
      ask.ask(:userId = "user.userId", v-if='edit === false')
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
        edit: false,
        editbutton: false,
        errmessage: true,
        local_storage: '',
        id: '',
        image: '',
        imageUrl: ''
      }
    },
    methods: {
      onFileChange (e) {
        var files = e.target.files || e.dataTransfer.files
        if (!files.length) return
        this.createImage(files[0])
      },
      createImage (file) {
        // var image = new Image()
        var reader = new FileReader()
        var vm = this
        reader.onload = (e) => {
          vm.image = e.target.result
        }
        reader.readAsDataURL(file)
        console.log(reader)
      },
      removeImage: function (e) {
        this.image = ''
      },
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
            axios.get('https://talk.pdis.nat.gov.tw' + this.user.topic_url + '.json').then((val) => {
              this.id = val.data.post_stream.posts[0].id
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
            })
          }
        })
      },
      ShowYourself: function () {
        this.local_storage = window.localStorage
        this.ruleForm.introduceraw = this.user.userDescription
        if (this.local_storage.username === this.user.userId) {
          this.editbutton = true
        }
        console.log(this.local_storage)
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
      box-shadow: 0 3px 6px -3px black;
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
    align-items: center;
    justify-content: center;
  }
  .acenter {
    position: inherit !important;
  }
  .ask {
    margin-top: 1em;
  }
}
</style>
