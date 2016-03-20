'use strict';

angular.module('classActApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $window, notify, $translate, $state, CONSTANTS) {
    $scope.user = {};
    $scope.errors = {};

    $scope.signupUrl = $state.get('signup').url;

    if($location.search() && $location.search().error)
    {
      $scope.errors.other=$translate.instant($location.search().error);
      $location.url($location.path());
    }

    $scope.resetPasswordUrl = $state.get('reset-password').url;
    $scope.settingsUrl = $state.get('settings').url;

    $scope.login = function(form) {

      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
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
                },
                function()
                {
                  var user = Auth.getCurrentUser();

                  if(user.verified != true && !Auth.isAdmin())
                  {
                    notify.config({
                      startTop:75,
                      duration:30000,
                      position:'center'
                    });
                    notify({
                      messageTemplate:"<span>"+$translate.instant('ACCOUNT_NOT_VERIFIED_MESSAGE') + (!user.approved && CONSTANTS.AUTO_APPROVE_VERIFIED_USER?" "+$translate.instant('NOT_VERIFIED_WITH_AUTO_APPROVE_ENABLED',{settingsUrl: $scope.settingsUrl}):"")+"</span>"
                    });
                  }

                  $location.path('/');
                }
              ]
            );
        })
        .catch( function(err) {
            if(err.translationKey=='EMAIL_ONLY_USER')
              $scope.errors.other = $translate.instant('EMAIL_ONLY_USER',{signupUrl:$scope.signupUrl});
            else
              $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
