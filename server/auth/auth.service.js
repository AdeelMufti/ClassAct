'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model').model;
var validateJwt = expressJwt({ secret: config.secrets.session });
var async = require('async');
var translations = require('../config/translations');

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findById(req.user._id, function (err, user) {
        var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (user&&user.language?user.language:'en'));
        if (err) return next(err);
        if (!user) return res.status(401).send({message: translations.get(language,'UNAUTHORIZED'), translationKey: 'UNAUTHORIZED'});

        req.user = user;
        next();
      });
    });
}

function getCurrentUser(req, next) {
  var token;

  if(req.query && req.query.hasOwnProperty('access_token') && req.headers) {
    req.headers.authorization = 'Bearer ' + req.query.access_token;
  }

  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0];
      var credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    }
  }
  else if(req.cookies && req.cookies.token)
  {
    token = req.cookies.token;
  }

  getUserFromToken(token, next);

}

function getUserFromToken(token, next)
{
  async.waterfall
  (
    [
      function(callback)
      {
        jwt.verify(token, config.secrets.session, function(err, decoded) {
          callback(err, decoded);
        });
      },
      function(decoded, callback)
      {
        if(!decoded || !decoded._id)
          callback(null, null);
        else {
          User.findById(decoded._id, function (err, user) {
            callback(null, user);
          });
        }
      },
    ],
    function(err, user)
    {
      next(err, user);
    }
  );
}



/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (req&&req.user&&req.user.language?req.user.language:'en'));

      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.status(401).send({message: translations.get(language,'UNAUTHORIZED'), translationKey: 'UNAUTHORIZED'});
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session/*, { expiresInMinutes: 60*5 }*/);
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (req&&req.user&&req.user.language?req.user.language:'en'));
  if (!req.user) return res.status(404).json({message: translations.get(language,'TRY_AGAIN'), translationKey: 'TRY_AGAIN'});
  var token = signToken(req.user._id, req.user.role);
  var nowDate = new Date(),
      expDate = new Date(nowDate.getFullYear()+1, nowDate.getMonth(), nowDate.getDate());
  res.cookie('token', token, { expires: expDate });
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.getCurrentUser = getCurrentUser;
exports.getUserFromToken = getUserFromToken;
