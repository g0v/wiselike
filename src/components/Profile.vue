<template lang="pug">
  .profile(v-if="user")
    input.hide_input(type='file', @change='onFileChange', v-if='!ImageEdit')

    .info.dim(:style="{ backgroundImage: `url(${ProfileBackroundImage})` }")

      .backgroundImage
        el-button.button.backgroundimage(icon='picture', size='large', v-if='selfkey') 變更背景
        input.hide_input_background(@click="warningText('background')",type='file', @change='onFileChange', v-if='selfkey')
        .background_button
          el-button(type='primary' @click='Editimage', v-if='background') 送 出
          el-button(@click='cancelBackground', v-if='background') 取 消

      .avatar
        div(v-if='ImageEdit')
          router-link(:to="'/user/' + user.name")
            img.avatar_image(:src="user.avatar")
          el-button.button.absolute(@click="warningText('avatar')", icon='edit', size='large', v-if='selfkey && !background')
        div(v-else)
          div(v-if='!image')
            .el-icon-plus.avatar-uploader-icon
            div: button.avatar_button(@click='ImageEdit = true, image = false') 取 消
          div(v-else)
            div: img.avatar_image(:src='image')
            button.avatar_button(@click='Editimage', v-if='errimage === true') 送 出
            button.avatar_button(@click='ImageEdit = true, image = false') 取 消

      .username
        .description
          h3.name(v-if='Rename') {{ originalname || user.nickname || user.name }}
          el-button.button(@click='Getrename', icon='edit', size='large', v-if='Rename && selfkey')
        .edit(v-if='!Rename && selfkey')
          el-input.inputname(v-model='originalname')
          div
            el-button(type='primary', @click="Editrename") 送 出
            el-button(@click='Rename = true') 取 消

      .category
        el-card.box-card(v-if='!CateEdit')
          h3 【領域選項，最多勾選五項】
          el-checkbox-group(v-model='checkList', :min="1", :max="5")
            el-checkbox(v-for='city in cities', :label='city', :key='city') {{city}}
          span 新增領域：
          el-input.catagoryInput(v-model='addcategory', placeholder='请输入内容')
          el-button(type='primary' @click='AddCategory') 新 增
          hr
          el-button(type='primary' @click='EditCategory') 送 出
          el-button(@click='CateEdit = true') 取 消
        div(v-if='CateEdit')
          el-tag.checkbox(v-for='List in checkList',type='warning',:key="List") {{List}}
          el-button.button(@click='CateEdit = false', icon='edit', size='large', v-if=' selfkey')

      .introduction
        .description
          h3(v-if='Introedit', v-html='newDesc || ruleForm.introduceraw')
          el-button.button(@click='Introedit = false', icon='edit', size='large', v-if='Introedit && selfkey')
        .edit
          el-form.demo-ruleForm(:model='ruleForm', :rules='rules', ref='ruleForm', :show-message='!Introedit', v-if='!Introedit && selfkey')
            el-form-item.acenter(prop='introduceraw')
              el-input.input(v-model='ruleForm.introduceraw', auto-complete='off', type='textarea', :autosize="{ minRows: 5, maxRows: 15}")
              el-button(type='primary', @click="EditIntroduction('ruleForm')") 送 出
              el-button(@click='Introedit = true') 取 消

      .Subscribe-Ask(v-if='login')
        .subscribe
          el-button.subscribebutton(type='danger', @click='subscribe', icon='star-on', v-if='!subscribeStatus') Subscribe
          el-button.unsubscribebutton(type='danger', @click='subscribe', icon='star-off', v-if='subscribeStatus') Unsubscribe

        ask(:userId = "user.name", v-if='Introedit')
      .unlogin(v-else)
        el-button(type="warning", @click.native="Login") Login to ask

    .wrapped
      //- single wisdom
      template(v-if='topId')
        wisdom(:type='"top"', :userId='user.name', :topicId='topId')
        p.viewAll: router-link(:to='"/user/" + user.name') View {{user.nickname}}'s all wisdoms
      //- multiple wisdom with wrap
      el-tabs(v-else, v-model='mode')
        el-tab-pane(v-if='selfkey')
          span(slot='label', name='private', @click="information('private')")
            i.el-icon-information(v-if='infor')
            | 等待回答
          wisdomWrapper(:type = '"private"', :userId = "user.name", :topicId='topId || myQuestionID')
        el-tab-pane(label='歷史問題', name='public')
          wisdomWrapper(:type = '"public"', :userId = "user.name", :topicId='topId')
        el-tab-pane(label='我的提問', name='myQuestion')
          wisdomWrapper(:type = '"myQuestion"', :userId = "user.name", :topicId='topId || myQuestionID')

  .profile(v-else)
    h1 no such user
</template>

<script>
  import { Loading } from 'element-ui'
  import wisdom from './Wisdom.vue'
  import wisdomWrapper from './wisdom_wrapper.vue'
  import ask from './Ask.vue'
  import axios from 'axios'
  // import config from '../../config'
  // import $ from 'jquery'
  export default {
    name: 'profile',
    props: ['users', 'watchCategory'],
    components: {
      wisdom,
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
        addcategory: '',
        backgroundimage: '',
        background: false,
        ProfileBackroundImage: '',
        mode: 'public',
        myQuestion: false,
        myQuestionID: '',
        user: {},
        topicUrl: '',
        introductionID: '',
        categoryID: '',
        subscribeStatus: '',
        login: false,
        infor: false,
        routeUserId: '',
        Rename: true,
        originalname: ''
      }
    },
    methods: {
      proxyUrlLink: function (link, type) {
        let localstorage = window.localStorage
        let category = process.env.proxyHost + '/users/' + this.user.name + '/category?sso=' + localstorage.sso + '&sig=' + localstorage.sig
        let image = process.env.proxyHost + '/users/' + this.user.name + '/' + type + '?sso=' + localstorage.sso + '&sig=' + localstorage.sig
        let subscribe = process.env.proxyHost + '/users/' + this.user.name + '/subscribe?sso=' + localstorage.sso + '&sig=' + localstorage.sig
        let introduction = process.env.proxyHost + '/users/' + this.user.name + '/introduction?sso=' + localstorage.sso + '&sig=' + localstorage.sig
        let rename = process.env.proxyHost + '/users/' + this.user.name + '/rename?sso=' + localstorage.sso + '&sig=' + localstorage.sig

        if (link === 'category') return category
        else if (link === 'image') return image
        else if (link === 'subscribe') return subscribe
        else if (link === 'introduction') return introduction
        else if (link === 'rename') return rename
      },
      Getrename: function () {
        this.Rename = false
        this.originalname = this.originalname || this.user.nickname || this.user.name
        console.log(this.originalname)
      },
      Editrename: function () {
        let vm = this
        /* turn on full screen loading */
        let loadingInstance = Loading.service({ fullscreen: true, text: '資料更改中，請稍等' })
        let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        let formd = new URLSearchParams()
        formd.append('name', this.originalname)
        axios.post(this.proxyUrlLink('rename'), formd, config)
        .then(() => {
          /* close loading */
          this.Rename = true
          loadingInstance.close()
          vm.$message.success('成功更改名稱')
        })
        .catch(function (error) {
          loadingInstance.close()
          vm.$message.error('更改失敗，請稍後重試。')
          console.log(error)
        })
      },
      Login: function () {
        window.open(process.env.proxyHost + '/login')
      },
      subscribe: function () {
        let vm = this
        /* turn on full screen loading */
        let loadingInstance = Loading.service({ fullscreen: true, text: '資料更改中，請稍等' })
        let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        let formd = new URLSearchParams()
        /* watching category need categoryid */
        formd.append('categoryID', this.categoryID)
        /* subscribe:false or unsubscribe:true */
        formd.append('subscribeStatus', this.subscribeStatus)
        axios.post(this.proxyUrlLink('subscribe'), formd, config)
        .then(() => {
          /* close loading */
          loadingInstance.close()
          this.subscribeStatus = !this.subscribeStatus
          if (this.subscribeStatus) vm.$message.success('成功訂閱，未來每一個提問，將通知你。')
          else vm.$message.warning('取消訂閱')
        })
        .catch(function (error) {
          loadingInstance.close()
          vm.$message.error('訂閱失敗，請稍後重試。')
          console.log(error)
        })
      },
      cancelBackground: function () {
        this.background = false
        this.ProfileBackroundImage = this.user.background
      },
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
      EditCategory: function () {
        /* turn on full screen loading */
        let loadingInstance = Loading.service({ fullscreen: true, text: '資料更改中，請稍等' })
        this.CateEdit = true
        /* remove array[0] '尚未選擇領域' */
        if (this.checkList[0].indexOf('尚未選擇領域') > -1) {
          this.checkList = this.checkList.slice(1)
        }
        let list = []
        /* Add 'wiselike' before category */
        for (let i in this.checkList) {
          list[i] = 'wiselike-' + this.checkList[i]
        }
        /* form data type application/x-www-form-urlencoded */
        let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        let formd = new URLSearchParams()
        formd.append('introductionID', this.introductionID)
        formd.append('tag', list)
        /* change category via proxy.wiselike.tw */
        axios.post(this.proxyUrlLink('category'), formd, config)
        .then(() => {
          /* close loading */
          loadingInstance.close()
          this.$message.success('成功更改，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')
        })
        .catch(function (error) {
          loadingInstance.close()
          this.$message.error('成功失敗，請稍後重試。')
          console.log(error)
        })
      },
      warningText: function (type) {
        if (type === 'avatar') {
          this.ImageEdit = false
        }
        this.$message('檔案請使用 JPG/PNG 格式，上限 2MB')
      },
      Editimage: function () {
        /* turn on full screen loading */
        let loadingInstance = Loading.service({ fullscreen: true, text: '資料上傳中，請稍等' })
        this.background = false
        let config = {headers: {'Content-Type': 'multipart/form-data'}}
        let form = new FormData()
        let url = ''
        this.imagefile ? (form.append('avatar', this.imagefile), url = this.proxyUrlLink('image', 'avatar')) : (form.append('profile_background', this.backgroundimage), url = this.proxyUrlLink('image', 'background'))
        axios.post(url, form, config)
        .then((val) => {
          ((this.imagefile) && (this.user.avatar = this.image))
          this.ImageEdit = true
          this.image = false
          /* turn off full screen loading */
          loadingInstance.close()
          this.$message.success('成功更改，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')
        })
        .catch(function (error) {
          /* turn off full screen loading */
          loadingInstance.close()
          this.$message.error('更改失敗，請稍後重試。')
          console.log(error)
        })
      },
      onFileChange: function (e) {
        let files = e.target.files || e.dataTransfer.files
        /* check file */
        if (!files.length) return
        let imgfile = files[0]
        /* check image type only jpeg or png */
        const isJPG = imgfile.type === 'image/jpeg' || 'image/png'
        /* check image size < 2MB */
        const isLt2M = imgfile.size / 1024 / 1024 < 2
        if (!isJPG) {
          this.$message.error('圖片請使用 JPG/PNG 格式!')
          this.errimage = false
          return
        } else if (!isLt2M) {
          this.$message.error('圖片大小上限 2MB!')
          this.errimage = false
          return
        } else this.errimage = true
        let reader = new FileReader()
        let vm = this
        /* check type is avatar or backgroundimage */
        let type = e.target.className.indexOf('background') > -1
        reader.onload = (e) => {
          /* if backgroundimage do this */
          if (type) {
            vm.backgroundimage = files[0]
            vm.background = true
            vm.ProfileBackroundImage = e.target.result
          } else {
            vm.image = e.target.result
            vm.imagefile = files[0]
          }
        }
        reader.readAsDataURL(files[0])
      },
      EditIntroduction: function (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let vm = this
            axios.get('https://talk.pdis.nat.gov.tw' + this.topicUrl + '.json').then((val) => {
              this.id = val.data.post_stream.posts[0].id
              let config = {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
              let form = new URLSearchParams()
              form.append('id', this.id)
              form.append('raw', this.ruleForm.introduceraw)
              axios.post(this.proxyUrlLink('introduction'), form, config)
              .then(() => {
                this.Introedit = true
                vm.$message.success('成功更改簡介，但是鑒於瀏覽器緩存可能需要一段時間後才會生效。')
                this.newDesc = this.ruleForm.introduceraw
              })
              .catch(function (error) {
                console.log(error)
                vm.$message.error('更改失敗，請稍後重試。')
              })
            })
          }
        })
      },
      ShowYourself: function () {
        this.local_storage = window.localStorage
        /* check username is not undefined */
        if (this.user.name !== undefined) this.user.name = this.user.name.toLowerCase()
        /* confirm login user */
        if ((this.local_storage.username === this.user.name) && (this.user.name !== undefined) && (this.local_storage.username !== undefined)) {
          this.selfkey = true
        }
        /* check user login status */
        this.login = this.local_storage.username !== undefined
        this.ProfileBackroundImage = this.user.background
      },
      /* receive ask component data : show in myquestion */
      receiveAskData: function (e) {
        this.myQuestion = true
        this.myQuestionID = e.topicid
        this.mode = 'myQuestion'
      },
      information: function (e) {
        /* notification question */
        e.topicid > 0 ? this.infor = true : this.infor = false
      },
      getUserData: function () {
        this.routeUserId = this.$route.params.userId.replace(/-.*/, '')
        /* get user data */
        axios.get('https://talk.pdis.nat.gov.tw/users/' + this.routeUserId + '.json').then((userdata) => {
          let user = {
            id: '',
            name: '',
            nickname: '',
            avatar: '',
            background: '',
            description: ''
          }
          let profile = userdata.data.user
          user.nickname = profile.name
          user.name = profile.username
          /* set avatar size 300px */
          user.avatar = 'https://talk.pdis.nat.gov.tw' + profile.avatar_template.replace(/{size}/, '300')
          if (profile.profile_background === undefined) {
            user.background = 'https://images.unsplash.com/photo-1484199408980-5918a796a53f?dpr=1&auto=compress,format&fit=crop&w=1199&h=776&q=80&cs=tinysrgb&crop=&bg='
          } else {
            user.background = 'https://talk.pdis.nat.gov.tw' + profile.profile_background
          }
          this.user = user
        })

        /* Get user introduction and [wiselike-tag] */
        axios.get('https://talk.pdis.nat.gov.tw/c/wiselike/profile-' + this.routeUserId.toLowerCase().replace(/_/g, '-') + '.json')
        .then((post) => {
          let vm = this
          let info = post.data.topic_list.topics[0]
          /* get user discription */
          axios.get('https://talk.pdis.nat.gov.tw/t/' + info.id + '.json?include_raw=1')
          .then((val) => {
            this.ruleForm.introduceraw = val.data.post_stream.posts[0].raw
          })
          this.topicUrl = '/t/profile-' + this.$route.params.userId + '/' + info.id
          /* get introduction post id */
          this.introductionID = info.id
          /* get profile category id */
          this.categoryID = info.category_id
          if (this.watchCategory.length > 0) {
            this.subscribeStatus = this.watchCategory.some(function (value, index, array) {
              return value === vm.categoryID
            })
          }
          // console.log(subscribeStatus)
          /* get user tag */
          info.tags.forEach((tag) => {
            this.checkList.push(tag.replace(/wiselike-/, ''))
          })
          if (this.checkList.length === 0) {
            this.checkList[0] = '尚未選擇領域'
          }
        })

        this.$bus.on('from-Ask', this.receiveAskData)
        /* notification question */
        this.$bus.on('from-wisdom-wrapper-infor', this.information)
        this.ShowYourself()
        this.category()
      }
    },
    watch: {
      user: function () {
        this.ShowYourself()
      },
      /* route change user */
      '$route' (to, from) {
        /* reset init data like init() */
        Object.assign(this.$data, this.$options.data())
        /* get user data */
        this.getUserData()
      }
    },
    created: function () {
      // console.log(this.$route.params.userId)
      this.getUserData()
    },
    mounted: function () {
      this.List = this.checkList
    },
    computed: {
      topId: function () {
        // console.log(this.$route.params.userId.split('-')[1])
        return Number(this.$route.params.userId.split('-')[1])
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
    margin: 1em auto;
  }
  .backgroundImage {
    text-align: right;
    position: absolute;
    z-index: 105 !important;
    .background_button {
      top: 3em;
    }
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
    margin: 0 1ch;
    border-radius: 0;
  }
  .hide_input {
    border: 1px solid red;
    height: 11em;
    opacity: 0;
    width: 11em;
    // filter: alpha(opacity=0);
    position: absolute;
    z-index: 999;
    margin: auto;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin-top: 5em;
  }
  .hide_input_background {
    opacity: 0;
    border: 1px solid red;
    height: 2em;
    width: 6.5em;
    position: absolute !important;
    right: 0em;
  }
  .info {
    background-size: cover;
    background-position: center;
    position: relative;
    color: white;
    text-align: center;
    padding: 5em 0 3em;
    .avatar-uploader-icon {
      font-size: 28px;
      color: #ffffff;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
      border: 3px dashed #d9d9d9;
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
    .name {
      font-size: 3rem;
      margin: 0.5em;
    }
    p {
      padding: 0 calc((100% - #{$maxWidth}) / 2);
    }
    .subscribe {
      margin: 1em;
      .subscribebutton {
        background-color: rgba(255, 89, 89, 0.53);
        border-color: rgba(255, 73, 73, 0);
        width: 8em;
        font-size: 1em;
        padding: 10px;
      }
      .unsubscribebutton {
        background-color: #324157;
        border-color: rgba(255, 73, 73, 0);
        width: 8em;
        font-size: 1em;
        padding: 10px;
      }
      .text {
        font-size: 1.2rem;
      }
    }
  }
  .input {
    margin-bottom: 1em;
  }
  .inputname {
      width: 15em;
      margin: 1em;
  }
  .right {
    text-align: right !important;
    margin-right: 10em;
  }
  .button {
    background-color: rgba(247, 239, 239, 0.49);
    border: 0;
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
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  .acenter {
    position: inherit !important;
  }
}
.wrapped {
  margin: 2em auto;
  max-width: $maxWidth;
  .el-icon-information {
    color: red;
    font-size: 1.5em;
  }
  .viewAll {
    text-align: center;
  }
}
@media all and (max-width: $mobilebreakpoint) {
  .profile {
    .info {
      .avatar_image {
        width: 150px;
        height: 150px;
      }
      .name {
        font-size: 1.5rem;
        margin: 0.5em;
      }
      .introduction {
        .description {
          h3 {
            font-size:1rem;
            margin:0.5em;
          }
        }
      }
    }
    .button {
      padding:0.5rem;
    }
  }
}
</style>
