
var async = require('async');
var CONSTANTS = require("../../config/constants");
var Classified = require('./classified.model').model;

exports.routineTasks = function(frequency) {
  if(frequency=='DAILY')
  {
    deleteOldClassifieds();
  }
}

var deleteOldClassifieds = function()
{
  if(CONSTANTS.AUTO_DELETE_CLASSIFIEDS_OLDER_THAN_X_DAYS>0)
  {
    var date = new Date();
    date.setDate(date.getDate()-CONSTANTS.AUTO_DELETE_CLASSIFIEDS_OLDER_THAN_X_DAYS);

    Classified.remove({posted: {$lte: date}}, function (err, raw) {
      if (err) {
        console.error("Unable to delete classifieds older than "+CONSTANTS.AUTO_DELETE_CLASSIFIEDS_OLDER_THAN_X_DAYS+" days!");
        console.error(err);
      }
      else {
        console.log(new Date()+" "+raw.result.n+" classifieds removed that were posted before " + CONSTANTS.AUTO_DELETE_CLASSIFIEDS_OLDER_THAN_X_DAYS + " days ago.");
      }
    });
  }
}
