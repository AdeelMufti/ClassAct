'use strict';

var _ = require('lodash');
var Classified = require('./classified.model').model;
var classifiedFieldAccessByUserRole = require('./classified.model').fieldAccessByUserRole;
var Category = require('./category.model');
var User = require('../user/user.model').model;
var async = require('async');
var auth = require('../../auth/auth.service');
var translations = require('../../config/translations');
var config = require('../../config/environment');
var multiparty = require('multiparty');
var fs = require('fs');
var os = require('os');
var easyimg = require('easyimage');
var path = require('path');
var misc = require("../../components/misc");
var moment = require('moment');
var nodemailer = require('nodemailer');
var CONSTANTS = require("../../config/constants");
var sprintf = require("sprintf-js").sprintf;
var classifiedSocket = require('./classified.socket');

var ValidationError = misc.ValidationError;
var translateValidationErrors = misc.translateValidationErrors;

exports.uploadImage = function(req, res)
{
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';

  var form = new multiparty.Form(/*{maxFilesSize: 20971520}*/);

  form.parse(req, function(err, fields, images) {
    if(!images) return;

    var image = images.image[0];
    var tmpPath = image.path;
    var extIndex = tmpPath.lastIndexOf('.');
    var tmpPathNoFileExt = tmpPath.substr(0,(extIndex < 0 ? tmpPath.length: extIndex-1));

    async.waterfall(
      [
        function(callback)
        {
          var contentType = String(image.headers['content-type']);
          if (!contentType || contentType.length<5 || contentType.substr(0,5) != 'image')
          {
            callback('NOT_AN_IMAGE');
          }
          else
            callback(null);
        },
        function(callback)
        {
          easyimg.info(tmpPath).then(
            function(imageProperties) {
              if(imageProperties.size<1000)
                callback('IMAGE_UPLOAD_ERROR_minSize');
              else if(imageProperties.size>20971520)
                callback('IMAGE_UPLOAD_ERROR_maxSize');
              else if(imageProperties.width<50)
                callback('IMAGE_UPLOAD_ERROR_minWidth');
              else if(imageProperties.height<50)
                callback('IMAGE_UPLOAD_ERROR_minHeight');
              else
                callback(null,imageProperties);
            }, function (err) {
              callback('NOT_AN_IMAGE');
            }
          );
        },
        function(imageProperties,callback)
        {
          //if(imageProperties.size>200000 || imageProperties.width>1000 || imageProperties.height>1000)
          //{
            var tmpPathJPG = tmpPathNoFileExt+'.jpg';
            var command = 'convert -resize '+(imageProperties.width>1000?1000:imageProperties.width)+'x'+(imageProperties.height>1000?1000:imageProperties.height)+' -strip -quality 75 -colors 256 -format JPG '+tmpPath+' '+tmpPathJPG;
            easyimg.exec(command).then(
              function() {
                fs.unlink(tmpPath);
                tmpPath=tmpPathJPG;
                callback(null);
              }, function (err) {
                console.error(err);
                callback('UNABLE_TO_PROCESS_IMAGE');
              }
            );
          //}
          //else
            //callback(null);
        },
        function(callback)
        {
          easyimg.info(tmpPath).then(
            function(imageProperties) {
                callback(null,imageProperties);
            }, function (err) {
              console.error(err);
              callback('UNABLE_TO_PROCESS_IMAGE');
            }
          );
        },
        function(imageProperties,callback)
        {
          var tmpPathThumbnailJPG = tmpPathNoFileExt+'_thumbnail.jpg';
          easyimg.rescrop({
            src:tmpPath, dst:tmpPathThumbnailJPG,
            width:imageProperties.width>200?200:imageProperties.width, height:imageProperties.height>200?200:imageProperties.height,
            cropwidth:100, cropheight:100,
            x:0, y:0,
            quality:50
          }).then(
            function(image) {
              var imageThumbnailFileLoaded = fs.readFileSync(tmpPathThumbnailJPG).toString('base64');
              callback(null,imageThumbnailFileLoaded);
            },
            function (err) {
              console.error(err);
              callback('UNABLE_TO_PROCESS_IMAGE');
            }
          );
        }
      ],
      function(err,imageThumbnailFileLoaded)
      {
        if(err) {
          fs.unlink(tmpPath);
          return res.status(400).send({message: translations.get(language, err), translationKey: err});
        }
        else {
          var filename = tmpPath.replace(/^.*[\\\/]/, '');
          return res.json({filename:filename,thumbnail:imageThumbnailFileLoaded});
        }
      }
    );
  });
};

exports.rotateImage = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';

  var orientation = req.params.orientation;

  var imageFile = req.params.imageFile;
  var extIndex = imageFile.lastIndexOf('.');
  var imageFileNoExt = imageFile.substr(0,(extIndex < 0 ? imageFile.length: extIndex));
  var imageThumbnailFile = imageFileNoExt+"_thumbnail.jpg";
  var osTmpDir = os.tmpDir(); osTmpDir = osTmpDir + (osTmpDir.substring(osTmpDir.length-1) == path.sep ? '': path.sep);
  var imageFileFullPath = osTmpDir + imageFile;
  var imageThumbnailFileFullPath = osTmpDir + imageThumbnailFile;

  async.waterfall(
    [
      function(callback)
      {
        if(!fs.existsSync(imageFileFullPath) || !fs.existsSync(imageThumbnailFileFullPath))
          callback('UNABLE_TO_PROCESS_IMAGE');
        else
          callback(null);
      },
      function(callback)
      {
        easyimg.rotate({
          src:imageFileFullPath, dst:imageFileFullPath,
          degree:(orientation=='clockwise'?90:-90),
          quality:100
        }).then(
          function(image) {
            callback(null);
          },
          function (err) {
            console.error(err);
            callback('UNABLE_TO_PROCESS_IMAGE');
          }
        );
      },
      function(callback)
      {
        easyimg.rotate({
          src:imageThumbnailFileFullPath, dst:imageThumbnailFileFullPath,
          degree:(orientation=='clockwise'?90:-90),
          quality:100
        }).then(
          function(image) {
            var imageThumbnailFileLoaded = fs.readFileSync(imageThumbnailFileFullPath).toString('base64');
            callback(null,imageThumbnailFileLoaded);
          },
          function (err) {
            console.error(err);
            callback('UNABLE_TO_PROCESS_IMAGE');
          }
        );
      },
    ],
    function(err,imageThumbnailFileLoaded)
    {
      if(err)
        return res.status(500).send({message: translations.get(language, err), translationKey: err});
      else {
        return res.json({thumbnail: imageThumbnailFileLoaded});
      }
    }
  );
};

exports.getForUser = function(req, res) {
  var user = req.user;
  var language = (req.user && req.user.language ? req.user.language : (req&&req.cookies&&req.cookies.language?req.cookies.language:'en'));

  var query = Classified.find({user: user._id});
  query.select('_id title created')
  query.sort('-created');
  query
    .exec(function (err, classifieds) {
      if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
      return res.status(200).json(classifieds);
    });
}

exports.getPosted = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';
  var startTime = req.params.startTime ? req.params.startTime : null;
  var window = req.params.window ? req.params.window : 20;

  async.waterfall(
    [
      function(callback) {
        auth.getCurrentUser(req, function (err, user) {
          callback(null, user);
        });
      },
      function(user)
      {
        var cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate()-90);
        var query = Classified.find({
          $and: [
            {posted: { $ne: null }},
            {posted: { $gt: cutoffDate }},
            {flagged: { $ne: true }},
          ]
        });
        applyStandardFiltersToClassifiedQuery(query,user);
        query.sort('-posted -_id');
        if(window && window!=0)
          query.limit(window);
        if(startTime) {
          query.where({posted: {$lt: new Date().setTime(startTime)}});
        }
        query
          .exec(function (err, classifieds) {
            if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
            return res.status(200).json(classifieds);
          });
      }
    ]
  );

}

exports.getAll = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';
  var startTime = req.params.startTime ? req.params.startTime : null;
  var window = req.params.window ? req.params.window : 50;

  var user = req.user;
  var query = Classified.find({});
  applyStandardFiltersToClassifiedQuery(query,user);
  query.select('-images -categories -content -location -contact -__v -flaggedBy._id -flaggedBy.date');
  query.sort('-created -_id');
  if(window && window!=0)
    query.limit(window);
  if(startTime) {
    query.where({created: {$lt: new Date().setTime(startTime)}});
  }
  query
    .exec(function (err, classifieds) {
      if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
      return res.status(200).json(classifieds);
    });
}

// Get list of classifieds
exports.index = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';

  var findCriteria;
  async.waterfall(
    [
      function(callback) {
        auth.getCurrentUser(req, function (err, user) {
          callback(null, user);
        });
      },
      function(user, callback)
      {
        if(!user)
        {
          findCriteria = {posted: { $ne: null }};
        }
        else if(user && user.role!='admin')
        {
          findCriteria = { $or: [{posted: { $ne: null }}, {user: user._id}]  };
        }
        callback(null,user);
      }
    ],
    function(err, user) {
      if(err) {
        return res.status(500).send(err);
      }
      else {
        var query = Classified.find(findCriteria);
        applyStandardFiltersToClassifiedQuery(query,user);
        query
          .exec(function (err, classifieds) {
            if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
            return res.status(200).json(classifieds);
          });
      }
    }
  );
};

var getClassified = function(findCriteria,user,callback)
{
  var query = Classified.findOne(findCriteria);
  applyStandardFiltersToClassifiedQuery(query,user);
  query
    .exec(function (err, classified) {
      callback(err,classified);
    });
};
exports.getClassified = getClassified;

var applyStandardFiltersToClassifiedQuery = function(query, user) {
  var accessibleFields;
  if(user)
    accessibleFields = classifiedFieldAccessByUserRole[user.role];
  else
    accessibleFields = classifiedFieldAccessByUserRole['default'];

  var excludeSelection = '';
  if(_.indexOf(accessibleFields, 'all')==-1)
    for(var key in Classified.schema.paths) {
      if (key != '_id' && _.indexOf(accessibleFields, key) == -1)
        excludeSelection += '-' + key + ' ';
    }

  query.select('-images.image -__v');
  query.populate('categories','-title -sort -icon -__v');

  if(!user || user.role!='admin') {
    query.populate('user','_id');
    query.select(excludeSelection);
  }
  else if(user.role=='admin') {
    query.populate('user','_id name email');
    query.populate('flaggedBy.user','_id name email');
    query.select('-flaggedBy._id -flaggedBy.date');
    query.select(excludeSelection);
  }
}


exports.indexCategories = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';
  Category.find({}, function (err, categories) {
    if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
    return res.status(200).json(categories);
  });
};

exports.getTempImage = function(req, res) {
  var imageFile = req.params.imageFile;
  var osTmpDir = os.tmpDir(); osTmpDir = osTmpDir + (osTmpDir.substring(osTmpDir.length-1) == path.sep ? '': path.sep);
  var imageFileFullPath = osTmpDir + imageFile;

  if(!fs.existsSync(imageFileFullPath))
    return res.status(404).send();

  var imageFileLoaded = fs.readFileSync(imageFileFullPath);

  res.contentType("image/jpg");
  return res.send(imageFileLoaded);

};

exports.emailDigest = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';
  var user = req.user;

  var digestLanguages = req.body.digestLanguages;
  var digestSubjects = req.body.digestSubjects;
  var digestOptionalMessages = req.body.digestOptionalMessages;
  var classifiedsSelectedForDigest = req.body.classifiedsSelectedForDigest;

  var classifiedIds = [];
  console.log("---------Email Digest---------");
  console.log("Email digest triggered at "+new Date()+" by user "+user._id);
  console.log("These classifieds will be included:");
  console.log(classifiedsSelectedForDigest);

  function sendDigest(users,classifieds) {
    async.waterfall(
      [
        function(callback)
        {
          var numberOfEmailAddressesPerEmail=100;
          var classifiedContentMaxLength = 1000;

          var smtp = config.smtp();
          var smtpTransport = nodemailer.createTransport({
            host: smtp.hostname,
            port: smtp.port,
            secure: smtp.ssl,
            auth: {
              user: smtp.username,
              pass: smtp.password
            }
          });

          var asyncSendEmailSeriesFunctions = [];
          var emails = [];

          for(var langIdx=0; langIdx<digestLanguages.length; langIdx++)
          {
            var thisLangKey = digestLanguages[langIdx].key;
            var thisLangSubject = digestSubjects[thisLangKey];
            var thisLangOptionalMessage = digestOptionalMessages[thisLangKey];

            var attachments = [];
            var emailMessageInHtml = "";

            if(thisLangOptionalMessage)
              emailMessageInHtml += '<p style="font-size: 120%;">'+thisLangOptionalMessage.replace(/\n/g,"<br>\n") + '</p><br><hr width="75%">\n\n';

            emailMessageInHtml += '<h1>'+translations.get(thisLangKey,'LATEST_CLASSIFIEDS_ON_WEBSITE')+'</h1>\n\n';
            for(var classifiedIdx=0; classifiedIdx<classifieds.length; classifiedIdx++)
            {
              var classified = classifieds[classifiedIdx];
              var viewClassifiedURL = 'http://' + req.headers.host + '/view-classified/'+classified._id;

              emailMessageInHtml += '<br>\n';
              emailMessageInHtml += '<table style="border: 1px solid #D3D3D3;">\n';
              emailMessageInHtml += '<tr><td colspan="2"><p style="font-size: 120%;"><b><a href="'+viewClassifiedURL+'">'+classified.title+'</a></b></p></td></tr>\n';
              if(classified.location)
                emailMessageInHtml += '<tr><td><b><u>'+translations.get(thisLangKey,'LOCATION')+'</u>:</b></td> <td>'+classified.location+'</td></tr>\n';
              if(classified.contact)
                emailMessageInHtml += '<tr><td><b><u>'+translations.get(thisLangKey,'CONTACT')+'</u>:</b></td> <td>'+classified.contact+'</td></tr>\n';

              emailMessageInHtml += '<tr><td><b><u>'+translations.get(thisLangKey,'CATEGORIES')+'</u>:</b></td> <td>';
              for(var categoriesIdx=0; categoriesIdx<classified.categories.length; categoriesIdx++) {
                var category = classified.categories[categoriesIdx];
                var categoryInThisLang = _.find(category.title,{language:thisLangKey});
                if(categoryInThisLang)
                  emailMessageInHtml += categoryInThisLang.value + (categoriesIdx==classified.categories.length-1?'':', ');
              }
              emailMessageInHtml += '</td></tr>\n';

              moment.locale(thisLangKey);
              emailMessageInHtml += '<tr><td><b><u>'+translations.get(thisLangKey,'POSTED')+'</u>:</b></td> <td>'+moment(classified.posted).format("LLLL")+'</td></tr>\n';
              emailMessageInHtml += '<tr><td colspan="2"><pre style="overflow: auto; word-break: keep-all; white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word;">'+classified.content.substr(0,(classified.content.length>classifiedContentMaxLength?classifiedContentMaxLength:classified.content.length))+(classified.content.length>classifiedContentMaxLength?'<a href="'+viewClassifiedURL+'">...</a>':'')+'</pre></td></tr>\n';
              if(classified.images)
              {
                emailMessageInHtml += '<tr><td colspan="2">';
                for(var imageIdx=0; imageIdx<classified.images.length; imageIdx++)
                {
                  var thumbnail = classified.images[imageIdx].thumbnail.data;//.toString('base64');
                  var imageId = String(classified.images[imageIdx]._id);
                  attachments.push({
                    filename: imageId+".jpg",
                    cid: imageId,
                    content: thumbnail
                  });
                  var imageURL = 'http://'+req.headers.host+'/api/classified/'+classified._id+'/images/image/'+imageId+'.jpg';
                  emailMessageInHtml += (imageIdx%3==0?'</td></tr><tr><td colspan="2">':'')
                    + '<a href="'+/*imageURL*/viewClassifiedURL+'">'
                    +'<img src="cid:'+imageId+'"/>'
                    +'</a>&nbsp;&nbsp;';
                }
                emailMessageInHtml += '</td></tr>\n';
              }
              emailMessageInHtml += '</table>\n';
            }

            emailMessageInHtml += '\n<br><p style="color: #D3D3D3;">'+sprintf(translations.get(thisLangKey,'UNSUBSCRIBE_MESSAGE'),'http://'+req.headers.host+'/deregister','http://'+req.headers.host+'/settings')+'</p><br>\n';

            var userEmailsInChunks = [];
            for(var userIdx=0, userEmailsChunk=[]; userIdx<users.length; userIdx++)
            {
              var user = users[userIdx];
              if(user.language==thisLangKey)
              {
                if(userEmailsChunk.length==numberOfEmailAddressesPerEmail) {
                  userEmailsInChunks.push(userEmailsChunk);
                  userEmailsChunk = [];
                }
                userEmailsChunk.push(user.email);
              }
              if(userIdx==users.length-1 && userEmailsChunk.length!=0)
                userEmailsInChunks.push(userEmailsChunk);
            }

            for(var userEmailsInChunksIdx=0; userEmailsInChunksIdx<userEmailsInChunks.length; userEmailsInChunksIdx++)
            {
              var userEmails = userEmailsInChunks[userEmailsInChunksIdx];
              var mailOptions = {
                bcc: config.developmentCatchAllToEmailAddress ? config.developmentCatchAllToEmailAddress : userEmails,
                from: CONSTANTS.WEBSITE_NAME+' <'+config.systemEmail()+'>',
                subject: thisLangSubject,
                html: emailMessageInHtml,
                text: emailMessageInHtml.replace(/<(?:.|\n)*?>/gm, '').replace(/&nbsp;/gi," "),
                attachments: attachments,
              };
              emails.push(mailOptions);

              asyncSendEmailSeriesFunctions.push(function(seriesCallback) {
                var apiMethod = function(retryCallback) {
                  var email = emails.pop();
                  console.log("Emailing:");
                  console.log(email.bcc);
                  smtpTransport.sendMail(email, function(err) {
                    if(err) { emails.push(email); console.error(email); console.error(err); console.error("Mail send didn't work, retrying..."); retryCallback(err); }
                    else
                      retryCallback(null);
                  });
                }
                async.retry({times: 5, interval: 5000}, apiMethod, function(err) {
                  seriesCallback(err);
                });
              });

              if(config.developmentCatchAllToEmailAddress) //in case there are thousands of emails in testing, just send one
                break;
            }
          }
          async.series(asyncSendEmailSeriesFunctions,
            function(err) {
              callback(err);
            });
        },
        function(callback)
        {
          Classified.update({'_id': {$in: classifiedIds}}, {$push: {emailDigests: new Date()}}, { multi: true }, function (err, raw) {
            if(err) callback(err);
            else {
              classifiedSocket.multiplePartialUpdate(req.app.get('socketio').sockets.sockets,classifiedIds,['emailDigests']);
              callback(null);
            }
          });
        }
      ],
      function(err)
      {
        if(err) {
          console.error("There was an error while sending the email digest:");
          console.error(err);
          console.log("------------------------------");
          classifiedSocket.emitToUsersByRole(req.app.get('socketio').sockets.sockets,'admin','emailDigest',{success:false, date: new Date(), classifiedsSelectedForDigest: classifiedsSelectedForDigest, triggeringUser: {_id: user._id, name: user.name, email: user.email}, err: err});
        }
        else {
          console.log("Email digest send finished at "+new Date());
          console.log("------------------------------");
          classifiedSocket.emitToUsersByRole(req.app.get('socketio').sockets.sockets,'admin','emailDigest',{success:true, date: new Date(), classifiedsSelectedForDigest: classifiedsSelectedForDigest, triggeringUser: {_id: user._id, name: user.name, email: user.email}});
        }
      }
    );
  }

  async.waterfall(
    [
      function(callback)
      {
        User
          .find({emailSubscriptions: 'all', verified: true})
          .select('email language')
          .exec(function(err,users) {
            callback(err,users);
          });
      },
      function(users, callback)
      {
        for(var classifiedId in classifiedsSelectedForDigest)
          if(classifiedsSelectedForDigest[classifiedId])
            classifiedIds.push(classifiedId);
        Classified
          .find({'_id': {$in: classifiedIds}})
          .select('title location contact content categories posted images._id images.thumbnail')
          .populate('categories','title')
          .sort('-posted')
          .exec(function(err, classifieds) {
            callback(err,users,classifieds);
          });
      },
      function(users,classifieds,callback)
      {
        sendDigest(users,classifieds);
        callback(null);
      },
    ],
    function(err)
    {
      if(err) {
        var httpCode = 500;
        if(err.httpCode) {
          httpCode = err.httpCode;
          delete err.httpCode
        }
        console.error("There was an error while sending the email digest:");
        console.error(err);
        console.log("------------------------------");
        return res.status(httpCode).send(translateValidationErrors(err, language));
      }
      else {
        res.status(200).send('OK');
      }
    }
  );

};

exports.getImage = function(req, res) {
  req.params.imageId = (req.params.imageId.lastIndexOf(".")>0?req.params.imageId.substring(0,req.params.imageId.lastIndexOf(".")):req.params.imageId);
  Classified
    .findOne({_id: req.params.classifiedId})
    .select('images._id images.image')
    .exec(function (err, classified) {
      if(classified && classified.images.id(req.params.imageId))
      {
        res.contentType("image/jpg");
        return res.send(classified.images.id(req.params.imageId).image.data);
      }
      else
        return res.status(404).send();
    });
};

exports.getThumbnail = function(req, res) {
  req.params.imageId = (req.params.imageId.lastIndexOf(".")>0?req.params.imageId.substring(0,req.params.imageId.lastIndexOf(".")):req.params.imageId);
  Classified
    .findOne({_id: req.params.classifiedId})
    .select('images._id images.thumbnail')
    .exec(function (err, classified) {
      if(classified && classified.images.id(req.params.imageId))
      {
        res.contentType("image/jpg");
        return res.send(classified.images.id(req.params.imageId).thumbnail.data);
      }
      else
        return res.status(404).send();
    });
};

// Get a single classified
exports.show = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';

  async.waterfall(
    [
      function(callback) {
        auth.getCurrentUser(req, function (err, user) {
          callback(null, user);
        });
      },
      function(user)
      {
        getClassified({_id: req.params.id},user,function(err,classified) {
          if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
          if(!classified) { return res.status(404).send({message: translations.get(language,'NOT_FOUND'), translationKey: 'NOT_FOUND'}); }
          return res.json(classified);
        });
      }
    ]
  );
};


exports.flag = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';

  var classifiedId = req.params.id;
  var ipAddress = misc.getIpAddressFromReq(req);

  async.waterfall(
    [
      function(callback) {
        auth.getCurrentUser(req, function (err, user) {
          callback(null, user);
        });
      },
      function(user,callback)
      {
        Classified.findOne({_id: classifiedId}, function (err, classified) {
          callback(err,user,classified);
        });
      },
      function(user,classified,callback)
      {
        if(!classified) { var _err = new ValidationError('NOT_FOUND'); _err.httpCode=404; return callback(_err); }

        if(classified.flagged) {
          var _err = new ValidationError('CLASSIFIED_ALREADY_FLAGGED');
          _err.httpCode=403;
          return callback(_err);
        }

        if(classified.flaggedBy.length>0)
        {
          var alreadyFlagged = false;
          if(user && _.find(_.find(classified.flaggedBy, function(o) { return o.user && String(o.user)==String(user._id); })))
            alreadyFlagged = true;
          else if(_.find(classified.flaggedBy, {ipAddress: ipAddress}))
            alreadyFlagged = true;
          if(alreadyFlagged) {
            var _err = new ValidationError('CLASSIFIED_ALREADY_FLAGGED');
            _err.httpCode=403;
            return callback(_err);
          }
        }

        var flaggedBy = {user: user, ipAddress: ipAddress};
        classified.flaggedBy.push(flaggedBy);

        if(classified.flaggedBy.length>=5)
          classified.flagged=true;

        classified.save(function(err, classified) {
          callback(err, user, classified);
        });
      },
      function(user, classified, callback) {
        getClassified({_id: classified._id},user,function(err,classified) {
          callback(err,classified);
        });
      }
    ],
    function(err, classified)
    {
      if (err) {
        var httpCode = 500;
        if(err.httpCode) {
          httpCode = err.httpCode;
          delete err.httpCode
        }
        return res.status(httpCode).send(translateValidationErrors(err, language));
      }
      else {
        res.status(201).json(classified);
      }
    }

  );
};


// Creates a new classified in the DB.
exports.create = function(req, res) {
  var classifiedAsSubmitted = req.body;
  classifiedAsSubmitted.ipAddress = misc.getIpAddressFromReq(req);
  var userIsLoggedIn = false;
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : 'en');
  var currentUser;
  async.waterfall(
    [
      function(callback) {
        auth.getCurrentUser(req, function (err, user) {
          if(user) {
            currentUser = user;
            classifiedAsSubmitted.email = null;
            classifiedAsSubmitted.user = user;
            userIsLoggedIn = true;
          }
          else
            classifiedAsSubmitted.user = null;
          callback(null);
        });
      },
      function(callback)
      {
        if(!classifiedAsSubmitted.user && classifiedAsSubmitted.email)
        {
          var query  = User.where({ email: classifiedAsSubmitted.email });
          query.findOne(function (err, user) {
            if(err) { callback(err); return; }
            if(user) {
              classifiedAsSubmitted.email = null;
              classifiedAsSubmitted.user = user;
            }
            callback(null);
          });
        }
        else
        {
          callback(null);
        }
      },
      function(callback)
      {
        Category.find({}, function (err, categories) {
          if(err) { callback(err); return; }
          callback(null, categories);
        });
      },
      function(categories, callback)
      {
        if(classifiedAsSubmitted.categories && classifiedAsSubmitted.categories.length>0)
        {
          for(var i=0; i<classifiedAsSubmitted.categories.length; i++)
          {
            var found=false;
            for(var j=0; j<categories.length; j++)
            {
              if(classifiedAsSubmitted.categories[i]._id == categories[j]._id)
              {
                found=true;
                break;
              }
            }
            if(!found)
            {
              callback(new ValidationError('CATEGORIES_INVALID'));
              return;
            }
          }
        }

        if(!classifiedAsSubmitted.user && !classifiedAsSubmitted.email)
        {
          callback(new ValidationError('EMAIL_OR_USER_REQUIRED'));
        }
        else if(!classifiedAsSubmitted.title)
        {
          callback(new ValidationError('TITLE_REQUIRED'));
        }
        else if(classifiedAsSubmitted.title.length>200)
        {
          callback(new ValidationError('TITLE_TOO_LONG'));
        }
        else if(classifiedAsSubmitted.location && classifiedAsSubmitted.location.length>200)
        {
          callback(new ValidationError('LOCATION_TOO_LONG'));
        }
        else if(classifiedAsSubmitted.contact && classifiedAsSubmitted.contact.length>200)
        {
          callback(new ValidationError('CONTACT_TOO_LONG'));
        }
        else if(!classifiedAsSubmitted.content)
        {
          callback(new ValidationError('CONTENT_REQUIRED'));
        }
        else if(classifiedAsSubmitted.content && /<[a-z][\s\S]*>/i.test(classifiedAsSubmitted.content))
        {
          callback(new ValidationError('CONTENT_HAS_HTML'));
        }
        else if(!classifiedAsSubmitted.categories || classifiedAsSubmitted.categories.length==0)
        {
          callback(new ValidationError('CATEGORIES_REQUIRED'));
        }
        else if(classifiedAsSubmitted.categories.length>categories.length)
        {
          callback(new ValidationError('CATEGORIES_INVALID'));
        }
        else if(classifiedAsSubmitted.content.length>5000)
        {
          callback(new ValidationError('CONTENT_TOO_LONG'));
        }
        else if(classifiedAsSubmitted.email && classifiedAsSubmitted.email.length>200)
        {
          callback(new ValidationError('EMAIL_TOO_LONG'));
        }
        else if(classifiedAsSubmitted.email && !misc.validateEmail(classifiedAsSubmitted.email))
        {
          callback(new ValidationError('INVALID_EMAIL'));
        }
        else if(classifiedAsSubmitted.images && classifiedAsSubmitted.images.length>10)
        {
          callback(new ValidationError('IMAGE_UPLOAD_ERROR_maxFiles'));
        }
        else
          callback(null);
      },
      function(callback)
      {
        if(classifiedAsSubmitted.user && userIsLoggedIn && (classifiedAsSubmitted.user.approved || classifiedAsSubmitted.user.role=='admin'))
          classifiedAsSubmitted.posted = new Date();
        else
          classifiedAsSubmitted.posted = null;

        if(classifiedAsSubmitted.removedImages && Object.prototype.toString.call(classifiedAsSubmitted.removedImages) === '[object Array]') {
          for (var i = 0; i < classifiedAsSubmitted.removedImages.length; i++) {
            var imageFile = classifiedAsSubmitted.removedImages[i];
            var extIndex = imageFile.lastIndexOf('.');
            var imageFileNoExt = imageFile.substr(0,(extIndex < 0 ? imageFile.length: extIndex));
            var imageThumbnailFile = imageFileNoExt+"_thumbnail.jpg";
            var osTmpDir = os.tmpDir(); osTmpDir = osTmpDir + (osTmpDir.substring(osTmpDir.length-1) == path.sep ? '': path.sep);
            var imageFileFullPath = osTmpDir + imageFile;
            var imageThumbnailFileFullPath = osTmpDir + imageThumbnailFile;

            if(fs.existsSync(imageFileFullPath))
              fs.unlink(imageFileFullPath);
            if(fs.existsSync(imageThumbnailFileFullPath))
              fs.unlink(imageThumbnailFileFullPath);
          }
          delete classifiedAsSubmitted.removedImages;
        }

        if(classifiedAsSubmitted.images && Object.prototype.toString.call( classifiedAsSubmitted.images ) === '[object Array]') {
          var images = [];
          for (var i = 0; i < classifiedAsSubmitted.images.length; i++) {
            var imageFile = classifiedAsSubmitted.images[i];
            var extIndex = imageFile.lastIndexOf('.');
            var imageFileNoExt = imageFile.substr(0,(extIndex < 0 ? imageFile.length: extIndex));
            var imageThumbnailFile = imageFileNoExt+"_thumbnail.jpg";
            var osTmpDir = os.tmpDir(); osTmpDir = osTmpDir + (osTmpDir.substring(osTmpDir.length-1) == path.sep ? '': path.sep);
            var imageFileFullPath = osTmpDir + imageFile;
            var imageThumbnailFileFullPath = osTmpDir + imageThumbnailFile;

            if(fs.existsSync(imageFileFullPath) && fs.existsSync(imageThumbnailFileFullPath))
            {
              var imageFileLoaded = fs.readFileSync(imageFileFullPath);
              var imageThumbnailFileLoaded = fs.readFileSync(imageThumbnailFileFullPath);

              images.push(
                {
                  image: {data:imageFileLoaded},
                  thumbnail: {data:imageThumbnailFileLoaded}
                }
              );

              fs.unlink(imageFileFullPath);
              fs.unlink(imageThumbnailFileFullPath);
            }
          }
          delete classifiedAsSubmitted.images;
          classifiedAsSubmitted.images = images;
        }

        var classified  = new Classified;
        for (var key in classifiedAsSubmitted) {
          if (classifiedAsSubmitted.hasOwnProperty(key)) {
            classified[key] = classifiedAsSubmitted[key];
          }
        }

        Classified.create(classifiedAsSubmitted, function(err, classified) {
          if (err) { callback(err); return; }
          callback(null, classified);
        });
      },
    ],
    function(err, classified) {
      if(err) {
        return res.status(422).send(translateValidationErrors(err,language));
      }
      else {
        getClassified({_id: classified._id},currentUser,function(err,classified) {
          if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
          res.status(201).json(classified);
        });
      }
    }
  );

};

// Updates an existing classified in the DB.
exports.update = function(req, res) {
  var user = req.user;
  var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (user&&user.language?user.language:'en'));
  if(req.body._id) { delete req.body._id; }
  Classified.findById(req.params.id, function (err, classified) {
    if (err) { return res.status(500).send(translateValidationErrors(err,language)); }
    if(!classified) { return res.status(404).send({message: translations.get(language,'NOT_FOUND'), translationKey: 'NOT_FOUND'}); }
    if(user.role!='admin' && String(user._id)!=String(classified.user)) { return res.status(401).send({message:translations.get(language,'UNAUTHORIZED') ,translationKey: 'UNAUTHORIZED'}); }
    for(var key in req.body)
    {
      classified[key] = req.body[key];
      classified.markModified(key);
    }
    classified.save(function (err) {
      if (err) { return res.status(500).send(translateValidationErrors(err,language)); }
      getClassified({_id: classified._id},user,function(err,classified) {
        if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
        res.status(200).json(classified);
      });
    });
  });
};

exports.multipleUpdate = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';

  var classifiedIds = req.body.classifiedIds;
  var fields = req.body.fields;

  Classified.update({'_id': {$in: classifiedIds}}, fields, { multi: true }, function (err, raw) {
    if (err) { return res.status(500).send(translateValidationErrors(err,language)); }
    var fieldsArray = [];
    for(var field in fields)
      fieldsArray.push(field);
    classifiedSocket.multiplePartialUpdate(req.app.get('socketio').sockets.sockets,classifiedIds,fieldsArray);
    res.status(200).send('OK');
  });
}


exports.multipleRemove = function(req, res) {
  var language = req&&req.cookies&&req.cookies.language?req.cookies.language:'en';

  var classifiedIds = req.body.classifiedIds;

  Classified.remove({'_id': {$in: classifiedIds}}, function (err, raw) {
    if (err) { return res.status(500).send(translateValidationErrors(err,language)); }
    classifiedSocket.multipleRemove(req.app.get('socketio').sockets.sockets,classifiedIds);
    res.status(200).send('OK');
  });

}


// Removes a classified from the DB.
exports.remove = function(req, res) {
  Classified.findById(req.params.id, function (err, classified) {
    if(err) { return res.status(500).send(translateValidationErrors(err,req&&req.cookies&&req.cookies.language?req.cookies.language:'en')); }
    var user = req.user;
    var language = (req&&req.cookies&&req.cookies.language ? req.cookies.language : (user&&user.language?user.language:'en'));
    if(!classified) { return res.status(500).send(translateValidationErrors(new ValidationError('NOT_FOUND'),language)); }
    if(user._id == String(classified.user) || user.role=='admin')
    {
      classified.remove(function(err) {
        if(err) { return res.status(500).send(translateValidationErrors(err,language)); }
        return res.status(204).send({message: translations.get(language,'SUCCESS'), translationKey: 'SUCCESS'});
      });
    }
    else { return res.status(401).send({message:translations.get(language,'UNAUTHORIZED') ,translationKey: 'UNAUTHORIZED'}); }
  });
};

