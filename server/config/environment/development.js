'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/classact-dev'
  },

  seedDB: true,

  developmentCatchAllToEmailAddress: 'developer@email.com',

  EMAIL_MODE: 'development'

};
