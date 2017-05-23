'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const querystring = require('querystring')
const axios = require('axios')
const config = require('./config')
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
function verification (req) {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  if (me === undefined || req.params.user !== me) {
    return false
  }
  return true
}
function getUsername (sso, sig) {
  let profile = getProfile(sso, sig)
  return profile.username
}
const app = express()
app.use(bodyParser.json({limit: '1mb'}))
app.use(bodyParser.urlencoded({
  extended: true
}))
// app.use(bodyParser.urlencoded({
//   extended: false
// }))
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(cors())
// app.use(bodyParser.text())

// app.all('/*', function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
//   next()
// })

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
  // TODO get user profile.
  let sso = req.query.sso
  let sig = req.query.sig
  let username = getUsername(sso, sig)
  let data = JSON.stringify({'sso': sso, 'sig': sig, 'username': username})
  let webHost = config.runtime.webHost
  let body = `
Hello ${username}, you may close this window
<script>
window.opener.postMessage(${data}, "${webHost}"); // FIXME read from config
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

app.post('/users/:user/wisdoms', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  if (me === undefined) {
    res.status(403)
    return res.json({'error': 'Please login'})
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
  /* post question */
  axios.post(`${process.env.DISCOURSE_HOST}/posts`, formData)
  .then((val) => {
    let ChangeNameUrl = `${process.env.DISCOURSE_HOST}/t/` + val.data.topic_id + `/change-owner`
    let ChangeNameformData = querystring.stringify(
      {
        api_key: process.env.DISCOURSE_API_KEY,
        api_username: process.env.DISCOURSE_API_USERNAME,
        username: me,
        'post_ids[]': val.data.id
      }
    )
    /* change owner */
    axios.post(ChangeNameUrl, ChangeNameformData)
    .then((val) => {
      res.status(200).send(val.data)
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

app.post('/users/:user/wisdoms/topic', (req, res) => {
  let sso = req.query.sso
  let sig = req.query.sig
  let me = getUsername(sso, sig)
  if (me === undefined) {
    res.status(403)
    return res.json({'error': 'Please login'})
  }
  // console.log(req.body.raw)
  // res.send(req.body)
  res.send(req.body.raw)

  let topicid = req.query.topicid
  let type = req.query.type
  let posturl = `${process.env.DISCOURSE_HOST}/posts`
  let puturl = `${process.env.DISCOURSE_HOST}/t/inbox-` + me + `/` + topicid + `.json`
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
    /* change owner */
    axios.post(ChangeNameUrl, ChangeNameformData)
    .then((val) => {
      if (type === 'public') {
        res.status(200).send(val.data)
      } else {
        /* change category */
        axios.get(`${process.env.DISCOURSE_HOST}/c/wiselike/profile-${me}.json`)
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
    axios.post(Url, formdata)
    .then((val) => {
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
        axios.post(ChangeNameUrl, ChangeNameformData)
        .then((val) => {
          axios.put(introductionUrl, introduction)
          .then((val) => {
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
    })
    .catch(error => {
      res.status(433).send(error.response.data)
    })
  }
  return null
})

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

app.post('/users/:user/introduction', (req, res) => {
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (!verification(req)) {
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

app.post('/users/:user/category', (req, res) => { // set user category
  if (!verification(req)) {
    res.status(403)
    return res.json({'error': 'Please login'})
  }
  let Url = `${process.env.DISCOURSE_HOST}` + req.body.categoryUrl
  axios.get(Url + `.json`)
  .then(response => {
    let title = response.data.title
    let categoryid = response.data.category_id
    let category = querystring.stringify(
      {
        api_key: process.env.DISCOURSE_API_KEY,
        api_username: process.env.DISCOURSE_API_USERNAME,
        title: title,
        category_id: categoryid,
        'tags[]': req.body.tag,
        featuredLink: ''
      }
    )
    axios.put(Url, category)
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
