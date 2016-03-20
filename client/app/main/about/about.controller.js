'use strict';

angular.module('classActApp')
  .controller('AboutCtrl', function ($scope, CONSTANTS, moment) {
    $scope.CONSTANTS = CONSTANTS;

    $scope.translationData = function() {
      return {
        APP_VERSION: CONSTANTS.APP_VERSION,
        APP_VERSION_DATE:moment(new Date(Date.parse(CONSTANTS.APP_VERSION_DATE))).format("LL")
      };
    }

  });
