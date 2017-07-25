'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const querystring = require('querystring')
const axios = require('axios')
// const config = require('./config')
const Prequest = require('request-promise')
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
require('dotenv').config() // use dotenv (prevent messing up with vuejs env config)

// Discourse SSO
const DISCOURSE_SSO_SECRET = process.env.DISCOURSE_SSO_SECRET
const DISCOURSE_HOST = process.env.DISCOURSE_HOST || 'https://talk.pdis.nat.gov.tw'
const PROXY_PORT = process.env.PROXY_PORT || 9000

function getProfile (sso, sig) {
  let hmac = crypto.createHmac('sha256', DISCOURSE_SSO_SECRET)
  let decodedSso = decodeURIComponent(sso)
  let hash = hmac.update(decodedSso).digest('hex')

  if (sig !== hash) {
    console.error('Invalid auth')
    // FIXME send 403
    // res.status(403).send('Invalid auth')
  }

  let profile = querystring.parse(new Buffer(sso, 'base64').toString('utf8'))
  // TODO check that profile.nonce should match the nonce from the login step.
  console.log(profile)
  return profile
}
// function verification (req) {
//   let sso = req.query.sso
//   let sig = req.query.sig
//   let me = getUsername(sso, sig)
//   if (me === undefined || req.params.user !== me) {
//     return false
//   }
//   return true
// }
function getUsername (sso, sig) {
  let profile = getProfile(sso, sig)
  return profile.username
}
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(cors())

app.get('/login', (req, res) => {
  let returnUrl = `${req.protocol}://${req.get('host')}/sso_done`
  // source: https://github.com/edhemphill/passport-discourse/blob/master/lib/discourse-sso.js
  let hmac = crypto.createHmac('sha256', DISCOURSE_SSO_SECRET)
  crypto.randomBytes(16, (err, buf) => {
    if (err) throw err

    let nonce = buf.toString('hex')
    let payload = new Buffer(`nonce=${nonce}&return_sso_url=${returnUrl}`).toString('base64')
    let sig = hmac.update(payload).digest('hex')
    let urlRedirect = `${DISCOURSE_HOST}/session/sso_provider?sso=${encodeURIComponent(payload)}&sig=${sig}`
    res.redirect(urlRedirect)
  })
})

app.get('/sso_done', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let username = getUsername(sso, sig)
  let data = JSON.stringify({'sso': sso, 'sig': sig, 'username': username})
  // let webHost = config.runtime.webHost
  let webHost = process.env.webHost
  let body = `
Hello ${username}, you may close this window. It will be automatically closed in 3 seconds.
<script>
window.opener.postMessage(${data}, "${webHost}");
window.close();
</script>
`
  res.send(body)
})

app.get('/whoami', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let username = getUsername(sso, sig)
  res.json({'username': username})
})

app.get('/users', (req, res) => {
  axios.get(
    process.env.DISCOURSE_HOST + '/categories.json', {
      params: {
        parent_category_id: 21, // the "wiselike" category in discourse, FIXME
        api_key: process.env.DISCOURSE_API_KEY,
        api_username: process.env.DISCOURSE_API_USERNAME
      }
    })
    .then(response => {
      return res.json(response.data.category_list.categories)
    })
    .catch(error => {
      console.log(error)
      return res.status(error.response.status).json(error.response.data)
    })
})

app.get('/me', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let username = getUsername(sso, sig)
  if (!username) {
    return res.json({})
  }
  axios.get(`${process.env.DISCOURSE_HOST}/c/wiselike/profile-${username}.json`)
    .then(response => {
      return res.json(response.data.topic_list.topics[0]) // the first topic describes the user profile
    })
    .catch(error => {
      console.log(error)
      return res.status(error.response.status).json(error.response.data)
    })
  return null
})

app.get('/users/:user', (req, res) => {
  let username = req.params.user
  if (!username) {
    return res.json({})
  }
  axios.get(`${process.env.DISCOURSE_HOST}/c/wiselike/profile-${username}.json`)
    .then(response => {
      return res.json(response.data.topic_list.topics[0]) // the first topic describes the user profile
    })
    .catch(error => {
      console.log(error.response)
      return res.status(error.response.status).json(error.response.data)
    })
  return null
})

app.get('/users/:user/wisdoms', (req, res) => {
  axios.get(`${process.env.DISCOURSE_HOST}/c/wiselike/profile-${req.params.user}.json`)
    .then(response => {
      response.data.topic_list.topics.shift()
      return res.json(response.data.topic_list.topics)
    })
    .catch(error => {
      console.log(error.response)
      return res.status(error.response.status).json(error.response.data)
    })
})
/* ****************** subscribestatus *********************/
app.get('/users/:user/subscribestatus', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  // let username = req.params.user
  axios.get(
    process.env.DISCOURSE_HOST + '/u/' + me + '.json', {
      params: {
        api_key: process.env.DISCOURSE_SUPER_API_KEY,
        api_username: me
      }
    })
    .then(response => {
      res.status(200).send(response.data.user.watched_category_ids)
    })
    .catch(error => {
      console.log(error)
      return res.status(error.response.status).json(error.response.data)
    })
})

/* ******************Ask a question *********************/
app.post('/users/:user/wisdoms', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  let username = ''
  // if (sso === 'undefined' && sig === 'undefined') {
  //   me = 'wiselike'
  // } else {
  //   me = getUsername(sso, sig)
  // }
  if (req.body.anonymous === 'true') {
    username = 'wiselike'
  } else {
    username = me
  }
  let formData = querystring.stringify(
    {
      api_key: process.env.DISCOURSE_API_KEY,
      api_username: process.env.DISCOURSE_API_USERNAME,
      category: `inbox-${req.params.user}`,
      title: req.body.title,
      raw: req.body.raw
    }
  )
  console.log(username)
  /* post question */
  axios.post(`${process.env.DISCOURSE_HOST}/posts`, formData)
  .then((val) => {
    let ChangeNameUrl = `${process.env.DISCOURSE_HOST}/t/` + val.data.topic_id + `/change-owner`
    let ChangeNameformData = querystring.stringify(
      {
        api_key: process.env.DISCOURSE_API_KEY,
        api_username: process.env.DISCOURSE_API_USERNAME,
        username: username,
        'post_ids[]': val.data.id
      }
    )
    let topicID = val.data.topic_id
    /* change owner */
    axios.post(ChangeNameUrl, ChangeNameformData)
    .then((val) => {
      /* watching topic */
      let watchUrl = `${process.env.DISCOURSE_HOST}/t/` + topicID + '/notifications'
      let watchformData = querystring.stringify(
        {
          api_key: process.env.DISCOURSE_SUPER_API_KEY,
          api_username: me,
          notification_level: 3
        }
      )
      axios.post(watchUrl, watchformData)
      .then((val) => {
        console.log(topicID)
        val.data.success = topicID
        res.status(200).send(val.data)
      })
      .catch(error => {
        res.status(433).send(error.response.data)
      })
    })
    .catch(error => {
      res.status(433).send(error.response.data)
    })
  })
  .catch(error => {
    res.status(433).send(error.response.data)
  })
  return null
})

/* ****************** Reply *********************/
app.post('/users/:user/wisdoms/topic', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  let lowerMe = me.toLowerCase().replace(/_/g, '-')
  if (me === undefined) {
    res.status(403)
    return res.json({'error': 'Please login'})
  }
  res.send(req.body.raw)

  let topicid = req.query.topicid
  let type = req.query.type
  let posturl = `${process.env.DISCOURSE_HOST}/posts`
  let puturl = `${process.env.DISCOURSE_HOST}/t/inbox-` + lowerMe + `/` + topicid + `.json`
  let postformData = querystring.stringify(
    {
      api_key: process.env.DISCOURSE_API_KEY,
      api_username: process.env.DISCOURSE_API_USERNAME,
      category: `${req.params.user}`,
      topic_id: topicid,
      raw: req.body.raw
    }
  )
  axios.post(posturl, postformData)
  .then((val) => {
    let ChangeNameUrl = `${process.env.DISCOURSE_HOST}/t/` + topicid + `/change-owner`
    let ChangeNameformData = querystring.stringify(
      {
        api_key: process.env.DISCOURSE_API_KEY,
        api_username: process.env.DISCOURSE_API_USERNAME,
        username: me,
        'post_ids[]': val.data.id
      }
    )
    let topicID = topicid
    /* change owner */
    axios.post(ChangeNameUrl, ChangeNameformData)
    .then((val) => {
      let watchUrl = `${process.env.DISCOURSE_HOST}/t/` + topicID + '/notifications'
      let watchformData = querystring.stringify(
        {
          api_key: process.env.DISCOURSE_SUPER_API_KEY,
          api_username: me,
          notification_level: 3
        }
      )
      /* watching topic */
      axios.post(watchUrl, watchformData)
      .then((val) => {
        console.log(watchUrl)
      })
      .catch(error => {
        res.status(433).send(error.response.data)
      })

      /* if first reply need change to profile category */
      if (type === 'public' || type === 'top') {
        res.status(200).send(val.data)
      } else {
        /* change category */
        axios.get(`${process.env.DISCOURSE_HOST}/c/wiselike/profile-${lowerMe}.json`)
        .then(response => {
          let id = response.data.topic_list.topics[0].category_id
          console.log(id)
          let putformData1 = querystring.stringify(
            {
              api_key: process.env.DISCOURSE_API_KEY,
              api_username: process.env.DISCOURSE_API_USERNAME,
              category_id: id
            }
          )
          axios.put(puturl, putformData1)
          .then((val) => {
            res.status(200).send(val)
          })
          .catch(error => {
            res.status(433).send(error.response)
          })
        })
        .catch(error => {
          console.log(error)
          return res.status(error.response.status).json(error.response)
        })
      }
    })
    .catch(error => {
      res.status(433).send(error.response)
    })
  })
  .catch(error => {
    res.status(433).send(error.response)
  })

  return null
})

app.listen(PROXY_PORT, () => {
  console.log(`server started at localhost:${PROXY_PORT}`)
})

/* ****************** Create Profile *********************/
app.post('/users/:user/createprofile', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  if (me === undefined) {
    res.status(403)
    return res.json({'error': 'Please login'})
  }
  let Url = `${process.env.DISCOURSE_HOST}/categories`
  let profileformData = querystring.stringify(
    {
      api_key: process.env.DISCOURSE_API_KEY,
      api_username: process.env.DISCOURSE_API_USERNAME,
      name: `profile-${req.params.user}`,
      color: `AB9364`,
      text_color: `FFFFFF`,
      parent_category_id: `21`,
      'permissions[admins]': `1`,
      'permissions[everyone]': `3`
    }
  )
  let inboxformData = querystring.stringify(
    {
      api_key: process.env.DISCOURSE_API_KEY,
      api_username: process.env.DISCOURSE_API_USERNAME,
      name: `inbox-${req.params.user}`,
      color: `b3b5b4`,
      text_color: `FFFFFF`,
      parent_category_id: `21`,
      'permissions[admins]': `1`,
      'permissions[everyone]': `3`
    }
  )
  for (let i = 0; i < 2; i++) {
    let formdata = ''
    i === 0 ? (formdata = profileformData) : (formdata = inboxformData)
    /* create profile and inbox */
    axios.post(Url, formdata)
    .then((val) => {
      /* Get id from profile and inbox */
      axios.get(`${process.env.DISCOURSE_HOST}` + val.data.category.topic_url + `.json`)
      .then(response => {
        let id = response.data.post_stream.posts[0].id
        let ChangeNameUrl = `${process.env.DISCOURSE_HOST}/t/` + response.data.post_stream.posts[0].topic_id + `/change-owner`
        let introductionUrl = `${process.env.DISCOURSE_HOST}/posts/` + id
        let ChangeNameformData = querystring.stringify(
          {
            api_key: process.env.DISCOURSE_API_KEY,
            api_username: process.env.DISCOURSE_API_USERNAME,
            username: me,
            'post_ids[]': id
          }
        )
        let introduction = querystring.stringify(
          {
            api_key: process.env.DISCOURSE_API_KEY,
            api_username: process.env.DISCOURSE_API_USERNAME,
            'post[raw]': '建立一個完整的「簡介」可以讓更多人瞭解你，內容嘗試保持在 200 個字元內！'
          }
        )
        /* Change profile and inbox owner */
        axios.post(ChangeNameUrl, ChangeNameformData)
        .then((val) => {
          /* Change profile introduction '建立一個完整的「簡介」可以讓更多人瞭解你...' */
          axios.put(introductionUrl, introduction)
          .then((val) => {
            console.log(val.data.post.username)
            /* Add user to wiselike group once */
            if (i === 0) {
              let groupUrl = `${process.env.DISCOURSE_HOST}/groups/44/members.json`
              let group = {
                api_key: process.env.DISCOURSE_API_KEY,
                api_username: process.env.DISCOURSE_API_USERNAME,
                usernames: val.data.post.username
              }
              Prequest.put({
                url: groupUrl,
                formData: group
              })
              .then((val) => {
                res.status(200).send(val)
              })
              .catch(error => {
                res.status(433).send(error)
              })
            }
          })
          .catch(error => {
            res.status(433).send(error.response.data)
          })
        })
        .catch(error => {
          res.status(433).send(error.response.data)
        })
      })
      .catch(error => {
        res.status(433).send(error.response.data)
      })
    })
    .catch(error => {
      res.status(433).send(error.response.data)
    })
  }
  return null
})

/* ****************** Upload avatar *********************/
app.post('/users/:user/avatar', upload.single('avatar'), (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  if (me === undefined) {
    res.status(403)
    return res.json({'error': 'Please login'})
  }
  let profile = getProfile(req.query.sso, req.query.sig)
  let form = {
    api_key: process.env.DISCOURSE_API_KEY,
    api_username: process.env.DISCOURSE_API_USERNAME,
    type: 'avatar',
    user_id: profile.external_id,
    'files[]': fs.createReadStream('./uploads/' + req.file.originalname),
    synchronous: 'true'
  }
  Prequest.post({
    url: `${process.env.DISCOURSE_HOST}/uploads.json`,
    formData: form
  })
  .then(function (val) {
    val = JSON.parse(val)
    let id = val.id
    let pickform = {
      api_key: process.env.DISCOURSE_API_KEY,
      api_username: process.env.DISCOURSE_API_USERNAME,
      type: 'uploaded',
      upload_id: id
    }
    Prequest.put({
      url: `${process.env.DISCOURSE_HOST}/users/` + me + `/preferences/avatar/pick`,
      formData: pickform
    })
    .then(function (val) {
      res.status(200).send(val.data)
      // delete local image
      fs.unlink('./uploads/' + req.file.originalname, (err) => {
        if (err) {
          console.log('failed to delete local image')
        } else {
          console.log('successfully deleted local image')
        }
      })
    })
    .catch(error => {
      res.status(433).send(error)
    })
  })
  .catch(error => {
    res.status(433).send(error)
  })
  return null
})

/* ****************** Change User Introduction *********************/
app.post('/users/:user/introduction', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  if (me === undefined) {
    res.status(403)
    return res.json({'error': 'Please login'})
  }
  let Url = `${process.env.DISCOURSE_HOST}/posts/` + req.body.id
  let introduction = querystring.stringify(
    {
      api_key: process.env.DISCOURSE_API_KEY,
      api_username: process.env.DISCOURSE_API_USERNAME,
      'post[raw]': req.body.raw
    }
  )
  var config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  }
  axios.put(Url, introduction, config)
  .then((val) => {
    res.status(200).send(val.data)
  })
  .catch(error => {
    res.status(433).send(error)
  })
  return null
})

/* ****************** Set user Category tag *********************/
app.post('/users/:user/category', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  if (me === undefined) {
    res.status(403)
    return res.json({'error': 'Please login'})
  }
  // console.log(req.body.categoryUrl)
  let introUrl = `${process.env.DISCOURSE_HOST}` + '/t/profile-' + me + '/' + req.body.introductionID
  // let Url = `${process.env.DISCOURSE_HOST}` + req.body.categoryUrl
  axios.get(introUrl + `.json`)
  .then(response => {
    let title = response.data.title
    let categoryid = response.data.category_id
    let tag = req.body.tag.split(',')
    let category = querystring.stringify(
      {
        api_key: process.env.DISCOURSE_API_KEY,
        api_username: process.env.DISCOURSE_API_USERNAME,
        title: title,
        category_id: categoryid,
        'tags[]': tag,
        featuredLink: ''
      }
    )
    axios.put(introUrl, category)
    .then((val) => {
      res.status(200).send(val.data)
    })
    .catch(error => {
      res.status(433).send(error)
    })
  })
  .catch(error => {
    res.status(433).send(error)
  })
  return null
})

/* ****************** Change user Background Image *********************/
app.post('/users/:user/background', upload.single('profile_background'), (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  if (me === undefined) {
    res.status(403)
    return res.json({'error': 'Please login'})
  }
  let profile = getProfile(req.query.sso, req.query.sig)
  let form = {
    api_key: process.env.DISCOURSE_API_KEY,
    api_username: process.env.DISCOURSE_API_USERNAME,
    type: 'profile_background',
    user_id: profile.external_id,
    'files[]': fs.createReadStream('./uploads/' + req.file.originalname),
    synchronous: 'true'
  }
  Prequest.post({
    url: `${process.env.DISCOURSE_HOST}/uploads.json`,
    formData: form
  })
  .then(function (val) {
    val = JSON.parse(val)
    console.log(val)
    let pickform = {
      api_key: process.env.DISCOURSE_API_KEY,
      api_username: process.env.DISCOURSE_API_USERNAME,
      profile_background: val.url
    }
    Prequest.put({
      url: `${process.env.DISCOURSE_HOST}/users/` + me + `.json`,
      formData: pickform
    })
    .then(function (val) {
      res.send('success upload profile background')
      console.log('success upload profile background')
      fs.unlink('./uploads/' + req.file.originalname, (err) => {
        if (err) {
          console.log('failed to delete local image')
        } else {
          console.log('successfully deleted local image')
        }
      })
    })
    .catch(error => {
      res.status(433).send(error)
    })
  })
  .catch(error => {
    res.status(433).send(error)
  })
  return null
})

/* ****************** Delete Question *********************/
app.post('/users/:user/delete', (req, res) => { // set user category
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  if (me === undefined) {
    res.status(403)
    return res.json({'error': 'Please login'})
  }
  let Url = `${process.env.DISCOURSE_HOST}/t/` + req.body.topid
  let form = {
    api_key: process.env.DISCOURSE_API_KEY,
    api_username: process.env.DISCOURSE_API_USERNAME,
    context: '/t/topic/' + req.body.topid
  }
  Prequest.delete({
    url: Url,
    formData: form
  })
  .then((val) => {
    res.status(200).send(val.data)
  })
  .catch(error => {
    res.status(433).send(error)
  })
  return null
})

/* ****************** subscribe *********************/
app.post('/users/:user/subscribe', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  let categoryID = req.body.categoryID
  let subscribeStatus = req.body.subscribeStatus
  let notificationlevel = ''
  /* subscribe:false or unsubscribe:true */
  // subscribeStatus ? (notificationlevel = 1) : (notificationlevel = 3)
  if (subscribeStatus === 'true') {
    notificationlevel = 1
  } else {
    notificationlevel = 3
  }
  /* watching topic */
  let watchUrl = `${process.env.DISCOURSE_HOST}/category/` + categoryID + '/notifications'
  let watchformData = querystring.stringify(
    {
      api_key: process.env.DISCOURSE_SUPER_API_KEY,
      api_username: me,
      notification_level: notificationlevel
    }
  )
  axios.post(watchUrl, watchformData)
  .then((val) => {
    console.log(watchformData)
    val.data.success = categoryID
    res.status(200).send(val.data)
  })
  .catch(error => {
    res.status(433).send(error.response.data)
  })
  return null
})

/* ****************** RENAME *********************/
app.post('/users/:user/rename', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  let ReNameUrl = `${process.env.DISCOURSE_HOST}/u/` + me + '.json'
  let ReNameData = querystring.stringify(
    {
      api_key: process.env.DISCOURSE_SUPER_API_KEY,
      api_username: process.env.DISCOURSE_API_USERNAME,
      name: req.body.name
    }
  )
  axios.put(ReNameUrl, ReNameData)
  .then((val) => {
    val.data.success = req.body.name
    res.status(200).send(val.data)
  })
  .catch(error => {
    res.status(433).send(error.response.data)
  })
  return null
})
