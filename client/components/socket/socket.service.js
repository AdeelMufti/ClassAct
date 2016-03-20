/* global io */
'use strict';

angular.module('classActApp')
  .factory('socket', function($rootScope, socketFactory, $location, CONSTANTS, Misc, notify, $translate, moment) {

    var connected = false;
    var hostname = $location.host();
    var port = (hostname=='localhost'||hostname=='127.0.0.1'?$location.port():(CONSTANTS.WEBSOCKET_PORT?CONSTANTS.WEBSOCKET_PORT:$location.port));
    var wsURL = ($location.protocol()=="http"?"ws":"wss")+"://"+hostname+":"+port;

    var ioSocket = io(wsURL, {
      // 'query': 'token=' + Misc.getToken()
      path: '/socket.io-client'
    });

    var socket = socketFactory({
      ioSocket: ioSocket
    });

    socket.on('connect', function() {
      //console.log('socket connected');
      connected = true;
    });

    socket.on('disconnect', function () {
      //console.log('socket disconnected');
      connected = false;
    });

    socket.on('user:logout', function (userId) {
      //console.log("socket: received user:logout, broadcasting logout event");
      $rootScope.$broadcast('logout', {
        userId: userId,
        newPath: null,
        callback: function(userWasLoggedIn) {
          if(userWasLoggedIn) {
            notify.config({
              startTop: 75,
              duration: 0,
              position: 'center'
            });
            notify({
              message: $translate.instant('LOGGED_OUT')
            });
          }
        }
      });
    });

    socket.on('classified:multiplePartialUpdate', function (classifieds) {
      //console.log("socket: received classified:multiplePartialUpdate, broadcasting event");
      $rootScope.$broadcast('classified:multiplePartialUpdate', {
        classifieds: classifieds,
      });
    });

    socket.on('classified:save', function (classified) {
      //console.log("socket: received classified:save, broadcasting event");
      $rootScope.$broadcast('classified:save', {
        classified: classified,
      });
    });

    socket.on('classified:multipleRemove', function (classifiedIds) {
      //console.log("socket: received classified:multipleRemove, broadcasting event");
      $rootScope.$broadcast('classified:multipleRemove', {
        classifiedIds: classifiedIds,
      });
    });

    socket.on('classified:remove', function (classified) {
      //console.log("socket: received classified:remove, broadcasting event");
      $rootScope.$broadcast('classified:remove', {
        classified: classified,
      });
    });

    socket.on('user:multiplePartialUpdate', function (users) {
      //console.log("socket: received user:multiplePartialUpdate, broadcasting event");
      $rootScope.$broadcast('user:multiplePartialUpdate', {
        users: users,
      });
    });

    socket.on('user:save', function (user) {
      //console.log("socket: received user:save, broadcasting event");
      $rootScope.$broadcast('user:save', {
        user: user,
      });
    });

    socket.on('user:multipleRemove', function (userIds) {
      //console.log("socket: received user:multipleRemove, broadcasting event");
      $rootScope.$broadcast('user:multipleRemove', {
        userIds: userIds,
      });
    });

    socket.on('user:remove', function (user) {
      //console.log("socket: received user:remove, broadcasting event");
      $rootScope.$broadcast('user:remove', {
        user: user,
      });
    });

    socket.on('emailDigest', function (data) {
      notify.config({
        startTop: 75,
        duration: 0,
        position: 'center'
      });
      var user=data.triggeringUser.name+' ('+data.triggeringUser.email+')';
      var date=moment(new Date(data.date)).format("LLLL");

      if(data.success)
      {
        var count=0;
        for(var classified in data.classifiedsSelectedForDigest)
          if(data.classifiedsSelectedForDigest[classified])
            count++;
        notify({
          messageTemplate: '<span>'+$translate.instant('EMAIL_DIGEST_SENT',{selectedCount: count, user: user, date: date})+'</span>'
        });
      }
      else
      {
        var err = data.err;
        var message = '';
        if(err.data && err.data.message)
          message = err.data.message;
        else if(err.message)
          message = err.message;
        else
          message = JSON.stringify(err);

        notify({
          messageTemplate: '<span>'+$translate.instant('EMAIL_DIGEST_SEND_ERROR_WITH_USER',{message: message, user: user, date: date})+'</span>'
        });
      }
    });

    return {
      socket: socket,

      isConnected: function() {
        return connected;
      },

      emitToServerAssociateSocketToUser: function () {
        //console.log("socket: telling server to associate user with socket");
        socket.emit("associate", Misc.getToken(), function(data) {
          //console.log(data);
        });
      },

      emitToServerDisassociateSocketFromUser: function () {
        //console.log("socket: telling server to disassociate user from socket");
        socket.emit("disassociate", function(data) {
          //console.log(data);
        });
      }

    };
  });
