"use strict";

const express = require('express');
const crypto = require('crypto');

// Discourse SSO
const DISCOURSE_SSO_SECRET = process.env.DISCOURSE_SSO_SECRET;
const DISCOURSE_HOST = process.env.DISCOURSE_HOST; // https://talk.pdis.nat.gov.tw

const app = express();

app.get('/login', (req, res) => {
  var current_host = req.protocol + '://' + req.get('host');

  // source: https://github.com/edhemphill/passport-discourse/blob/master/lib/discourse-sso.js
  var ret = {};
  var hmac = crypto.createHmac('sha256', DISCOURSE_SSO_SECRET);

  crypto.randomBytes(16, (err, buf) => {
    if (err) throw err;

    ret._created_at = new Date();
    ret.nonce = buf.toString('hex');
    var payload = "nonce=" + ret.nonce + "&return_sso_url=" + current_host + '/sso_done';
    var payload_b64 = new Buffer(payload).toString('base64');
    hmac.update(payload_b64);
    ret.hex_sig = hmac.digest('hex');
    ret.urlenc_payload_b64 = encodeURIComponent(payload_b64);
    ret.url_redirect = DISCOURSE_HOST +"/session/sso_provider?sso=" + ret.urlenc_payload_b64 + "&sig=" + ret.hex_sig;

    res.redirect(ret.url_redirect);
  });
});

app.get('/sso_done', (req, res) => {
  console.log(req);
  // TODO get user profile.
  res.send('discourse sso done');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server started at localhost:${port}`);
});
