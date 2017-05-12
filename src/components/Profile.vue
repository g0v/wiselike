<template lang="pug">
  .profile(v-if="user")
    input.hide_input(type='file', @change='onFileChange', v-if='!ImageEdit')
    .info(:style="{ backgroundImage: `url(${user.userBg})` }")

      .avatar
        div(v-if='!ImageEdit')
          div(v-if='!image')
            .el-icon-plus.avatar-uploader-icon
            div: button.avatar_button(@click='ImageEdit = true, image = false') 取 消
          div(v-else='')
            div: img.avatar_image(:src='image')
            button.avatar_button(@click='Editimage', v-if='errimage === true') 送 出
            button.avatar_button(@click='ImageEdit = true, image = false') 取 消
        div(v-if='ImageEdit')
          img.avatar_image(:src="user.userIcon")
          el-button.button.absolute(@click='open', icon='edit', size='large', v-if='selfkey')

      h1 {{ user.userName }}

      .category
        el-card.box-card(v-if='!CateEdit')
          h3 【領域選項，最多勾選五項】
          el-checkbox-group(v-model='checkList', :min="1", :max="5")
            el-checkbox(v-for='city in cities', :label='city', :key='city') {{city}}
          span 新增領域：
          el-input.catagoryInput(v-model='addcategory', placeholder='请输入内容')
          el-button.button(type='primary' @click='AddCategory') 新 增
          hr
          el-button.button(type='primary' @click='EditCategory') 送 出
          el-button.button(@click='CateEdit = true') 取 消
        div(v-if='CateEdit')
          el-tag.checkbox(v-for='List in checkList',type='warning',:key="List") {{List}}
          el-button.button(@click='CateEdit = false', icon='edit', size='large', v-if=' selfkey')

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

    wisdomWrapper(:type = '"private"', :userId = "user.userId")
    wisdomWrapper(:type = '"public"', :userId = "user.userId")

  .profile(v-else)
    h1 no such user
</template>

<script>
  import wisdomWrapper from './wisdom_wrapper.vue'
  import ask from './Ask.vue'
  import axios from 'axios'
  import config from '../../config'
  export default {
    name: 'profile',
    props: ['users'],
    components: {
      wisdomWrapper,
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
        cities: [],
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
        selfkey: false,
        addcategory: ''
      }
    },
    methods: {
      AddCategory: function () {
        this.cities.push(this.addcategory)
        this.checkList.push(this.addcategory)
      },
      category: function () {
        axios.get('https://talk.pdis.nat.gov.tw/tags.json').then((val) => {
          let tags = val.data.tags
          tags.filter((tag) => {
            if (tag.id.indexOf('wiselike-') > -1) {
              this.cities.push(tag.id.replace(/wiselike-/, ''))
            }
          })
        })
      },
      CategoryLink: function (localstorage) {
        return config.runtime.proxyHost + '/users/' + this.user.userId + '/category?sso=' + localstorage.sso + '&sig=' + localstorage.sig
      },
      EditCategory: function () {
        this.CateEdit = true
        // console.log(this.user.userCategory)
        if (this.checkList[0].indexOf('尚未選擇領域') > -1) {
          this.checkList = this.checkList.slice(1)
        }
        let list = []
        for (let i in this.checkList) {
          list[i] = 'wiselike-' + this.checkList[i]
        }
        axios({
          method: 'post',
          url: this.CategoryLink(this.local_storage),
          data: {categoryUrl: this.user.topic_url, tag: list}
        })
        .then(
          this.$message.success('成功更改，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')
        )
        .catch(function (error) {
          this.$message.error('成功失敗，請稍後重試。')
          console.log(error)
        })
      },
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
        this.local_storage.username === this.user.userId ? this.selfkey = true : this.selfkey = false
        if (this.user.userCategory === undefined || this.user.userCategory.length === 0) {
          this.checkList[0] = '尚未選擇領域'
        } else {
          this.checkList = this.user.userCategory
        }
        for (let i in this.checkList) {
          this.checkList[i] = this.checkList[i].replace(/wiselike-/, '')
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
      this.category()
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
    max-width: $maxWidth;
    margin: 0 auto;
  }
  .catagoryInput {
    max-width: 30%;
    margin: 2em 0 1em 0;
  }
  .introduction {
    max-width: $maxWidth;
    margin: 0 auto;
  }
  .checkbox {
    background-color: rgba(0, 0, 0, 0.47);
    color: #ffc233;
    font-weight: 700;
    margin:1em;
    font-size: 1rem;
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
      background: rgba(gray, 0.5);
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
