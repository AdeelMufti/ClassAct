'use strict';

angular.module('classActApp')
  .controller('DeregisterCtrl', function ($scope, Auth, $location, $window, $translate, CONSTANTS, $stateParams, User, socket) {
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.CONSTANTS = CONSTANTS;

    $scope.errors = {};

    $scope.userId = $stateParams.userId;
    $scope.deregisterToken = $stateParams.deregisterToken;

    $scope.donotDeregister = function() {
      $location.path('/');
    }

    $scope.generateDeregisterToken = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        User.Misc.generateDeregisterToken(
          null,
          { email: $scope.email },
          function() {
            $scope.success = true;
            $scope.message = $translate.instant('REQUEST_SUBMITTED');
          },
          function(err) {
            form.email.$setValidity('mongoose', false);
            $scope.message = '';
            if(err.data && err.data.translationKey)
              $scope.errors.server = $translate.instant(err.data.translationKey);
            else
              $scope.errors.server = $translate.instant('ERROR_PROCESSING_REQUEST');
          }
        );
      }
    };

    $scope.deregister = function() {
      $scope.submitted = true;
      User.Misc.deregister(
        null,
        { userId: ($scope.userId?$scope.userId:Auth.getCurrentUser()._id), deregisterToken: $scope.deregisterToken },
        function() {
          $scope.success = true;
          $scope.message = $translate.instant('DEREGISTER_COMPLETE');

          Auth.isLoggedInAsync(function(loggedIn) {
            if(loggedIn && !socket.isConnected()) {
              Auth.logout(null, function () {
                $scope.$apply();
              });
            }
          });
        },
        function(err) {
          if(err.data && err.data.translationKey)
            $scope.message = $translate.instant(err.data.translationKey);
          else
            $scope.message = $translate.instant('ERROR_PROCESSING_REQUEST');
        }
      );
    };

  });
