'use strict';

var translations = require('../config/translations');

exports.validateEmail = function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

exports.getIpAddressFromReq = function(req)
{
  var ipAddress;
  if(req.headers['forwarded'])
  {
    if(req.headers['forwarded'].indexOf('=')>-1) //Sometimes in openshift request headers contain: forwarded: 'for=x.x.x.x', where x.x.x.x is the correct IP
      ipAddress = req.headers['forwarded'].split('=')[1];
    else
      ipAddress = req.headers['forwarded'];
  }
  else if(req.headers['x-forwarded-for']) {
    if(req.headers['x-forwarded-for'].indexOf(',')>-1) //Sometimes in openshift request headers contain: 'x-forwarded-for': 'x.x.x.x, y.y.y.y', where the first IP is the correct IP
      ipAddress = req.headers['x-forwarded-for'].replace(new RegExp(' ', 'g'), '').split(',')[0];
    else
      ipAddress = req.headers['x-forwarded-for'];
  }
  else if(req.headers['x-client-ip'])
    ipAddress = req.headers['x-client-ip'];
  else
    ipAddress = req.connection.remoteAddress;
  return ipAddress;
}


function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message;
  this.stack = (new Error()).stack;
}
ValidationError.prototype = Object.create(ValidationError.prototype);
ValidationError.prototype.constructor = ValidationError;
exports.ValidationError = ValidationError;

exports.translateValidationErrors = function(err, language) {
  if(err.hasOwnProperty('translationKey') && translations.has(language,err['translationKey']))
    err['message'] = translations.get(language, err['translationKey']);
  else if (err.hasOwnProperty('message') && translations.has(language,err['message'])) {
    err['translationKey'] = err['message'];
    err['message'] = translations.get(language, err['message']);
  }

  if (err.hasOwnProperty('errors')) {
    var errors = err.errors;
    for (var key in errors) {
      var val = errors[key];
      if(val.hasOwnProperty('translationKey') && translations.has(language,val['translationKey']))
        val['message'] = translations.get(language, val['translationKey']);
      if (val.hasOwnProperty('message') && translations.has(language,val['message'])) {
        val['translationKey'] = val['message'];
        val['message'] = translations.get(language, val['message']);
      }
      //if(val.stack) delete val.stack;
    }
  }

  //if(err.stack) delete err.stack;

  return err;
};
