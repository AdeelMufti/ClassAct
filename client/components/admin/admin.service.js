'use strict';

angular.module('classActApp')
  .factory('Admin', function Admin($location, $rootScope, $q, $window, socket, $translate, Upload, $http, notify, ClassifiedResource, User, Misc) {
    var currentUser = {};

    var stateVariables = {};

    var classifieds = [];
    var classifiedsLoaded = false;
    var users = [];
    var usersLoaded = false;

    var replaceOrInsertInArray = Misc.replaceOrInsertInArray;
    var updateInArrayIfExists = Misc.updateInArrayIfExists;

    $rootScope.$on('classified:multiplePartialUpdate', function (event, data) {
      var cb = data.callback || angular.noop;
      var _classifieds = data.classifieds;

      if(classifiedsLoaded) {
        for(var i=0; i<_classifieds.length; i++)
          updateInArrayIfExists(classifieds, _classifieds[i]);
      }

      cb();
    });

    $rootScope.$on('classified:save', function (event, data) {
      var cb = data.callback || angular.noop;
      var classified = data.classified;

      if(classifiedsLoaded)
        replaceOrInsertInArray(classifieds, classified, false);

      cb();
    });

    $rootScope.$on('classified:multipleRemove', function (event, data) {
      var cb = data.callback || angular.noop;
      var classifiedIds = data.classifiedIds;

      for(var i=0; i<classifiedIds.length; i++) {
        _.remove(classifieds, {_id: classifiedIds[i]});
      }

      cb();
    });

    $rootScope.$on('classified:remove', function (event, data) {
      var cb = data.callback || angular.noop;
      var classified = data.classified;

      _.remove(classifieds, {_id: classified._id});

      cb();
    });

    $rootScope.$on('user:multiplePartialUpdate', function (event, data) {
      var cb = data.callback || angular.noop;
      var _users = data.users;

      if(usersLoaded) {
        for(var i=0; i<_users.length; i++)
          updateInArrayIfExists(users, _users[i]);
      }

      cb();
    });

    $rootScope.$on('user:save', function (event, data) {
      var cb = data.callback || angular.noop;
      var user = data.user;

      if(usersLoaded)
        replaceOrInsertInArray(users, user, false);

      cb();
    });

    $rootScope.$on('user:multipleRemove', function (event, data) {
      var cb = data.callback || angular.noop;
      var userIds = data.userIds;

      for(var i=0; i<userIds.length; i++)
        _.remove(users, {_id: userIds[i]});

      cb();
    });

    $rootScope.$on('user:remove', function (event, data) {
      var cb = data.callback || angular.noop;
      var user = data.user;

      _.remove(users, {_id: user._id});

      cb();
    });

    var Admin = {
      getStateVariables: function()
      {
        return stateVariables;
      },

      registerUser: function(_currentUser,callback) {
        var cb = callback || angular.noop;
        currentUser = _currentUser;
        classifieds = [];
        classifiedsLoaded = false;
        users = [];
        usersLoaded = false;
        return cb();
      },

      getAllClassifieds: function(callback) {
        var cb = callback || angular.noop;

        if(classifiedsLoaded) {
          return cb(classifieds);
        }
        else {
          return ClassifiedResource.All.query(
            function (_classifieds) {
              classifieds = _classifieds;
              classifiedsLoaded = true;
              return cb(classifieds);
            },
            function (err) {
              return cb(err);
            }).$promise;
        }
      },

      getMoreAllClassifieds: function(window,callback) {
        var cb = callback || angular.noop;

        if(!classifiedsLoaded || classifieds.length==0)
          cb(null,0);
        else {
          return ClassifiedResource.All.query(
            {startTime: new Date(classifieds[classifieds.length-1].created).getTime(), window: window},
            function (_classifieds) {
              for(var i=0; i<_classifieds.length; i++)
                replaceOrInsertInArray(classifieds,_classifieds[i],true);
              return cb(null,_classifieds.length);
            },
            function (err) {
              return cb(err);
            }).$promise;
        }
      },

      getAllUsers: function(callback) {
        var cb = callback || angular.noop;

        if(usersLoaded) {
          return cb(users);
        }
        else {
          return User.All.query(
            function (_users) {
              users = _users;
              usersLoaded = true;
              return cb(users);
            },
            function (err) {
              return cb(err);
            }).$promise;
        }
      },

      getMoreAllUsers: function(window,callback) {
        var cb = callback || angular.noop;

        if(!usersLoaded || users.length==0)
          cb(null,0);
        else {
          return User.All.query(
            {startTime: new Date(users[users.length-1].created).getTime(), window: window},
            function (_users) {
              for(var i=0; i<_users.length; i++)
                replaceOrInsertInArray(users,_users[i],true);
              return cb(null,_users.length);
            },
            function (err) {
              return cb(err);
            }).$promise;
        }
      },

      updateUserFields: function(user, fields, callback) {
        var cb = callback || angular.noop;

        return User.WithId.update(
          { id: user._id },
          fields,
          function(savedUser) {
            if(!socket.isConnected()) {
              for (var key in savedUser) {
                if (savedUser.hasOwnProperty(key) && user.hasOwnProperty(key)) {
                  user[key] = savedUser[key];
                }
              }
            }
            cb(null,savedUser);
          },
          function(err) {
            cb(err,null);
          }
        ).$promise;

      },

      removeUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.WithId.remove(
          { id: user._id },
          function(data) {
            if(!socket.isConnected())
              $rootScope.$broadcast('user:remove', {user: user});
            return cb(null, data);
          },
          function(err) {
            return cb(err, null);
          }
        ).$promise;
      },

      multipleUpdateUser: function(userIds, fields, callback) {
        var cb = callback || angular.noop;

        return User.MultipleUpdate.save(
          {userIds: userIds, fields: fields},
          function(data) {
            if(!socket.isConnected())
            {
              var _users = [];
              for(var i=0; i<userIds.length; i++)
              {
                var user = {};
                user._id = userIds[i];
                for(var key in fields)
                  user[key] = fields[key];
                _users.push(user);
              }
              $rootScope.$broadcast('user:multiplePartialUpdate', {
                users: _users,
              });
            }
            return cb(null, data);
          },
          function(err) {
            return cb(err, null);
          }
        ).$promise;
      },

      multipleRemoveUser: function(userIds, callback) {
        var cb = callback || angular.noop;

        return User.MultipleRemove.save(
          {userIds: userIds},
          function(data) {
            if(!socket.isConnected())
            {
              $rootScope.$broadcast('user:multipleRemove', {
                userIds: userIds,
              });
            }
            return cb(null, data);
          },
          function(err) {
            return cb(err, null);
          }
        ).$promise;
      },



    };

    return Admin;
  });
