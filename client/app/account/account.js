'use strict';

angular.module('classActApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl',
        title: 'Login'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl',
        title: 'SIGN_UP'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true,
        title: 'SETTINGS_TITLE'
      })
      .state('verify', {
        url: '/verify/:userId/:verificationToken',
        templateUrl: 'app/account/verify/verify.html',
        controller: 'VerifyCtrl',
        title: 'VERIFICATION'
      })
      .state('reset-password', {
        url: '/reset-password',
        templateUrl: 'app/account/reset-password/reset-password.html',
        controller: 'ResetPasswordCtrl',
        title: 'RESET_PASSWORD'
      })
      .state('reset-password-with-parameters', {
        url: '/reset-password/:userId/:resetPasswordToken',
        templateUrl: 'app/account/reset-password/reset-password.html',
        controller: 'ResetPasswordCtrl',
        title: 'RESET_PASSWORD'
      })
      .state('deregister', {
        url: '/deregister',
        templateUrl: 'app/account/deregister/deregister.html',
        controller: 'DeregisterCtrl',
        title: 'DEREGISTER'
      })
      .state('deregister-with-parameters', {
        url: '/deregister/:userId/:deregisterToken',
        templateUrl: 'app/account/deregister/deregister.html',
        controller: 'DeregisterCtrl',
        title: 'DEREGISTER'
      });



  });
