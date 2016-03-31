'use strict';

var _ = require('lodash');
var User = require('./user.model').model;
var userFieldAccessByUserRole = require('./user.model').fieldAccessByUserRole;
var Classified = require('../classified/classified.model').model;
var passport = require('passport');
var config = require('../../config/environment');
var CONSTANTS = require("../../config/constants");
var translations = require('../../config/translations');
var jwt = require('jsonwebtoken');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var sprintf = require("sprintf-js").sprintf;
var misc = require("../../components/misc");
var auth = require('../../auth/auth.service');
var classifiedSocket = require('../classified/classified.socket');
var userSocket = require('./user.socket');

var ValidationError = misc.ValidationError;
var translateValidationErrors = misc.translateValidationErrors;

 /**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : 'en');
  var currentUser = req.user;

  var query = User.find({});
  applyStandardFiltersToUserQuery(query,currentUser);
  query
    .exec(function (err, users) {
      if(err) return res.status(500).send(translateValidationErrors(err,language));
      res.status(200).json(users);
    });
};

var sendVerificationEmail = function (user,req)
{
  //var child_process = require('child_process');
  //var exec = child_process.exec;
  //exec('node '+__dirname+'/verification-email-sender '+user._id, function(error, stdout, stderr) {
  //  console.log('stdout: ' + stdout);
  //  console.log('stderr: ' + stderr);
  //  if (error !== null) {
  //    console.log('exec error: ' + error);
  //  }
  //});

  if(!config.smtp())
    return;

  async.waterfall([
    function(callback) {
      crypto.randomBytes(20, function(err, buf) {
        if(err) { callback(err); return; }
        var token = buf.toString('hex');
        callback(null, token);
      });
    },
    function(token, callback) {
      user.tokens = user.tokens.filter(function(token){ return token.key != 'verificationToken'; });
      user.tokens.push({key: "verificationToken", value: token});
      User.update({ _id: user.id }, {tokens: user.tokens}, { multi: false }, function (err, raw) { //Using User.update, because it's a convenient way to avoid post save middleware, since this update doesn't need to emit a user:save
        if (err) { callback(err); return; }
        callback(null, token);
      });
    },
    function(token, callback) {
      var smtp = config.smtp();
      var smtpTransport = nodemailer.createTransport({
        host: smtp.hostname,
        port: smtp.port,
        secure: smtp.ssl,
        auth: {
          user: smtp.username,
          pass: smtp.password
        }
      });
      var mailOptions = {
        to: config.developmentCatchAllToEmailAddress ? config.developmentCatchAllToEmailAddress : user.email,
        from: CONSTANTS.WEBSITE_NAME+' <'+config.systemEmail()+'>',
        subject: translations.get(user.language,'VERIFICATION_EMAIL_SUBJECT'),
        text: sprintf(translations.get(user.language,'VERIFICATION_EMAIL_TEXT'),'http://' + req.headers.host + '/verify/' +user._id+'/'+ token)
      };

      var apiMethod = function(callback) {
        smtpTransport.sendMail(mailOptions, function(err) {
          if(err) { console.error("Mail send didn't work, retrying..."); return callback(err); }
          else
            callback(null);
        });
      }
      async.retry({times: 5, interval: 5000}, apiMethod, function(err) {
        callback(err);
      });

    }
  ], function(err) {
    if(err) {
      console.error('There was an error generating and sending verification email to user ID '+user._id+' ('+user.email+')'+': '+err);
    }
  });

};

exports.generateVerificationEmail = function(req, res, next) {
  var user = req.user;
  sendVerificationEmail(user,req);
  res.status(200).send('OK');
}


var createUser = function(req, params, callback)
{
  var newUser = new User(params);
  newUser.save(function(err, user) {
    if (err) { return callback(err,null); }
    Classified
      .find({ email: user.email })
      .select('_id')
      .exec(function (err, classifieds) {
        if (err) { return callback(err,null); }
        var classifiedIds = [];
        for(var i=0; i<classifieds.length; i++)
          classifiedIds.push(classifieds[i]._id);
        Classified.update({'_id': {$in: classifiedIds}}, {user: user, email: null}, { multi: true }, function (err, raw) {
          if (err) { return callback(err,null); }
          classifiedSocket.multiplePartialUpdate(req.app.get('socketio').sockets.sockets,classifiedIds,['user','email']);
          callback(err,user);
        });
      });
  });
}
exports.createUser = createUser;

var createFromExistingUser = function(req, userId, params, callback)
{
  User.findById(userId, function(err, user) {
    if (err) { return callback(err,null); }
    for(var key in params)
      user[key] = params[key];
    user.save(function(err, user) {
      Classified
        .find({ email: user.email })
        .select('_id')
        .exec(function (err, classifieds) {
          if (err) { return callback(err,null); }
          var classifiedIds = [];
          for(var i=0; i<classifieds.length; i++)
            classifiedIds.push(classifieds[i]._id);
          Classified.update({'_id': {$in: classifiedIds}}, {user: user, email: null}, { multi: true }, function (err, raw) {
            if (err) { return callback(err,null); }
            classifiedSocket.multiplePartialUpdate(req.app.get('socketio').sockets.sockets,classifiedIds,['user','email']);
            callback(err,user);
          });
        });
    });
  });
}
exports.createFromExistingUser = createFromExistingUser;


var applyStandardFiltersToUserQuery = function(query, user) {
  var accessibleFields;
  if(user)
    accessibleFields = userFieldAccessByUserRole[user.role];
  else
    accessibleFields = userFieldAccessByUserRole['default'];

  var excludeSelection = '';
  if(_.indexOf(accessibleFields, 'all')==-1)
    for(var key in User.schema.paths) {
      if (key != '_id' && _.indexOf(accessibleFields, key) == -1)
        excludeSelection += '-' + key + ' ';
    }

  query.select(excludeSelection);
}
exports.applyStandardFiltersToUserQuery = applyStandardFiltersToUserQuery;

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {

  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (req&&req.body&&req.body.language?req.body.language:'en'));

  async.waterfall([
    function(callback) {
      if(!req.body.email || !misc.validateEmail(req.body.email))
        callback(new ValidationError('EMAIL_REQUIRED'));
      else if(req.body.email.length>200)
        callback(new ValidationError('EMAIL_TOO_LONG'));
      else if(req.body.password && !req.body.name)
        callback(new ValidationError('NAME_REQUIRED'));
      else if(req.body.password && req.body.name.length>30)
        callback(new ValidationError('NAME_TOO_LONG'));
      else if(req.body.password && req.body.password.length<3)
        callback(new ValidationError('PASSWORD_MIN_LENGTH'));
      else if(req.body.password && req.body.password.length>50)
        callback(new ValidationError('PASSWORD_MAX_LENGTH'));
      else
        setTimeout(function () {
          callback(null);
        }, 1000);
    },
    function(callback) {
      var query  = User.where({ email: req.body.email, role: 'email' });
      query.findOne(function (err, user) {
        if(err) { callback(err, null); return; }
        callback(null, user);
      });
    },
    function(user, callback) {
      if (user && req.body.password) { //is conversion
        user.role='user';
        user.name=req.body.name;
        user.password=req.body.password;
        user.verified=false;
        user.save(function(err) {
          if (err) { callback(err,null); return; }
          sendVerificationEmail(user,req);
          callback(null,user);
        });
      }
      else  //regular signup or register, user never existed before
      {
        if(!req.body.language) req.body.language = language;
        if(req.body.password == null || req.body.password=='')
        {
          req.body.password=Math.random().toString();
          req.body.role='email';
        }
        var params = req.body;
        params.provider = 'local';
        params.createdIpAddress = misc.getIpAddressFromReq(req);
        createUser(req,params,function(err,_user) {
          if(err) callback(err,null);
          else {
            sendVerificationEmail(_user,req);
            callback(null,_user);
          }
        });
      }
    }
  ], function (err,user) {
    if (err) return res.status(422).json(translateValidationErrors(err,language));
    var token = jwt.sign({_id: user._id }, config.secrets.session/*, { expiresInMinutes: 60*5 }*/);
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : 'en');
  var currentUser = req.user;

  if(currentUser.role!='admin' && String(currentUser._id)!=String(userId))
    return res.status(401).send({message: translations.get(language,'UNAUTHORIZED'), translationKey: 'UNAUTHORIZED'});

  var query = User.findById(userId);
  applyStandardFiltersToUserQuery(query,currentUser);
  query
    .exec(function (err, user) {
      if (err) return next(translateValidationErrors(err,language));
      if (!user) return res.status(401).send({message: translations.get(language,'NOT_FOUND'), translationKey: 'NOT_FOUND'});
      res.json(user);
    });
};

/**
 * Removes a user
 * restriction: 'admin'
 */
exports.remove = function(req, res) {
  var user = req.user;
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (user&&user.language?user.language:'en'));
  removeUser(req,req.params.id,function(err,user) {
    if(err) return res.status(500).send(translateValidationErrors(err,language));
    return res.status(204).send('OK');
  });
};

var removeUser = function(req, userId, callback)
{
  User.findById(userId, function(err, user) {
    if(err) return callback(err,user);
    if(!user) return callback(new ValidationError('NOT_FOUND'),user);
    if(user.permanent == true)
      return callback(new ValidationError('PERMANENT_ACCOUNT_MODIFY_ERROR'),user);
    user.remove(function(err) {
      if(err) return callback(err,user);

      Classified
        .find({ user: user._id })
        .select('_id')
        .exec(function (err, classifieds) {
          if (err) { return callback(err,null); }
          var classifiedIds = [];
          for(var i=0; i<classifieds.length; i++)
            classifiedIds.push(classifieds[i]._id);
          Classified.update({'_id': {$in: classifiedIds}}, {user: null, email: user.email}, { multi: true }, function (err, raw) {
            if (err) { return callback(err,null); }
            classifiedSocket.multiplePartialUpdate(req.app.get('socketio').sockets.sockets,classifiedIds,['user','email']);
            callback(err,user);
          });
        });
    });
  });
}

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var user = req.user;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (user&&user.language?user.language:'en'));

  User.findById(user._id, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      var userId = user._id;
      var userPOJO = user.toObject();
      for(var key in userPOJO)
        if(!userPOJO.hasOwnProperty(key) || key=='_id')
          delete userPOJO[key];
      User.update({ _id: userId }, userPOJO, { multi: false }, function (err, raw) { //Using User.update, because it's a convenient way to avoid post save middleware, since this update doesn't need to emit a user:save
        if (err) return res.status(422).json(translateValidationErrors(err,language));
        res.status(200).send('OK');
      });
    } else {
      return res.status(422).send({message: translations.get(language,'INVALID_PASSWORD'), translationKey: 'INVALID_PASSWORD'});
    }
  });
};

exports.getAll = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';
  var startTime = req.params.startTime ? req.params.startTime : null;
  var window = req.params.window ? req.params.window : 50;

  var user = req.user;
  var query = User.find({});
  applyStandardFiltersToUserQuery(query,user);
  query.sort('-created -_id');
  if(window && window!=0)
    query.limit(window);
  if(startTime) {
    query.where({created: {$lt: new Date().setTime(startTime)}});
  }
  query
    .exec(function (err, users) {
      if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
      return res.status(200).json(users);
    });
}

exports.update = function(req, res, next) {
  var currentUser = req.user;
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (currentUser&&currentUser.language?currentUser.language:'en'));
  var userId = req.params.id;

  async.waterfall([
    function(callback) {
      if(currentUser.role!='admin' && String(currentUser._id)!=String(userId))
        return callback({httpCode: 401, message: translations.get(language,'UNAUTHORIZED'), translationKey: 'UNAUTHORIZED'});
      else if(req.body.permanent)
        return callback({httpCode: 403, translationKey: 'PERMANENT_SETTING_MODIFY_ERROR'});
      else
        User.findById(userId)
          .exec(function (err, user) {
            if(!user)
              return callback({httpCode: 403, translationKey: 'NOT_FOUND'});
            else if(user.permanent && (req.body.hasOwnProperty('role') || req.body.hasOwnProperty('verified') || req.body.hasOwnProperty('approved')))
              return callback({httpCode: 403, translationKey: 'PERMANENT_ACCOUNT_MODIFY_ERROR'});
            else
              return callback(null, user);
          });
    },
    function(user, callback) {
      for(var key in req.body)
      {
        user[key] = req.body[key];
        user.markModified(key);
      }
      user.save(function (err,user) {
        callback(err);
      });
    },
    function(callback) {
      var query = User.findById(userId);
      applyStandardFiltersToUserQuery(query,currentUser);
      query
        .exec(function (err, user) {
          callback(err,user);
        });
    }
  ], function(err,user) {
    if(err) {
      var httpCode = 500;
      if(err.httpCode) {
        httpCode = err.httpCode;
        delete err.httpCode
      }
      return res.status(httpCode).send(translateValidationErrors(err, language));
    }
    else
      return res.status(200).json(user);
  });

};

exports.verify = function(req, res, next) {
  var userId = req.params.id;
  var verificationToken = String(req.body.verificationToken)

  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : 'en');

  if(!verificationToken)
    return res.status(422).send({message: translations.get(language,'VERIFICATION_TOKEN_REQUIRED'), translationKey: 'VERIFICATION_TOKEN_REQUIRED'});

  var query  = User.where({ _id: userId, 'tokens.key': 'verificationToken', 'tokens.value': verificationToken });
  query.findOne(function (err, user)
  {
    if(err) return res.status(500).send(translateValidationErrors(err,language));
    if(!user) return res.status(403).send({message: translations.get(language,'UNAUTHORIZED'), translationKey: 'UNAUTHORIZED'});

    user.tokens = user.tokens.filter(function(token){ return token.key != 'verificationToken'; });
    user.verified = true;
    user.approved = (CONSTANTS.AUTO_APPROVE_VERIFIED_USER?true:false);
    user.save(function(err) {
      if (err) return res.status(422).json(translateValidationErrors(err,language));
      res.status(200).send('OK');
    });
  });
};

exports.misc = function(req, res, next) {
  var action = req.params.action;
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : 'en');

  if(action == 'generateResetPasswordToken')
  {
    var email=req.body.email;
    if(!email)
      return res.status(422).send({message: translations.get(language,'EMAIL_REQUIRED'), translationKey: 'EMAIL_REQUIRED'});

    var sendResetPasswordEmail = function (user) {
      if(!config.smtp())
        return;

      async.waterfall([
        function(callback) {
          crypto.randomBytes(20, function(err, buf) {
            if(err) { callback(err); return; }
            var token = buf.toString('hex');
            callback(null, token);
          });
        },
        function(token, callback) {
          user.tokens = user.tokens.filter(function(token){ return token.key != 'resetPasswordToken'; });
          user.tokens.push({key: "resetPasswordToken", value: token});
          User.update({ _id: user.id }, {tokens: user.tokens}, { multi: false }, function (err, raw) { //Using User.update, because it's a convenient way to avoid post save middleware, since this update doesn't need to emit a user:save
            if (err) { callback(err); return; }
            callback(null, token);
          });
        },
        function(token, callback) {
          var smtp = config.smtp();
          var smtpTransport = nodemailer.createTransport({
            host: smtp.hostname,
            port: smtp.port,
            secure: smtp.ssl,
            auth: {
              user: smtp.username,
              pass: smtp.password
            }
          });
          var mailOptions = {
            to: config.developmentCatchAllToEmailAddress ? config.developmentCatchAllToEmailAddress : user.email,
            from: CONSTANTS.WEBSITE_NAME+' <'+config.systemEmail()+'>',
            subject: translations.get(user.language,'RESET_PASSWORD_EMAIL_SUBJECT'),
            text: sprintf(translations.get(user.language,'RESET_PASSWORD_EMAIL_TEXT'),'http://' + req.headers.host + '/reset-password/' +user._id+'/'+ token)
          };

          var apiMethod = function(callback) {
            smtpTransport.sendMail(mailOptions, function(err) {
              if(err) { console.error("Mail send didn't work, retrying..."); return callback(err); }
              else
                callback(null);
            });
          }
          async.retry({times: 5, interval: 5000}, apiMethod, function(err) {
            callback(err);
          });

        },
      ], function(err, token) {
        if(err) {
          console.error('There was an error generating reset password token and email to user ID '+user._id+' ('+user.email+')'+': '+err);
        }
      });

    };

    var query  = User.where({ email: email });
    query.findOne(function (err, user) {
      if(err) return res.status(500).send(translateValidationErrors(err,language));
      if(!user) return res.status(403).send({translationKey: 'EMAIL_NOT_FOUND'});
      if(user.provider != 'local')
        return res.status(403).send({translationKey: 'USER_IS_NOT_LOCAL'});
      if(user.role=='email')
        return res.status(403).send({translationKey: 'EMAIL_ONLY_USER'});
      sendResetPasswordEmail(user);

      res.status(200).send('OK');
    });
  }

  else if(action == 'resetPassword')
  {
    var userId=req.body.userId;
    var resetPasswordToken=req.body.resetPasswordToken ? String(req.body.resetPasswordToken) : "";
    var newPassword=req.body.newPassword ? String(req.body.newPassword) : "";

    if(!userId || !resetPasswordToken || !newPassword || newPassword.length<3 || newPassword.length>50)
      return res.status(422).send({message: translations.get(language,'MISSING_OR_INVALID_DATA'), translationKey: 'MISSING_OR_INVALID_DATA'});

    var query  = User.where({ _id: userId, 'tokens.key': 'resetPasswordToken', 'tokens.value': resetPasswordToken });
    query.findOne(function (err, user)
    {
      if(err) return res.status(500).send(translateValidationErrors(err,language));
      if(!user) return res.status(403).send({translationKey: 'INVALID_OR_EXPIRED_TOKEN'});

      user.tokens = user.tokens.filter(function(token){ return token.key != 'resetPasswordToken'; });
      user.password = newPassword;
      var userId = user._id;
      var userPOJO = user.toObject();
      for(var key in userPOJO)
        if(!userPOJO.hasOwnProperty(key) || key=='_id')
          delete userPOJO[key];
      User.update({ _id: userId }, userPOJO, { multi: false }, function (err, raw) { //Using User.update, because it's a convenient way to avoid post save middleware, since this update doesn't need to emit a user:save
        if (err) return res.status(422).json(translateValidationErrors(err,language));
        res.status(200).send('OK');
      });
    });
  }

  else if(action == 'generateDeregisterToken')
  {
    var email=req.body.email;
    if(!email)
      return res.status(422).send({message:translations.get(language,'EMAIL_REQUIRED'), translationKey: 'EMAIL_REQUIRED'});

    var sendDeregisterEmail = function (user) {
      if(!config.smtp())
        return;

      async.waterfall([
        function(callback) {
          crypto.randomBytes(20, function(err, buf) {
            if(err) { callback(err); return; }
            var token = buf.toString('hex');
            callback(null, token);
          });
        },
        function(token, callback) {
          user.tokens = user.tokens.filter(function(token){ return token.key != 'deregisterToken'; });
          user.tokens.push({key: "deregisterToken", value: token});
          User.update({ _id: user.id }, {tokens: user.tokens}, { multi: false }, function (err, raw) { //Using User.update, because it's a convenient way to avoid post save middleware, since this update doesn't need to emit a user:save
            if (err) { callback(err); return; }
            callback(null, token);
          });
        },
        function(token, callback) {
          var smtp = config.smtp();
          var smtpTransport = nodemailer.createTransport({
            host: smtp.hostname,
            port: smtp.port,
            secure: smtp.ssl,
            auth: {
              user: smtp.username,
              pass: smtp.password
            }
          });
          var mailOptions = {
            to: config.developmentCatchAllToEmailAddress ? config.developmentCatchAllToEmailAddress : user.email,
            from: CONSTANTS.WEBSITE_NAME+' <'+config.systemEmail()+'>',
            subject: translations.get(user.language,'DEREGISTER_EMAIL_SUBJECT'),
            text: sprintf(translations.get(user.language,'DEREGISTER_EMAIL_TEXT'),'http://' + req.headers.host + '/deregister/' +user._id+'/'+ token)
          };

          var apiMethod = function(callback) {
            smtpTransport.sendMail(mailOptions, function(err) {
              if(err) { console.error("Mail send didn't work, retrying..."); return callback(err); }
              else
                callback(null);
            });
          }
          async.retry({times: 5, interval: 5000}, apiMethod, function(err) {
            callback(err);
          });

        },
      ], function(err, token) {
        if(err) {
          console.error('There was an error generating deregister token and email to user ID '+user._id+' ('+user.email+')'+': '+err);
        }
      });

    };

    var query  = User.where({ email: email });
    query.findOne(function (err, user) {
      if(err) return res.status(500).send(translateValidationErrors(err,language));
      if(!user) return res.status(403).send({translationKey: 'EMAIL_NOT_FOUND'});
      if(user.permanent == true)
        return res.status(403).send({translationKey: 'PERMANENT_ACCOUNT_MODIFY_ERROR'});

      sendDeregisterEmail(user);

      res.status(200).send('OK');
    });
  }

  else if(action == 'deregister')
  {
    var userId=req.body.userId;
    var deregisterToken=req.body.deregisterToken ? String(req.body.deregisterToken) : "";

    async.waterfall(
      [
        function(callback)
        {
          auth.getCurrentUser(req, function (err, currentUser) {
            if(currentUser && currentUser._id == userId)
              callback(null,currentUser);
            else
              callback(null,null);
          });
        },
        function(user, callback)
        {
          if(!user && !deregisterToken)
            callback(new ValidationError('DEREGISTER_TOKEN_REQUIRED'));
          else if(user)
            callback(null,user);
          else if(deregisterToken) {
            var query  = User.where({ _id: userId, 'tokens.key': 'deregisterToken', 'tokens.value': deregisterToken });
            query.findOne(function (err, _user)
            {
              if(err) return callback(err);
              else if(!_user) return callback({translationKey: 'INVALID_OR_EXPIRED_TOKEN'});
              else
                callback(null,_user);
            });
          }
        },
        function(user, callback)
        {
          removeUser(req, user._id,function(err,user) {
            callback(err,user);
          });
        },
      ],
      function(err,user)
      {
        if(err) return res.status(422).json(translateValidationErrors(err,language));
        else return res.status(200).send('OK');
      }
    );
  }

  else
  {
    return res.status(422).send({message: translations.get(language,'MISSING_OR_INVALID_DATA'), translationKey: 'MISSING_OR_INVALID_DATA'});
  }

};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var user = req.user;
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (user&&user.language?user.language:'en'));

  var query = User.findOne({_id: user._id});
  applyStandardFiltersToUserQuery(query,user);
  query
    .exec(function(err, user) { // don't ever give out the password or salt
      if (err) return next(translateValidationErrors(err,language));
      if (!user) return res.status(401).send({message: translations.get(language,'UNAUTHORIZED'), translationKey:'UNAUTHORIZED'});
      res.json(user);
    });
};

exports.multipleUpdate = function(req, res) {
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : 'en');

  var userIds = req.body.userIds;
  var fields = req.body.fields;

  User.update({'_id': {$in: userIds}}, fields, { multi: true }, function (err, raw) {
    if (err) { return res.status(500).send(translateValidationErrors(err,language)); }
    var fieldsArray = [];
    for(var field in fields)
      fieldsArray.push(field);
    userSocket.multiplePartialUpdate(req.app.get('socketio').sockets.sockets,userIds,fieldsArray);
    res.status(200).send('OK');
  });
}

exports.multipleRemove = function(req, res) {
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : 'en');

  var userIds = req.body.userIds;

  async.waterfall(
    [
      function(callback)
      {
        User.find({'_id': {$in: userIds}})
          .select('_id permanent')
          .exec(function (err, users) {
            for(var i=0; i<users.length; i++)
            {
              var user = users[i];
              if(user.permanent)
              {
                return callback({httpCode: 403, translationKey: 'PERMANENT_ACCOUNT_MODIFY_ERROR'});
              }
            }
            callback(null);
          });
      },
      function(callback)
      {
        User.remove({'_id': {$in: userIds}}, function (err, raw) {
          if (err) { callback(err); }
          else {
            userSocket.multipleRemove(req.app.get('socketio').sockets.sockets, userIds);
            callback(null);
          }
        });
      },
    ],
    function(err)
    {
      if(err)
      {
        var httpCode = 500;
        if(err.httpCode) {
          httpCode = err.httpCode;
          delete err.httpCode
        }
        return res.status(httpCode).send(translateValidationErrors(err, language));
      }
      else
        return res.status(200).send('OK');
    }
  );


}

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};


