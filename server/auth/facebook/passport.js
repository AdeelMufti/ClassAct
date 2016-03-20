var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var UserController = require('../../api/user/user.controller');
var CONSTANTS = require("../../config/constants");
var misc = require("../../components/misc");

exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      profileFields: ['id','emails', 'displayName'],
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      var createOrUpdateParams = {
        name: profile.displayName,
        email: profile.emails[0].value,
        role: 'user',
        provider: 'facebook',
        facebook: profile._json,
        verified: true,
        approved: (CONSTANTS.AUTO_APPROVE_VERIFIED_USER?true:false),
        language: req&&req.cookies&&req.cookies.language?req.cookies.language:'en',
        createdIpAddress: misc.getIpAddressFromReq(req),
      };

      User.findOne({
          $or: [{'facebook.id': profile.id},{email: profile.emails[0].value}]
        },
        function(err, user) {
          if (err) {
            return done(err);
          }
          else if(user)
          {
            if(user.provider=='facebook')
              return done(null, user);
            else if(user.provider == 'local' && user.role=='email')
            {
              UserController.createFromExistingUser(req,user._id,createOrUpdateParams,function(err,user) {
                if (err) { return done(err); }
                done(err, user);
              });
            }
            else
              return done({message: 'LOCAL_USER_EXISTS'}); //When expanding ClassAct to other SSO services, make sure it's not another provide and don't just assume it's local
          }
          else if (!user) {
            UserController.createUser(req,createOrUpdateParams,function(err,user) {
              if (err) { return done(err); }
              done(err, user);
            });
          }
        });
    }
  ));
};
