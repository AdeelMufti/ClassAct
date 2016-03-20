'use strict';

angular.module('classActApp')
  .factory('Auth', function Auth($location, $rootScope, $http, User, $cookies, $q, Misc, socket, Classified, $translate, amMoment, notify, Admin, Analytics) {
    var currentUser = {};

    var Auth = {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/auth/local', {
          email: user.email,
          password: user.password
        }).
        success(function(data) {
          notify.closeAll();
          Misc.setTokenCookie(data.token);
          currentUser = User.WithId.get();
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      postLoginProcessing: function(callback) {
        var cb = callback || angular.noop;

        socket.emitToServerAssociateSocketToUser();

        if(currentUser.language) {
          Misc.setLanguageCookie(currentUser.language);
          if(currentUser.language != $translate.use().substring(0,2))
          {
            $translate.use(currentUser.language);
            amMoment.changeLocale(currentUser.language);
          }
        }

        Classified.registerUser(currentUser,function() {
          if(Auth.isAdmin())
          {
            Admin.registerUser(currentUser,function() {
              cb();
            });
          }
          else
            cb();
        });

        Analytics.set('&uid', currentUser._id);

      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function(newPath, callback) {
        var cb = callback || angular.noop;
        var returnValue = this.isLoggedIn();
        async.waterfall(
          [
            function(callback)
            {
              Classified.registerUser({},function() {
                callback(null);
              });
            },
            function(callback)
            {
              if(Auth.isAdmin()) {
                Admin.registerUser({}, function () {
                  callback(null);
                });
              }
              else
                callback(null);
            },
            function()
            {
              Analytics.set('&uid', null);
              notify.closeAll();
              $cookies.remove('token');
              currentUser = {};
              socket.emitToServerDisassociateSocketFromUser();
              if(newPath)
                $location.path(newPath);
              return cb(returnValue);
            }
          ]
        );

      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.WithId.save(user,
          function(data) {
            if(user.password!=null && user.password!='') {
              Misc.setTokenCookie(data.token);
              currentUser = User.WithId.get();
            }
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },

      updateUserFromDatabase: function(callback) {
        var cb = callback || angular.noop;

        return User.WithId.get(
          function(user) {
            currentUser = user;
            return cb(user);
          },
          function(err) {
            return cb(err);
          }.bind(this)).$promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.WithId.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      generateVerificationEmail: function(callback) {
        var cb = callback || angular.noop;

        return User.WithId.generateVerificationEmail({ id: currentUser._id }, null, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      update: function(fields, callback) {
        var cb = callback || angular.noop;

        return User.WithId.update(
          { id: currentUser._id },
          fields,
          function(savedUser) {
            if(!socket.isConnected()) {
              for (var key in savedUser) {
                if (savedUser.hasOwnProperty(key) && currentUser.hasOwnProperty(key)) {
                  currentUser[key] = savedUser[key];
                }
              }
            }
            return cb();
          },
          function(err) {
            return cb(err);
          }
        ).$promise;

      },


      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },

    };

    if($cookies.get('token')) {
      currentUser = User.WithId.get(
        function(user) {
          Analytics.set('&uid', currentUser._id);
          Classified.registerUser(currentUser);
          if(Auth.isAdmin())
            Admin.registerUser(currentUser);
        });
    }

    $rootScope.$on('logout', function (event, data) {
      var cb = data.callback || angular.noop;
      Auth.isLoggedInAsync(function (loggedIn) {
        if (data.forceLogout || (loggedIn && currentUser._id == data.userId)) {
          return Auth.logout(data.newPath,cb);
        }
        else {
          return cb(false);
        }
      });
    });

    $rootScope.$on('user:multiplePartialUpdate', function (event, data) {
      var cb = data.callback || angular.noop;
      var users = data.users;

      var _currentUser = _.find(users, {_id: String(currentUser._id)});

      if (_currentUser) {
        for(var key in _currentUser)
          currentUser[key] = _currentUser[key];
      }

      cb();
    });

    $rootScope.$on('user:save', function (event, data) {
      var cb = data.callback || angular.noop;
      var user = data.user;

      if(String(currentUser._id) == String(user._id))
        currentUser = user;

      cb();
    });

    return Auth;
  });
