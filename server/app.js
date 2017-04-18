/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var schedule = require("node-schedule");

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
	console.error('MongoDB connection error: ' + err);
	process.exit(-1);
	}
);
// Populate DB with sample data
if(config.seedDB) { console.log("Seeding databases if necessary"); require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
app.set('socketio', socketio);
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

var dailyRule = new schedule.RecurrenceRule();
dailyRule.second = 0;
dailyRule.minute = 0;
dailyRule.hour = 0;
var onceADay = schedule.scheduleJob(dailyRule, function(){
  var classifiedMisc = require('./api/classified/classified.misc');
  classifiedMisc.routineTasks('DAILY');
});

// Expose app
exports = module.exports = app;
