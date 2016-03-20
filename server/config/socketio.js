/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var auth = require('../auth/auth.service');


// When the user disconnects.. perform this
function onDisconnect(socket) {
  if(socket && socket.user) {
    //console.info('[%s] socket being disassociated from %s (%s)', socket.address, socket.user.email, socket.user._id);
    socket.user = null;
  }
}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    //console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
  });

  // Insert sockets below
  require('../api/classified/classified.socket').register(socket);
  require('../api/user/user.socket').register(socket);

  setupUserInSocket(socket);

  socket.on("associate", function(token,next) {
    setupUserInSocket(socket,token);
    next({data: socket.id});
  });

  socket.on("disassociate", function(next) {
    if(socket && socket.user) {
      //console.info('[%s] socket (id %s) being disassociated from %s (%s)', socket.address, socket.id, socket.user.email, socket.user._id);
      socket.user = null;
    }
    next({data: socket.id});
  });
}

function setupUserInSocket(socket, inputToken)
{
  var tokenToCheck = inputToken;
  if(!tokenToCheck && socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.cookie)
  {
    socket.handshake.headers.cookie.split(';').forEach(function(x) {
      var arr = x.split('=');
      if(arr[0] && arr[0].trim()=='token') {
        tokenToCheck = arr[1];
      }
    });
  }
  if(tokenToCheck)
  {
    auth.getUserFromToken(tokenToCheck, function (err, user) {
      if(user) {
        //console.info('[%s] socket (id %s) belongs to %s (%s)', socket.address, socket.id, user.email, user._id);
        socket.user = user;
      }
    });
  }
}


module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address :
            'address-not-available';

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      //console.info('[%s] DISCONNECTED', socket.address);
    });

    // Call onConnect.
    onConnect(socket);
    //console.info('[%s] CONNECTED', socket.address);
  });
};
