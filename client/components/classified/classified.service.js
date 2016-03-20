'use strict';

angular.module('classActApp')
  .factory('Classified', function Classified($location, $rootScope, ClassifiedResource, $q, $window, socket, $translate, translations, Upload, $http, notify, Misc) {
    var currentUser = {};

    var postedClassifieds = [];
    var postedClassifiedsLoaded = false;
    var userClassifieds = [];
    var userClassifiedsLoaded = false;
    var categoriesHashMap = {};

    var selectedCategories = [];
    var searchKeywords = "";

    var replaceOrInsertInArray = Misc.replaceOrInsertInArray;
    var updateInArrayIfExists = Misc.updateInArrayIfExists;

    $rootScope.$on('classified:multiplePartialUpdate', function (event, data) {
      var cb = data.callback || angular.noop;
      var classifieds = data.classifieds;

      if(postedClassifiedsLoaded) {
        for(var i=0; i<classifieds.length; i++)
          updateInArrayIfExists(postedClassifieds, classifieds[i]);
      }

      if(userClassifiedsLoaded) {
        for(var i=0; i<classifieds.length; i++)
          updateInArrayIfExists(userClassifieds, classifieds[i]);
      }

      cb();
    });

    $rootScope.$on('classified:save', function (event, data) {
      var cb = data.callback || angular.noop;
      var classified = data.classified;

      if((classified.posted && postedClassifiedsLoaded) || (!classified.posted && postedClassifiedsLoaded && _.find(postedClassifieds,{_id:classified._id}))) {
        //console.log("Classified service: classified:save event received, replacing or inserting in postedClassifieds");
        replaceOrInsertInArray(postedClassifieds, classified, false);
        //console.log("New postedClassifieds array:");
        //console.log(postedClassifieds);
      }

      if(classified.user && currentUser._id && String(classified.user._id) == String(currentUser._id) && userClassifiedsLoaded) {
        //console.log("Classified service: classified:save event received, replacing or inserting in userClassifieds");
        replaceOrInsertInArray(userClassifieds, classified, false);
        //console.log("New userClassifieds array:");
        //console.log(userClassifieds);
      }

      cb();
    });

    $rootScope.$on('classified:multipleRemove', function (event, data) {
      var cb = data.callback || angular.noop;
      var classifiedIds = data.classifiedIds;

      for(var i=0; i<classifiedIds.length; i++)
      {
        _.remove(postedClassifieds, {_id: classifiedIds[i]});
        _.remove(userClassifieds, {_id: classifiedIds[i]});
      }

      cb();
    });

    $rootScope.$on('classified:remove', function (event, data) {
      var cb = data.callback || angular.noop;
      var classified = data.classified;

      //console.log("Classified service: classified:remove event received, removing from all arrays: "+classified._id);

      _.remove(postedClassifieds, {_id: classified._id});
      _.remove(userClassifieds, {_id: classified._id});

      //console.log("New postedClassifieds array:");
      //console.log(postedClassifieds);
      //console.log("New userClassifieds array:");
      //console.log(userClassifieds);

      cb();
    });

    var setUpCategories = function(categoriesList)
    {
      var categoriesHashMap = {};
      for (var i = 0; i < categoriesList.length; i++) {
        for (var j = 0; j < categoriesList[i].title.length; j++) {
          var language = categoriesList[i].title[j].language;
          var categoryId = "category" + categoriesList[i]._id;
          var categoryTitle = categoriesList[i].title[j].value;
          translations[language][categoryId] = categoryTitle;
        }
        categoriesHashMap[categoriesList[i]._id] = categoriesList[i];
      }
      $translate.refresh();
      return categoriesHashMap;
    }

    var Classified = {

      setSelectedCategories: function(_selectedCategories) {
        selectedCategories = _selectedCategories;
      },

      getSelectedCategories: function() {
        return selectedCategories;
      },

      setSearchKeywords: function(_searchKeywords) {
        searchKeywords = _searchKeywords;
      },

      getSearchKeywords: function() {
        return searchKeywords;
      },

      getThumbnailUrl: function(classifiedId,imageId)
      {
        var url = ClassifiedResource.Image.getThumbnail.url.replace(":classifiedId",classifiedId).replace(":imageId",imageId)+".jpg";
        return url;
      },

      getImageUrl: function(classifiedId,imageId)
      {
        var url = ClassifiedResource.Image.getImage.url.replace(":classifiedId",classifiedId).replace(":imageId",imageId)+".jpg";
        return url;
      },

      arrayBufferToBase64: function(buffer) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
        }
        return btoa( binary );
      },

      registerUser: function(_currentUser,callback) {
        var cb = callback || angular.noop;
        currentUser = _currentUser;
        userClassifieds = [];
        userClassifiedsLoaded = false;
        postedClassifieds = [];
        postedClassifiedsLoaded = false;
        selectedCategories = [];
        searchKeywords = "";
        //console.log("userClassifieds cleared, user registered: "+currentUser._id);
        return cb();
      },

      postClassified: function(classified, callback) {
        var cb = callback || angular.noop;

        return ClassifiedResource.WithId.save(classified,
          function(classified) {
            if(!socket.isConnected())
              $rootScope.$broadcast('classified:save', {classified: classified});
            return cb(classified);
          },
          function(err) {
            return cb(err);
          }.bind(this)).$promise;
      },

      getCategories: function(callback) {
        var cb = callback || angular.noop;
        if(Object.keys(categoriesHashMap).length==0)
        {
          //console.log("Loading categories from webservice");
          ClassifiedResource.Categories.query(
            function(categoriesList) {
              categoriesHashMap = setUpCategories(categoriesList);
              callback(categoriesHashMap);
            });
        }
        else {
          //console.log("Sending already-loaded categories");
          callback(categoriesHashMap);
        }
      },

      getPosted: function(callback) {
        var cb = callback || angular.noop;

        if(postedClassifiedsLoaded) {
          //console.log("Sending already-loaded postedClassifieds");
          return cb(postedClassifieds);
        }
        else {
          return ClassifiedResource.Posted.query(
              function (_postedClassifieds) {
                //console.log("Loading postedClassifieds from webservice");
                postedClassifieds = _postedClassifieds;
                postedClassifiedsLoaded = true;
                return cb(postedClassifieds);
              },
              function (err) {
                return cb(err);
              }).$promise;
        }
      },

      getMorePosted: function(window,callback) {
        var cb = callback || angular.noop;

        if(!postedClassifiedsLoaded || postedClassifieds.length==0)
          cb(null, 0);
        else {
          return ClassifiedResource.Posted.query(
            {startTime: new Date(postedClassifieds[postedClassifieds.length-1].posted).getTime(),window: window},
            function (_postedClassifieds) {
              //console.log("Loading more postedClassifieds from webservice, from before startTime="+postedClassifieds[postedClassifieds.length-1].posted);
              for(var i=0; i<_postedClassifieds.length; i++)
                replaceOrInsertInArray(postedClassifieds,_postedClassifieds[i],true);
              return cb(null,_postedClassifieds.length);
            },
            function (err) {
              return cb(err);
            }).$promise;
        }
      },

      getForUser: function(callback) {
        var cb = callback || angular.noop;

        if(userClassifiedsLoaded) {
          //console.log("Sending already-loaded userClassifieds");
          return cb(userClassifieds);
        }
        else {
          return ClassifiedResource.User.query(
            function (_userClassifieds) {
              //console.log("Loading userClassifieds from webservice");
              userClassifieds = _userClassifieds;
              userClassifiedsLoaded = true;
              return cb(userClassifieds);
            },
            function (err) {
              return cb(err);
            }).$promise;
        }
      },

      removeClassified: function(classified, opts, callback) {
        var cb = callback || angular.noop;

        return ClassifiedResource.WithId.remove({ id: classified._id },
          function() {
            if(!socket.isConnected())
              $rootScope.$broadcast('classified:remove', {classified: classified});

            if(opts && opts.showNotification)
            {
              notify.config({
                startTop: 75,
                duration: 5000,
                position: 'center'
              });
              notify({
                message: $translate.instant('CLASSIFIED_REMOVED',{title:classified.title})
              });
            }
            return cb();
          },
          function(err) {
            if(opts && opts.showNotification)
            {
              notify.config({
                startTop: 75,
                duration: 0,
                position: 'center'
              });
              notify({
                message: $translate.instant('CLASSIFIED_REMOVE_ERROR',{title: classified.title,message: err.data.message})
              });
            }
            return cb(err);
          }).$promise;
      },

      flag: function(classified, opts, callback) {
        var cb = callback || angular.noop;

        return ClassifiedResource.WithId.flag({ id: classified._id }, null, function(_classified) {
          if(!socket.isConnected()) {
            classified.flaggedBy = _classified.flaggedBy;
            classified.flagged = _classified.flagged;
          }
          if(opts && opts.showNotification) {
            notify.config({
              startTop: 75,
              duration: 5000,
              position: 'center'
            });
            notify({
              message: $translate.instant('CLASSIFIED_FLAGGED')
            });
          }
          return cb();
        }, function(err) {
          if(opts && opts.showNotification) {
            var errorTranslationKey = 'ERROR_PROCESSING_REQUEST';
            if(err.data && err.data.translationKey && err.data.translationKey=='CLASSIFIED_ALREADY_FLAGGED')
              errorTranslationKey = 'CLASSIFIED_ALREADY_FLAGGED';
            notify.config({
              startTop: 75,
              duration: 0,
              position: 'center'
            });
            notify({
              message: $translate.instant(errorTranslationKey)
            });
          }
          return cb(err);
        }).$promise;
      },

      update: function(classified, fields, callback) {
        var cb = callback || angular.noop;

        return ClassifiedResource.WithId.update(
          { id: classified._id },
          fields,
          function(savedClassified) {
            if(!socket.isConnected()) {
              for (var key in savedClassified) {
                if (savedClassified.hasOwnProperty(key) && classified.hasOwnProperty(key)) {
                  classified[key] = savedClassified[key];
                }
              }
            }
            return cb(null, savedClassified);
          },
          function(err) {
            return cb(err, null);
          }
        ).$promise;
      },

      multipleUpdate: function(classifiedIds, fields, callback) {
        var cb = callback || angular.noop;

        return ClassifiedResource.MultipleUpdate.save(
          {classifiedIds: classifiedIds, fields: fields},
          function(data) {
            if(!socket.isConnected())
            {
              var classifieds = [];
              for(var i=0; i<classifiedIds.length; i++)
              {
                var classified = {};
                classified._id = classifiedIds[i];
                for(var key in fields)
                  classified[key] = fields[key];
                classifieds.push(classified);
              }
              $rootScope.$broadcast('classified:multiplePartialUpdate', {
                classifieds: classifieds,
              });
            }
            return cb(null, data);
          },
          function(err) {
            return cb(err, null);
          }
        ).$promise;
      },

      multipleRemove: function(classifiedIds, callback) {
        var cb = callback || angular.noop;

        return ClassifiedResource.MultipleRemove.save(
          {classifiedIds: classifiedIds},
          function(data) {
            if(!socket.isConnected())
            {
              $rootScope.$broadcast('classified:multipleRemove', {
                classifiedIds: classifiedIds,
              });
            }
            return cb(null, data);
          },
          function(err) {
            return cb(err, null);
          }
        ).$promise;
      },

      /*resizeImage: function(image, width, height, quality, callback) {
        callback = callback || angular.noop;
        Upload.resize(image, width, height, quality)
          .then(function(resizedFile) {
            callback(resizedFile)
          });
      },*/

      uploadImage: function(image, uploadCompleteFunction, errorFunction, progressFunction) {
        uploadCompleteFunction = uploadCompleteFunction || angular.noop;
        errorFunction = errorFunction || angular.noop;
        progressFunction = progressFunction || angular.noop;

        image.upload = Upload.upload({
          url: ClassifiedResource.Image.upload.url,
          data: {image: image }
        });

        image.upload.then(function (response) {
          uploadCompleteFunction(response);
        }, function (response) {
          errorFunction(response);
        }, function (evt) {
          progressFunction(evt);
        });
      },

      rotateImageOnServer: function(image,orientation,callback)
      {
        var thumbnail = image.thumbnail;
        image.thumbnail = "";

        image.rotationUnderway = true;

        $http({
          method: 'GET',
          url: ClassifiedResource.Image.rotate.url.replace(":imageFile",image.result).replace(":orientation",orientation)
        }).then(function successCallback(response) {
          image.rotationUnderway = false;
          image.thumbnail = response.data.thumbnail;
          callback(null);
        }, function errorCallback(response) {
          image.rotationUnderway = false;
          image.thumbnail = thumbnail;
          callback(response.data);
        });

      }

    };

    return Classified;
  });
