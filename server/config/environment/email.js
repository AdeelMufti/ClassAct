'use strict';

module.exports = {

  systemEmail: function() {
    if(process.env.EMAIL_MODE=='production')
      return 'system@email.com';
    else
      return 'system@staging.com';
  },

  smtp: function() {
    if(process.env.EMAIL_MODE=='production')
      return {
        hostname: 'production.smtp.com',
        port: 587,
        ssl: false,
        username: 'system@email.com',
        password: 'production'
      };
    else
      return {
        hostname: 'staging.smtp.com',
        port: 587,
        ssl: false,
        username: 'system@staging.com',
        password: 'staging'
      };
  },


};
