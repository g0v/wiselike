var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  proxyHost: '"http://localhost:9000"',
  webHost: '"http://localhost:8000"'
})
