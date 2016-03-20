'use strict';

angular.module('classActApp')
  .controller('AdminEmailDigestCtrl', function ($scope, $state, Admin, Classified, $timeout, Modal, $translate, CONSTANTS, translations, moment, ClassifiedResource, notify, /*blockUI,*/ socket) {

    $scope.viewClassifiedUrl = $state.get('view-classified').url.replace("\/:classifiedId","");

    $scope.classifieds = [];

    var stateVariables = Admin.getStateVariables();

    function setupDigestLanguages() {
      stateVariables.digestLanguages = [];
      stateVariables.digestSubjects = {};
      stateVariables.digestOptionalMessages = {};
      for(var key in translations) {
        stateVariables.digestLanguages.push({key: key, name: translations[key]['THIS_LANGUAGE_NAME']});
        var currentLocale = moment.locale();
        moment.locale(key);
        stateVariables.digestSubjects[key] = translations[key]['DEFAULT_DIGEST_EMAIL_SUBJECT'].replace("{{WEBSITE_NAME}}",CONSTANTS.WEBSITE_NAME).replace("{{date}}",moment(new Date()).format("LL"));
        moment.locale(currentLocale);
      }
    };
    function copyDigestLanguagesToScope() {
      $scope.digestLanguages = stateVariables.digestLanguages;
      $scope.digestSubjects = stateVariables.digestSubjects;
      $scope.digestOptionalMessages = stateVariables.digestOptionalMessages;
    }
    if(!stateVariables.digestLanguages) {
      setupDigestLanguages();
      copyDigestLanguagesToScope();
    }
    else
    {
      copyDigestLanguagesToScope();
    }

    if(!stateVariables.classifiedsSelectedForDigest)
      stateVariables.classifiedsSelectedForDigest = {};
    $scope.classifiedsSelectedForDigest = stateVariables.classifiedsSelectedForDigest;
    $scope.toggleSelect = function($event,classified) {
      if($event.target.id!='classifiedCheckBox' && $event.target.id!='classifiedTitle')
      {
        if($scope.classifiedsSelectedForDigest[classified._id]) {
          $scope.selectAll = false;
          delete $scope.classifiedsSelectedForDigest[classified._id];
        }
        else
          $scope.classifiedsSelectedForDigest[classified._id] = true;
      }
    }

    $scope.selectAll = false;
    $scope.toggleSelectAll = function() {
      if($scope.selectAll)
      {
        for(var i=0; i<$scope.classifieds.length; i++)
        {
          var classified = $scope.classifieds[i];
          $scope.classifiedsSelectedForDigest[classified._id] = true;
        }
      }
      else
      {
        $scope.classifiedsSelectedForDigest = stateVariables.classifiedsSelectedForDigest = {};
      }
    }

    $scope.selectAllNeverSent = function() {
      for(var i=0; i<$scope.classifieds.length; i++)
      {
        var classified = $scope.classifieds[i];
        if(!classified.emailDigests || classified.emailDigests.length==0)
          $scope.classifiedsSelectedForDigest[classified._id] = true;
      }

    }

    $scope.filterFunction = function(classified) {
      if(classified.posted)
        return true;
      else
        return false;
    }

    $scope.initialLoadDone = false;
    $scope.getMorePosted = function(window) {
      if($scope.loadingClassifieds) return;

      $scope.loadingClassifieds = true;

      if(!$scope.initialLoadDone) {
        Classified.getPosted(function (classifieds) {
          $scope.classifieds = classifieds;
          $scope.loadingClassifieds = false;
          $scope.initialLoadDone = true;
        });
      }
      else
      {
        var filteredClassifiedOriginalCount = $scope.filteredClassifieds.length;
        var apiMethod = function(callback) {
          Classified.getMorePosted(window,function(err,numberOfClassifiedsGotten) {
            $timeout(function(){
              $scope.selectAll = false;
              if (numberOfClassifiedsGotten == 0 || window == 0) {
                $scope.noMoreClassifieds = true;
                $scope.loadingClassifieds = false;
              }
              else if($scope.filteredClassifieds.length!=filteredClassifiedOriginalCount)
              {
                $scope.loadingClassifieds = false;
              }
              if($scope.loadingClassifieds)
                return callback(true);
              else
                return callback(null);
            },0,false);
          });
        }
        async.retry({times: 99999, interval: 0}, apiMethod, function() {});
      }
    }

    $scope.countSelected = function()
    {
      var count=0;
      for(var _id in $scope.classifiedsSelectedForDigest) {
        if ($scope.classifiedsSelectedForDigest.hasOwnProperty(_id) && !$scope.classifiedsSelectedForDigest[_id]) {
          $scope.selectAll = false;
          delete $scope.classifiedsSelectedForDigest[_id];
        }
        else if ($scope.classifiedsSelectedForDigest.hasOwnProperty(_id) && $scope.classifiedsSelectedForDigest[_id]) {
          count++;
        }
      }
      return count;
    }

    $scope.sendEmailDigest = function() {
      var selectedCount = $scope.countSelected();
      Modal.confirm.generic(function() {

        //blockUI.start($translate.instant('SENDING_EMAIL_DIGEST')+"...");
        ClassifiedResource.EmailDigest.save(
          {
            digestLanguages: $scope.digestLanguages,
            digestSubjects: $scope.digestSubjects,
            digestOptionalMessages: $scope.digestOptionalMessages,
            classifiedsSelectedForDigest: $scope.classifiedsSelectedForDigest,
          },
          function(data) {
            //blockUI.stop();

            if(!socket.isConnected())
            {
              for(var key in $scope.classifiedsSelectedForDigest) {
                var classified = _.find($scope.classifieds,{_id: key});
                if(classified) {
                  if (classified.emailDigests) classified.emailDigests.push(new Date());
                  else classified.emailDigests = [new Date];
                }
              }
            }

            $scope.selectAll = false;
            $scope.classifiedsSelectedForDigest = stateVariables.classifiedsSelectedForDigest = {};
            setupDigestLanguages();
            copyDigestLanguagesToScope();

            notify.config({
              startTop: 75,
              duration: 10000,
              position: 'center'
            });
            notify({
              message: $translate.instant("EMAIL_DIGEST_TRIGGERED")
            });
          },
          function(err) {
            //blockUI.stop();

            console.error(err);
            var message = '';
            if(err.data && err.data.message)
              message = err.data.message;
            else if(err.message)
              message = err.message;
            else
              message = JSON.stringify(err);
            notify.config({
              startTop: 75,
              duration: 0,
              position: 'center'
            });
            notify({
              message: $translate.instant('EMAIL_DIGEST_SEND_ERROR',{message:message})
            });
          }
        );

      })('PLEASE_CONFIRM','EMAIL_DIGEST_SEND_CONFIRM',{selectedCount: selectedCount});

    }

  });
