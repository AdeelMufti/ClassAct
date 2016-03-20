'use strict';

angular.module('classActApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window, CONSTANTS, notify, $translate, $state) {
    $scope.CONSTANTS = CONSTANTS;
    $scope.user = {};
    $scope.errors = {};

    $scope.settingsUrl = $state.get('settings').url;

    $scope.translationData = {
      WEBSITE_NAME: CONSTANTS.WEBSITE_NAME
    };

    $scope.register = function(form, emailOnly) {
      if(!emailOnly) {
        $scope.submitted = true;
        $scope.emailOnlySubmitted = false;
      }
      else {
        $scope.submitted = false;
        $scope.emailOnlySubmitted = true;
      }

      if(form.$valid) {
        Auth.createUser({
          name: (emailOnly) ? null : $scope.user.name,
          email: (emailOnly) ? $scope.user.emailOnly : $scope.user.email,
          password: (emailOnly) ? null : $scope.user.password,
          language: $translate.use().substring(0,2)
        })
        .then( function() {

            async.waterfall(
              [
                function(callback)
                {
                  Auth.isLoggedInAsync(function(loggedIn) {
                    if(loggedIn) callback(null);
                    else callback(true);
                  });
                },
                function(callback)
                {
                  Auth.postLoginProcessing(function() {
                    callback(null);
                  });
                }
              ],
              function(err)
              {
                notify.config({
                  startTop:75,
                  duration:30000,
                  position:'center',
                });
                notify({
                  //message:$translate.instant('REGISTRATION_COMPLETE'),
                  messageTemplate:"<span>"+$translate.instant('REGISTRATION_COMPLETE') + " " + $translate.instant('ACCOUNT_NOT_VERIFIED_MESSAGE') + (Auth.isLoggedIn() && !Auth.getCurrentUser().approved && CONSTANTS.AUTO_APPROVE_VERIFIED_USER?" "+$translate.instant('NOT_VERIFIED_WITH_AUTO_APPROVE_ENABLED',{settingsUrl: $scope.settingsUrl}):"")+"</span>"
                });
                $location.path('/');
              }
            );
          })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            if(field=='hashedPassword') field='password';
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });

            if(!err.errors && err.message)
              form.serverErrorMessage = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
