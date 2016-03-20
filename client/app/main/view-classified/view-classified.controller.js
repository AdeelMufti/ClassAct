;'use strict';

angular.module('classActApp')
  .controller('ViewClassifiedCtrl', function ($scope, $window, $location, $translate, CONSTANTS, $state, $stateParams, Classified, ClassifiedResource, $rootScope, Auth, Modal, $timeout) {
    $scope.CONSTANTS = CONSTANTS;
    $scope.Auth = Auth;

    $scope.adminDetailsExpanded = true;

    if($rootScope.previousState && $rootScope.previousState.name && $rootScope.previousState.url && $rootScope.previousState.url != "^")
      $scope.hasPreviousState=true;

    $scope.goBack = function() {
      $window.history.back();
    }

    var classifiedId = $scope.classifiedId = $stateParams.classifiedId;

    $scope.viewClassifiedUrl = $state.get('view-classified').url.replace("\/:classifiedId","");

    $scope.categoriesHashMap = {};
    //$scope.classified = "";
    $scope.error="";

    Classified.getCategories(function(categoriesHashMap) {
      $scope.categoriesHashMap = categoriesHashMap;
    });

    ClassifiedResource.WithId.get({ id: classifiedId },
      function(classified) {
        $scope.classifieds=[classified];
        $timeout(function () {
          $rootScope.pageTitle = $rootScope.pageTitle + " - "+classified.title;
        });
      },
      function(err) {
        if(err.data && err.data.translationKey)
          $scope.error=$translate.instant(err.data.translationKey);
        else
          $scope.error=$translate.instant('ERROR_PROCESSING_REQUEST');
      });

    $scope.removeClassified = Modal.confirm.remove(function(classified) {
      Classified.removeClassified(classified, {showNotification: true})
        .then( function() {
          if($scope.hasPreviousState)
            $window.history.back();
          else
            $location.path('/');
        })
        .catch( function(err) {
          $scope.error = $translate.instant('CLASSIFIED_REMOVE_ERROR',{title:classified.title, message: err.data.message})
        });
    });

    $scope.flagClassified = Modal.confirm.flag(function(classified) {
      Classified.flag(classified,{showNotification: true});
    });

    $scope.arrayBufferToBase64 = Classified.arrayBufferToBase64;

    $scope.getImageUrl = Classified.getImageUrl;

    $scope.shouldContentBeCollapsed = function(content) {
      return false;
    }

  });
