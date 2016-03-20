var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var translations = require('../../config/translations');

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password', // this is the virtual field on the model
      passReqToCallback: true
    },
    function(req, email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);
        var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (user&&user.language?user.language:'en'));

        if (!user) {
          return done(null, false, { message: translations.get(language,'EMAIL_NOT_REGISTERED'), translationKey: 'EMAIL_NOT_REGISTERED' });
        }
        if(user.provider != 'local') {
          return done(null, false, {message: translations.get(language, 'USER_IS_NOT_LOCAL'), translationKey: 'USER_IS_NOT_LOCAL'});
        }
        if(user.role == 'email') {
          return done(null, false, { message: translations.get(language,'EMAIL_ONLY_USER'), translationKey: 'EMAIL_ONLY_USER' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: translations.get(language,'INVALID_PASSWORD'), translationKey: 'INVALID_PASSWORD' });
        }
        return done(null, user);
      });
    }
  ));
};
