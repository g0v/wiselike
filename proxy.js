'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
// const url = require('url')
const querystring = require('querystring')
// const request = require('request')
const axios = require('axios')
const config = require('./config')
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

function getUsername (sso, sig) {
  let profile = getProfile(sso, sig)
  return profile.username
}

const app = express()

app.use(bodyParser.json())
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

/**
 * Ask a question on someone's profile.
 *
 * Request Body: (application/json)
 * {
 *   "title": "{QUESTION_TITLE}",
 *   "raw": "{QUESTION_BODY}"
 * }
 */
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
      category: `profile-${req.params.user}`,
      title: req.body.title,
      raw: req.body.raw
    }
  )
  formData += '&tags[]=尚未回覆'
  axios.post(`${process.env.DISCOURSE_HOST}/posts`, formData)
    .then(response => {
      return res.json(response.data)
    })
    .catch(error => {
      console.log(error.response)
      return res.status(error.response.status).json(error.response.data)
    })

  // TODO This is the most tricky part, the topic was now posted by the API_KEY user. We should either:
  //       a. Change the owner to "me" by PUT /t/-{topic_id}.json API
  //        or
  //       b. Use the POST /admin/users/{uid}/generate_api_key API to gen a API key for "me", and use that key to post the topic instead.
  return null
})

app.listen(PROXY_PORT, () => {
  console.log(`server started at localhost:${PROXY_PORT}`)
})
