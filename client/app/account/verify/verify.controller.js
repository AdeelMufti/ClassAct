'use strict';

angular.module('classActApp')
  .controller('VerifyCtrl', function ($scope, $location, $window, $translate, $stateParams, User, Auth, CONSTANTS, socket) {
    var userId = $stateParams.userId;
    var verificationToken = $stateParams.verificationToken;

    $scope.CONSTANTS = CONSTANTS;

    User.WithId.verify(
      { id: userId },
      { verificationToken: verificationToken },
      function(data) {
        if(Auth.isLoggedIn() && String(Auth.getCurrentUser()._id) == String(userId) && !socket.isConnected())
          Auth.updateUserFromDatabase();
        $scope.message=$translate.instant('VERIFICATION_COMPLETE');
        $scope.success = true;
      },
      function(err) {
        $scope.message=$translate.instant('INVALID_OR_EXPIRED_TOKEN');
      }
    );


  });
