<template lang="pug">
  .profile(v-if="user")
    input.hide_input(type='file', @change='onFileChange', v-if='!ImageEdit')
    .info(:style="{ backgroundImage: `url(${user.userBg})` }")
      .avatar
        div(v-if='!ImageEdit')
          div(v-if='!image')
            .el-icon-plus.avatar-uploader-icon
            div: button.avatar_button(@click='ImageEdit = true, image = false') 取消
          div(v-else='')
            div: img.avatar_image(:src='image')
            button.avatar_button(@click='Editimage', v-if='errimage === true') 送 出
            button.avatar_button(@click='ImageEdit = true, image = false') 取消
        div(v-if='ImageEdit')
          img.avatar_image(:src="user.userIcon")
          el-button.button.absolute(@click='open', icon='edit', size='large', v-if='selfkey')

        h1 {{ user.userName }}
        el-row(:gutter='20')
          el-col(:span='12', :offset='6')
            .category
              el-card.box-card(v-if='!CateEdit')
                template
                  el-checkbox-group(v-model='checkList', :min="0", :max="4")
                    el-checkbox(v-for='city in cities', :label='city', :key='city') {{city}}
                    h3 【領域選項，最多勾選四項】
                el-button.button(type='primary' ) 送 出
                el-button.button(@click='CateEdit = true') 取 消
              div(v-if='CateEdit && selfkey')
                el-tag(v-for='List in checkList',type='warning',:key="List") {{List}}
                el-button.button(@click='CateEdit = false', icon='edit', size='large', v-if='Introedit')
            .introduction
              el-form.demo-ruleForm(:model='ruleForm', :rules='rules', ref='ruleForm', :show-message='!Introedit', v-if='!Introedit && selfkey')
                el-form-item.acenter(prop='introduceraw')
                  el-input.input(v-model='ruleForm.introduceraw', auto-complete='off', type='textarea', :autosize="{ minRows: 5, maxRows: 15}")
                div
                  el-button.button(type='primary', @click="EditIntroduction('ruleForm')") 送 出
                  el-button.button(@click='Introedit = true') 取 消
        .description
          h3(v-if='Introedit') {{ newDesc || user.userDescription}}
          el-button.button(@click='Introedit = false', icon='edit', size='large', v-if='Introedit && selfkey')
      ask.ask(:userId = "user.userId", v-if='Introedit')
    wisdom(:userId = "user.userId")
  .profile(v-else)
    h1 no such user
</template>

<script>
  import wisdom from './Wisdom.vue'
  import ask from './Ask.vue'
  import axios from 'axios'
  import config from '../../config'
  const cityOptions = ['【資訊領域】', '【科學領域】', '【教育領域】', '【服務領域】', '【農學領域】', '【公共行政領域】', '【人文及藝術領域】', '【商業及法律領域】', '【醫藥衛生及社福領域】']
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
        cities: cityOptions,
        checkList: [],
        ruleForm: {
          introduceraw: ''
        },
        rules: {
          introduceraw: [
            { validator: CheckContent, trigger: 'blur' }
          ]
        },
        local_storage: '',
        id: '',
        image: '',
        newDesc: '',
        imagefile: '',
        Introedit: true,
        errimage: true,
        ImageEdit: true,
        CateEdit: true,
        List: '',
        selfkey: false
      }
    },
    methods: {
      open () {
        this.ImageEdit = false
        this.$message('頭像請使用 JPG 格式，上限 2MB')
      },
      imageLink: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.user.userId + '/avatar?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      Editimage () {
        let form = new FormData()
        form.append('avatar', this.imagefile)
        axios.post(this.imageLink(this.local_storage), form)
        .then((val) => {
          this.user.userIcon = this.image
          this.ImageEdit = true
          this.image = false
          this.$message.success('頭像更改成功!')
        })
      },
      onFileChange (e) {
        var files = e.target.files || e.dataTransfer.files
        if (!files.length) return
        this.imagefile = files[0]
        this.createImage(files[0])
        const isJPG = this.imagefile.type === 'image/jpeg'
        const isLt2M = this.imagefile.size / 1024 / 1024 < 2
        if (!isJPG) {
          this.$message.error('頭像圖片請使用 JPG 格式!')
          this.errimage = false
        } else if (!isLt2M) {
          this.$message.error('頭像大小上限 2MB!')
          this.errimage = false
        } else this.errimage = true
      },
      createImage (file) {
        let reader = new FileReader()
        let vm = this
        reader.onload = (e) => {
          vm.image = e.target.result
        }
        reader.readAsDataURL(file)
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
                this.Introedit = true,
                this.sucessful()
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
          this.selfkey = true
        } else {
          /* to overwrite init() setting this to true */
          this.selfkey = false
        }
      },
      sucessful () {
        this.$message({
          showClose: true,
          message: '成功更改簡介，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。',
          type: 'success'
        })
        /* push mock data into profile */
        this.newDesc = this.ruleForm.introduceraw
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
    mounted: function () {
      this.List = this.checkList
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
.el-checkbox {
  font-size: 1em !important;
  font-weight: 700;
  color: black;
  margin: 0.5em;
}
.profile {
  .box-card {
    color: black;
  }
  .hide_input {
    border: 1px solid red;
    height: 11em;
    opacity: 0;
    width: 11em;
    filter: alpha(opacity=0);
    width: 220px9;
    position: absolute;
    z-index: 999;
    margin: auto;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin-top: 5em;
  }
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
    .avatar-uploader-icon {
      font-size: 28px;
      color: #ffffff;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
      border: 3px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .avatar_image {
      border-radius: 50%;
      width: 200px;
      height: 200px;
      box-shadow: 0 3px 6px -3px black;
      vertical-align: top;
    }
    .avatar_button {
      margin-top: 2em;
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
  .absolute {
    position: absolute;
  }
  .description {
    max-width: $maxWidth;
    margin: 0 auto;
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
