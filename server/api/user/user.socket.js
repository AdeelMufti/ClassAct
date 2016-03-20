/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var user = require('./user.model').model;
var userFieldAccessByUserRole = require('./user.model').fieldAccessByUserRole;
var controller = require('./user.controller');
var async = require('async');
var _ = require('lodash');

exports.register = function(socket) {
  user.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  user.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

exports.emitToUsersByRole = function(sockets, role, identifier, data) {
  for(var socketId in sockets) {
    var socket = sockets[socketId];
    if(role == 'all' || (socket.user && socket.user.role==role))
      socket.emit(identifier,data);
  }
}

exports.multiplePartialUpdate = function(sockets,docIds,fields) {
  var select = '';
  for(var fieldIdx=0; fieldIdx<fields.length; fieldIdx++) {
    var field = fields[fieldIdx];
    select += field + (fieldIdx==fields.length-1?'':' ');
  }
  async.waterfall(
    [
      function(callback)
      {
        user
          .find({'_id': {$in: docIds}})
          .select(select)
          .exec(function(err, docs) {
            //console.log("Got docs: ")
            //console.log(docs);
            callback(err,docs);
          });
      },
      function(docs) {
        for(var socketId in sockets)
        {
          var socket = sockets[socketId];
          //console.log("\n\nProcessing socket: ");
          //console.log(socket);
          var docsToEmit = [];
          for(var docIdx=0; docIdx<docs.length; docIdx++)
          {
            var doc = docs[docIdx];
            //console.log("Processing doc "+doc._id);
            if(socket.user && (socket.user.role=='admin' || String(doc._id)==String(socket.user._id))) {
              //console.log("Doc applies to socket, moving forward.")
              var fieldsToInclude = {};
              fieldsToInclude['_id'] = doc._id;
              for(var fieldIdx=0; fieldIdx<fields.length; fieldIdx++)
              {
                var field = fields[fieldIdx];
                //console.log("Processing field "+field);
                var docPojo = doc.toObject();
                if(docPojo.hasOwnProperty(field)) {
                  //console.log("Doc has field");
                  var accessibleFields;
                  if(socket.user)
                    accessibleFields = userFieldAccessByUserRole[socket.user.role];
                  else
                    accessibleFields = userFieldAccessByUserRole['default'];
                  //console.log("Accessible fields for this socket/user are: ");
                  //console.log(accessibleFields);
                  if(_.indexOf(accessibleFields,'all')>-1 || _.indexOf(accessibleFields,field)>-1) {
                    fieldsToInclude[field] = doc[field];
                  }
                }
              }
              if(Object.keys(fieldsToInclude).length>1)
              {
                //console.log("Looks like this doc had the fields needed for this socket/user, so adding to docsToEmit")
                docsToEmit.push(fieldsToInclude);
              }
            }
          }
          if(docsToEmit.length!=0)
            socket.emit('user:multiplePartialUpdate', docsToEmit);
        }
      }
    ]);
}

exports.multipleRemove = function(sockets,docIds) {
  for(var socketId in sockets)
  {
    var socket = sockets[socketId];
    if(socket.user && _.indexOf(docIds,String(socket.user._id))>-1) {
      socket.emit('user:logout', socket.user._id);
    }
    else if(socket.user && socket.user.role=='admin')
      socket.emit('user:multipleRemove', docIds );
  }
}

function onSave(socket, doc, cb) {
  if(socket.user && (socket.user.role=='admin' || String(doc._id)==String(socket.user._id))) {
    var query = user.findById(doc._id);
    controller.applyStandardFiltersToUserQuery(query,socket.user);
    query
      .exec(function (err, user) {
        if(!err)
          socket.emit('user:save', user);
      });
  }
}

function onRemove(socket, doc, cb) {
  if(socket.user && String(socket.user._id) == String(doc._id)) {
    socket.emit('user:logout', socket.user._id);
  }
  else if(socket.user && socket.user.role=='admin')
    socket.emit('user:remove', {_id: doc._id});
}
