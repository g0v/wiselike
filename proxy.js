'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const querystring = require('querystring')
const axios = require('axios')
const FD = require('form-data')
const fs = require('fs')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)
      cb(null, file.originalname)
    })
  }
})
const upload = multer({ storage: storage })
require('dotenv').config() // use dotenv's process.env (prevent messing up with vuejs env config)
let config = {
  baseURL: `${process.env.DISCOURSE_HOST}`,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': 'application/json',
    'Api-Key': process.env.DISCOURSE_SUPER_API_KEY,
    'Api-Username': process.env.DISCOURSE_API_USERNAME
  }
}

function getLoginProfile (sso, sig) {
  let hmac = crypto.createHmac('sha256', process.env.DISCOURSE_SSO_SECRET)
  let decodedSso = decodeURIComponent(sso)
  let hash = hmac.update(decodedSso).digest('hex')
  if (sig !== hash) {
    console.log('Invalid auth')
    return 0
  }
  let profile = querystring.parse(Buffer.from(sso, 'base64').toString('utf8'))
  // TODO check that profile.nonce should match the nonce from the login step.
  return profile
}

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(cors())

app.listen(process.env.PROXY_PORT, () => {
  console.log(`server started at localhost:${process.env.PROXY_PORT}`)
})

app.get('/login', (req, res) => {
  let returnUrl = `${req.protocol}://${req.get('host')}/sso_done`
  // source: https://github.com/edhemphill/passport-discourse/blob/master/lib/discourse-sso.js
  let hmac = crypto.createHmac('sha256', process.env.DISCOURSE_SSO_SECRET)
  crypto.randomBytes(16, (err, buf) => {
    if (err) throw err
    let nonce = buf.toString('hex')
    let payload = Buffer.from(`nonce=${nonce}&return_sso_url=${returnUrl}`).toString('base64')
    let sig = hmac.update(payload).digest('hex')
    let urlRedirect = `${process.env.DISCOURSE_HOST}/session/sso_provider?sso=${encodeURIComponent(payload)}&sig=${sig}`
    res.redirect(urlRedirect)
  })
})

app.get('/sso_done', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let data = JSON.stringify({'sso': sso, 'sig': sig, 'username': me})
  let body = `
Hello ${me}, you may close this window. It will be automatically closed in 3 seconds.
<script>
window.opener.postMessage(${data}, "${process.env.webHost}");
window.close();
</script>
`
  res.send(body)
})

app.get('/whoami', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  res.json({'username': me})
})

app.get('/me', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let cat_name = `profile-${me}`
  /* get all the categories under wiselike category */
  axios.get(`categories`, Object.assign({
    params: {
      parent_category_id: process.env.wiselike_category_id,
    }
  }, config))
    .then(response => {
      let match = response.data.category_list.categories.find(category => category.name == cat_name)
      let cat_id = (match) ? match.id : 0
      /* get the category */
      return axios.get(`c/${cat_id}`, config)
    })
    .then(response => {
      res.json(response.data.topic_list.topics[0]) // the first topic describes the user profile
    })
    .catch(error => {
      console.log(`fail to get my profile`)
      res.send(error)
    })
})

app.get('/users', (_, res) => {
  axios.get(
    process.env.DISCOURSE_HOST + '/categories', {
      params: {
        parent_category_id: process.env.wiselike_category_id
      },
      headers: config.headers
    })
    .then(response => {
      res.json(response.data.category_list.categories)
    })
    .catch(error => {
      console.log(`fail to get wiselike users`)
      res.send(error)
    })
})

app.get('/users/:user', (req, res) => {
  let username = req.params.user
  let cat_name = `profile-${username}`
  /* get all the categories under wiselike category */
  axios.get(`categories`, Object.assign({
    params: {
      parent_category_id: process.env.wiselike_category_id,
    }
  }, config))
    .then(response => {
      let match = response.data.category_list.categories.find(category => category.name == cat_name)
      let cat_id = (match) ? match.id : 0
      /* get the category */
      return axios.get(`c/${cat_id}`, config)
    })
    .then(response => {
      res.json(response.data.topic_list.topics[0]) // the first topic describes the user profile
    })
    .catch(error => {
      console.log(`fail to get the profile of ${username}`)
      res.send(error)
    })
})

app.get('/users/:user/wisdoms', (req, res) => {
  let username = req.params.user
  let cat_name = `profile-${username}`
  /* get all the categories under wiselike category */
  axios.get(`categories`, Object.assign({
    params: {
      parent_category_id: process.env.wiselike_category_id,
    }
  }, config))
    .then(response => {
      let match = response.data.category_list.categories.find(category => category.name == cat_name)
      let cat_id = (match) ? match.id : 0
      /* get the category */
      return axios.get(`c/${cat_id}`, config)
    })
    .then(response => {
      response.data.topic_list.topics.shift() // leave first topic which is profile meta
      res.json(response.data.topic_list.topics)
    })
    .catch(error => {
      console.log(`fail to get ${username} wisdoms`)
      res.send(error)
    })
})

/* ****************** subscribestatus *********************/
app.get('/users/:user/subscribestatus', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    console.log('not login')
    return res.send([])
  }
  let me = profile.username
  axios.get(`users/${me}`, config)
    .then(response => {
      res.send(response.data.user.watched_category_ids)
    })
    .catch(error => {
      console.log(`fail to get my subscribe status list`)
      res.send([])
    })
})

/* ******************Ask a question *********************/
app.post('/users/:user/wisdoms', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let username = (req.body.anonymous === 'true') ? process.env.DISCOURSE_API_USERNAME : me
  let config_me = JSON.parse(JSON.stringify(config)) // deep-copy
  config_me.headers['Api-Username'] = me
  let topicID = 0
  /* find the id base on the name of category */
  let cat_name = `inbox-${req.params.user}`
  /* get all the categories under wiselike category */
  axios.get(`categories`, Object.assign({
    params: {
      parent_category_id: process.env.wiselike_category_id,
    }
  }, config))
    .then(response => {
      let match = response.data.category_list.categories.find(category => category.name == cat_name)
      let cat_id = (match) ? match.id : 0
      let formData = querystring.stringify({
          category: cat_id,
          title: req.body.title,
          raw: req.body.raw
      })
      /* post a topic(question) */
      return axios.post(`posts`, formData, config)
    })
    .then(val => {
      topicID = val.data.topic_id
      let ChangeNameformData = querystring.stringify({
          username: username,
          'post_ids[]': val.data.id
      })
      /* change the topic owner */
      return axios.post(`t/${topicID}/change-owner`, ChangeNameformData, config)
    })
    .then(_ => {
      let watchformData = querystring.stringify({
          notification_level: 3
      })
      /* watching topic */
      return axios.post(`t/${topicID}/notifications`, watchformData, config_me)
    })
    .then((val) => {
      val.data.success = topicID
      res.send(val.data)
    })
    .catch(error => {
      console.log(`fail to ask question`, error)
      res.send(error)
    })
})

/* ****************** Reply *********************/
app.post('/users/:user/wisdoms/topic', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let config_me = JSON.parse(JSON.stringify(config)) // deep-copy
  config_me.headers['Api-Username'] = me
  let topicid = req.query.topicid
  let type = req.query.type
  /* get the topic to be reply */
  axios.get(`t/${topicid}`, config)
    .then(res => {
      /* get the parent category */
      return axios.get(`c/${res.data.category_id}`, config)
    })
    .then(res => {
      /* check if replying topic is of mine */
      if (me != res.data.topic_list.topics[0].last_poster_username) { // FIXME: not sure last_poster_username is ok
        console.log(`reject to reply topics of others`)
        config = {}
      }
      let postformData = querystring.stringify({
          topic_id: topicid,
          raw: req.body.raw
      })
      /* creating new post under certain topic */
      return axios.post(`posts`, postformData, config)
    })
    .then((val) => {
      let ChangeNameformData = querystring.stringify({
          username: me,
          'post_ids[]': val.data.id
      })
      /* change the post owner to the user */
      return axios.post(`t/${topicid}/change-owner`, ChangeNameformData, config)
    })
    .then(_ => {
      let watchformData = querystring.stringify({
          notification_level: 3
      })
      /* watching topic */
      return axios.post(`t/${topicid}/notifications`, watchformData, config_me)
    })
    .then(val => {
      /* if reply for the first time, */
      if (type === 'public' || type === 'top') {
        res.send(val.data)
      } 
      else {
        let cat_name = `profile-${me}`
        /* get all the categories under wiselike category */
        axios.get(`categories`, Object.assign({
          params: {
            parent_category_id: process.env.wiselike_category_id,
          }
        }, config))
          .then(response => {
            let match = response.data.category_list.categories.find(category => category.name == cat_name)
            let cat_id = (match) ? match.id : 0
            let putformData1 = querystring.stringify({
                category_id: cat_id
            })
            /* move topic to my profile category */
            return axios.put(`/t/-/${topicid}`, putformData1, config)
          })
          .then(val => {
            res.send(val.data)
          })
          .catch(error => {
            console.log(`fail to move topic`)
            res.send(error)
          })
      }
    })
    .catch(error => {
      console.log(`fail to reply`)
      res.send(error)
    })
})

/* ****************** Create Profile *********************/
app.post('/users/:user/createprofile', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let config_me = JSON.parse(JSON.stringify(config)) // deep-copy
  config_me.headers['Api-Username'] = me
  let groupData = querystring.stringify({
    usernames: me
  })
  /* Add user to wiselike group */
  axios.put(`/groups/${process.env.wiselike_group_id}/members`, groupData, config)
    .catch(error => {
      console.log(`fail to add user to group`)
    })
  let profileformData = querystring.stringify({
      name: `profile-${me}`,
      color: `AB9364`,
      text_color: `FFFFFF`,
      parent_category_id: process.env.wiselike_category_id,
      'permissions[admins]': `1`,
      'permissions[everyone]': `3`
  })
  let inboxformData = querystring.stringify({
      name: `inbox-${me}`,
      color: `b3b5b4`,
      text_color: `FFFFFF`,
      parent_category_id: process.env.wiselike_category_id,
      'permissions[admins]': `1`,
      'permissions[everyone]': `3`
  })
  let postIds = []
  /* make a function for creating category */
  let createCategory = (formdata) => axios.post(`categories`, formdata, config)
  /* async way to create profile & inbox category */
  axios.all([createCategory(profileformData), createCategory(inboxformData)])
    .then(axios.spread((...rsp) => {
      /* Get the first topic of the category */
      return axios.all(rsp.map(val => axios.get(`${val.data.category.topic_url}`, config)))
    }))
    .then(axios.spread((...rsp) => {
      return axios.all(rsp.map(response => {
        let post_id = response.data.post_stream.posts[0].id
        postIds.push(post_id)
        let ChangeNameformData = querystring.stringify({
          username: me,
          'post_ids[]': post_id
        })
        /* Change the owner of the first(meta) topic in the category */
        return axios.post(`t/${response.data.post_stream.posts[0].topic_id}/change-owner`, ChangeNameformData, config)
      }))
    }))
    .then(axios.spread((...rsp) => {
      return axios.all(rsp.map(_ => {
        let post_id = postIds.pop()
        let introduction = querystring.stringify({
          'post[raw]': '建立一個完整的「簡介」可以讓更多人瞭解你，內容嘗試保持在 200 個字元內！'
        })
        /* edit the introduction of one's profile */
        return axios.put(`/posts/${post_id}`, introduction, config_me)
      }))
    }))
    .then(_ => res.send('created'))
    .catch(error => {
      console.log(`fail to create category`)
      res.send(error)
    })
})

/* ****************** Upload avatar *********************/
app.post('/users/:user/avatar', upload.single('avatar'), (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let config_me = JSON.parse(JSON.stringify(config)) // deep-copy
  config_me.headers['Api-Username'] = me
  let config_file = JSON.parse(JSON.stringify(config)) // deep-copy
  delete config_file.headers['Content-Type']
  let form = new FD()
  form.append('files[]', fs.createReadStream('./uploads/' + req.file.originalname))
  form.append('type', 'avatar')
  form.append('user_id', profile.external_id)
  form.append('synchronous', 'true') // FIXME: is this needed?
  Object.assign(config_file.headers, form.getHeaders())
  /* upload avatar */
  axios.post(`uploads`, form, config_file)
    .then((val) => {
      let pickform = querystring.stringify({
        type: 'uploaded',
        upload_id: val.data.id
      })
      /* update user's avatar */
      return axios.put(`/users/${me}/preferences/avatar/pick`, pickform, config)
    })
    .then((val) => {
      res.send(val.data)
      // delete local image
      fs.unlink('./uploads/' + req.file.originalname, (err) => {
        if (err) {
          console.log('failed to delete local image')
        }
      })
    })
    .catch(error => {
      console.log(`fail to update avatar`)
      res.send(error)
    })
})

/* ****************** Change User Introduction *********************/
app.post('/users/:user/introduction', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let config_me = JSON.parse(JSON.stringify(config)) // deep-copy
  config_me.headers['Api-Username'] = me
  let introduction = querystring.stringify({
      'post[raw]': req.body.raw
  })
  axios.put(`/posts/${req.body.id}`, introduction, config_me)
    .then((val) => {
      res.send(val.data)
    })
    .catch(error => {
      console.log(`fail to update introduction`)
      res.send(error)
    })
})

/* ****************** Set user Category tag *********************/
app.post('/users/:user/category', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let config_me = JSON.parse(JSON.stringify(config)) // deep-copy
  config_me.headers['Api-Username'] = me
  /* get the profile topic */
  axios.get(`t/${req.body.introductionID}`, config_me)
    .then(response => {
      let title = response.data.title
      let categoryid = response.data.category_id
      let tag = req.body.tag.split(',')
      let category = querystring.stringify({
        title: title,
        category_id: categoryid,
        'tags[]': tag,
        featuredLink: ''
      })
      /* update the profile topic */
      return axios.put(`/t/-/${req.body.introductionID}`, category, config)
    })
    .then((val) => {
      res.send(val.data)
    })
    .catch(error => {
      console.log(`fail to set tags`)
      res.send(error)
    })
})

/* ****************** Change user Background Image *********************/
app.post('/users/:user/background', upload.single('profile_background'), (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let config_me = JSON.parse(JSON.stringify(config)) // deep-copy
  config_me.headers['Api-Username'] = me
  let config_file = JSON.parse(JSON.stringify(config)) // deep-copy
  delete config_file.headers['Content-Type']
  let form = new FD()
  form.append('files[]', fs.createReadStream('./uploads/' + req.file.originalname))
  form.append('type', 'profile_background')
  form.append('user_id', profile.external_id)
  form.append('synchronous', 'true') // FIXME: is this needed?
  Object.assign(config_file.headers, form.getHeaders())
  /* upload background image */
  axios.post(`uploads`, form, config_file)
    .then((val) => {
      let pickform = querystring.stringify({
        profile_background_upload_url: val.data.url
      })
      /* update user's profile background image */
      return axios.put(`/users/${me}`, pickform, config)
    })
    .then(val => {
      res.send(val.data)
      // delete local image
      fs.unlink('./uploads/' + req.file.originalname, (err) => {
        if (err) {
          console.log('failed to delete local image')
        }
      })
    })
    .catch(error => {
      console.log(`fail to update profile background image`)
      res.send(error)
    })
})

/* ****************** Delete Question *********************/
app.post('/users/:user/delete', (req, res) => { // set user category
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  /* get the topic to be delete */
  axios.get(`t/${req.body.topid}`, config)
    .then(res => {
      /* get the parent category */
      return axios.get(`c/${res.data.category_id}`, config)
    })
    .then(res => {
    /* check if deleting topic is of mine */
      if (me != res.data.topic_list.topics[0].last_poster_username) { // FIXME: not sure last_poster_username is ok
        console.log(`reject to delete topics of others`)
        config = {}
      }
      /* delete the topic */
      return axios.delete(`/t/${req.body.topid}`, config)
    })
    .then((val) => {
      res.send(val.data)
    })
    .catch(error => {
      console.log(`fail to delete`)
      res.send(error)
    })
})

/* ****************** subscribe *********************/
app.post('/users/:user/subscribe', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let config_me = JSON.parse(JSON.stringify(config)) // deep-copy
  config_me.headers['Api-Username'] = me
  let categoryID = req.body.categoryID
  let subscribeStatus = req.body.subscribeStatus
  let notificationlevel = 0
  /* subscribe:false or unsubscribe:true */
  notificationlevel = (subscribeStatus === 'true') ? 1 : 3
  /* watching topic */
  let watchformData = querystring.stringify({
      notification_level: notificationlevel
  })
  axios.post(`category/${categoryID}/notifications`, watchformData, config_me)
    .then((val) => {
      val.data.success = categoryID
      res.send(val.data)
    })
    .catch(error => {
      console.log(`fail to toggle subscribe status`)
      res.send(error)
    })
})

/* ****************** RENAME *********************/
app.post('/users/:user/rename', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let profile = getLoginProfile(sso, sig)
  if (!profile) {
    return res.status(403).json({'errors': 'Please login'})
  }
  let me = profile.username
  let config_me = JSON.parse(JSON.stringify(config)) // deep-copy
  config_me.headers['Api-Username'] = me
  let ReNameData = querystring.stringify({
      name: req.body.name
  })
  axios.put(`/users/${me}`, ReNameData, config_me)
    .then((val) => {
      val.data.success = req.body.name
      res.send(val.data)
    })
    .catch(error => {
      console.log(`fail to rename`, error.toJSON())
      res.send(error)
    })
})
