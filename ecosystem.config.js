module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'PROXY',
      script    : 'proxy.js',
      watch     : [],
      env_production : {
        NODE_ENV: 'production'
      }
    },

    // Second application
    {
      name      : 'WEB',
      script    : 'web.js',
      watch     : ["dist"],
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ]
};
