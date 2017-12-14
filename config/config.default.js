'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1512992613542_3744';

  config.view = {
    mapping: {
      '.nj': 'nunjucks',
    },
    defaultExtension: '.nj',
    defaultViewEngine: 'nunjucks'
  }

  config.settings = {
    postNum:10,
    name:'博客',
    site_url:'http://localhost:7001',
    keywords:'',
    description:'',
    auth_cookie_name: 'ad_cookie',
    session_secret:'ssss'
  };

  config.mysql = {
    // database configuration
    client: {
      // host
      host: 'localhost',
      // port
      port: '3306',
      // username
      user: 'root',
      // password
      password: '',
      // database
      database: 'nemblog',    
    },
    // load into app, default is open
    app: true,
    // load into agent, default is close
    agent: false,
  };

  // add your config here
  config.middleware = [];

  return config;
};
