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
      watch     : ['proxy.js', 'config', '.env'],
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ]
};
