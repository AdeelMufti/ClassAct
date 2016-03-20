'use strict';

angular.module('classActApp')
  .controller('ResetPasswordCtrl', function ($scope, $location, $window, $translate, $stateParams, User, $state) {
    $scope.errors = {};

    $scope.signupUrl = $state.get('signup').url;

    $scope.userId = $stateParams.userId;
    $scope.resetPasswordToken = $stateParams.resetPasswordToken;

    $scope.generateResetPasswordToken = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        User.Misc.generateResetPasswordToken(
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

    $scope.resetPassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        User.Misc.resetPassword(
          null,
          { userId: $scope.userId, resetPasswordToken: $scope.resetPasswordToken, newPassword: $scope.newPassword },
          function() {
            $scope.success = true;
            $scope.message = $translate.instant('RESET_PASSWORD_COMPLETE');
          },
          function(err) {
            if(err.data && err.data.translationKey)
              $scope.message = $translate.instant(err.data.translationKey,{signupUrl:$scope.signupUrl});
            else
              $scope.message = $translate.instant('ERROR_PROCESSING_REQUEST');
          }
        );
      }
    };


  });
