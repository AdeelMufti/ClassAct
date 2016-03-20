'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    failureRedirect: '/signup',
    session: false
  }))

  .get('/callback', function(req, res, next) {
    passport.authenticate('facebook', function (err, user, info) {
      var error = err || info;
      var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (user&&user.language?user.language:'en'));
      if (error) {
        if(error.message && error.message=='LOCAL_USER_EXISTS')
          return res.redirect('/login?error=LOCAL_USER_EXISTS');
        else {
          console.error(err);
          return res.redirect('/login?error=TRY_AGAIN');
        }
      }
      else {
        req.user=user;
        return auth.setTokenCookie(req, res);
      }
    })(req, res, next)
  });

  /*.get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/signup',
    session: false
  }), auth.setTokenCookie);*/

module.exports = router;
