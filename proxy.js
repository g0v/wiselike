"use strict";

const express = require('express');
const crypto = require('crypto');
const url = require('url');
const querystring = require('querystring');
const cookieSession = require('cookie-session');
const request = require('request');
require('dotenv').config(); // use dotenv (prevent messing up with vuejs env config)

// Discourse SSO
const DISCOURSE_SSO_SECRET = process.env.DISCOURSE_SSO_SECRET;
const DISCOURSE_HOST = process.env.DISCOURSE_HOST || "https://talk.pdis.nat.gov.tw";
const COOKIE_KEY = process.env.COOKIE_KEY || "dev";
const COOKIE_KEY2 = process.env.COOKIE_KEY || process.env.DISCOURSE_SSO_SECRET; // in case key rotation
const PROXY_PORT = process.env.PROXY_PORT || 9000;


const app = express();

app.use(cookieSession({
  name: 'session',
  keys: [COOKIE_KEY, COOKIE_KEY2],
  // Cookie Options
  maxAge: 1 * 60 * 60 * 1000 // 1 hours (for dev), TODO change to 24 hours later
}));


app.use(function (req, res, next) {
  // expand cookie expire time every minute
  req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
  next();
});

app.get('/login', (req, res) => {
  let returnUrl = `${req.protocol}://${req.get('host')}/sso_done`;

  // source: https://github.com/edhemphill/passport-discourse/blob/master/lib/discourse-sso.js
  let hmac = crypto.createHmac('sha256', DISCOURSE_SSO_SECRET);

  crypto.randomBytes(16, (err, buf) => {
    if (err) throw err;

    let nonce = buf.toString('hex');
    let payload = new Buffer(`nonce=${nonce}&return_sso_url=${returnUrl}`).toString('base64');
    let sig = hmac.update(payload).digest('hex');
    let urlRedirect = `${DISCOURSE_HOST}/session/sso_provider?sso=${encodeURIComponent(payload)}&sig=${sig}`;

    res.redirect(urlRedirect);
  });
});

app.get('/sso_done', (req, res) => {
  // TODO get user profile.
  let sso = req.query.sso;
  let sig = req.query.sig;

  let hmac = crypto.createHmac('sha256', DISCOURSE_SSO_SECRET);
  let decodedSso = decodeURIComponent(sso);
  let hash = hmac.update(decodedSso).digest('hex');

  if (sig != hash) {
    console.error('Invalid auth');
    res.status(403).send('Invalid auth');
  }

  let profile = querystring.parse(new Buffer(sso, 'base64').toString('utf8'));

  // TODO check that profile.nonce should match the nonce from the login step.
  console.log(profile);

  req.session.username = profile.username;
  res.end('Hello ' + profile.username + ', cookie-session saved! Check it at /whoami');
});

app.get('/whoami', (req, res) => {
  let username = req.session.username;
  res.end('You are ' + username);
});


app.get('/users', (req, res) => {
  request({
    uri: process.env.DISCOURSE_HOST + '/categories.json',
    qs: {
      parent_category_id: 21, // the "wiselike" category in discourse, FIXME
      api_key: process.env.DISCOURSE_API_KEY,
      api_username: process.env.DISCOURSE_API_USERNAME
    }
  }, (error, response, body) => {
    var data = JSON.parse(body);
    res.json(data.category_list.categories);
  });
});


app.get('/users/:user/wisdoms', (req, res) => {
  request({
    uri: `${process.env.DISCOURSE_HOST}/c/wiselike/profile-${req.params.user}.json`
  }, (error, response, body) => {
    var data = JSON.parse(body);
    res.json(data.topic_list.topics);
  });
});


app.listen(PROXY_PORT, () => {
  console.log(`server started at localhost:${PROXY_PORT}`);
});
