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
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      watch     : true,
      ignore_watch: [".git", "upload.?", "node_modules"],
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ]
};
