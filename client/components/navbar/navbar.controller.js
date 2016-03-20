'use strict';

angular.module('classActApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, $translate, $state, Classified, CONSTANTS) {
    $scope.CONSTANTS = CONSTANTS;

    $scope.postClassifiedUrl = $state.get('post-classified').url;
    $scope.aboutUrl =  $state.get('about').url;
    $scope.adminClassifiedUrl =  $state.get('admin-classified').url;
    $scope.adminUserUrl =  $state.get('admin-user').url;
    $scope.adminEmailDigestUrl =  $state.get('admin-email-digest').url;
    $scope.adminMiscellaneousUrl =  $state.get('admin-miscellaneous').url;
    $scope.signupUrl = $state.get('signup').url;
    $scope.loginUrl = $state.get('login').url;
    $scope.settingsUrl = $state.get('settings').url;
    $scope.deregisterUrl = $state.get('deregister').url;
    $scope.resetPasswordUrl = $state.get('reset-password').url;

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout("/login",function() {
        $scope.$apply();
      });
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
