/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var classified = require('./classified.model').model;
var classifiedFieldAccessByUserRole = require('./classified.model').fieldAccessByUserRole;
var controller = require('./classified.controller');
var async = require('async');
var _ = require('lodash');

exports.register = function(socket) {
  classified.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  classified.schema.post('remove', function (doc) {
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

exports.multipleRemove = function(sockets,docIds) {
  for(var socketId in sockets)
  {
    var socket = sockets[socketId];
    socket.emit('classified:multipleRemove', docIds );
  }
}

exports.multiplePartialUpdate = function(sockets,docIds,fields) {
  var select = '';
  if(_.indexOf(fields,'posted')==-1)
    select += 'posted ';
  if(_.indexOf(fields,'user')==-1)
    select += 'user ';
  for(var fieldIdx=0; fieldIdx<fields.length; fieldIdx++) {
    var field = fields[fieldIdx];
    select += field + (fieldIdx==fields.length-1?'':' ');
  }
  async.waterfall(
    [
      function(callback)
      {
        classified
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
            if(doc.posted || (socket.user && socket.user.role=='admin') || (doc.user && socket.user && String(doc.user._id)==String(socket.user._id))) {
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
                    accessibleFields = classifiedFieldAccessByUserRole[socket.user.role];
                  else
                    accessibleFields = classifiedFieldAccessByUserRole['default'];
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
            socket.emit('classified:multiplePartialUpdate', docsToEmit);
        }
      }
    ]);
}

function onSave(socket, doc, cb) {
  if(doc.posted || doc._previousPosted || (socket.user && socket.user.role=='admin') || (doc.user && socket.user && String(doc.user._id)==String(socket.user._id))) {
    controller.getClassified({_id: doc._id},socket.user,function(err,classified) {
      if(!err)
        socket.emit('classified:save', classified);
    });
  }
}

function onRemove(socket, doc, cb) {
  socket.emit('classified:remove', {_id: doc._id} );
}
