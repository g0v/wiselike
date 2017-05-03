'use strict'

const express = require('express')
const path = require('path')

var app = express();

app.set('port', 8080); 
app.use(express.static(path.join(__dirname, 'dist')))

var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Listen on port ' + port);
});
