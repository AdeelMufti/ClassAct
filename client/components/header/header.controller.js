'use strict';

angular.module('classActApp')
  .controller('HeaderCtrl', function ($scope, Auth, CONSTANTS, $translate, Misc, translations) {

    var images = CONSTANTS.HEADER_IMAGES;
    var random = Math.floor(Math.random() * images.length);

    $scope.languages = [];
    for(var key in translations)
      $scope.languages.push({key: key, name: translations[key]['THIS_LANGUAGE_NAME']});

    $scope.getRandomImage = function() {
      return images[random];
    };

    $scope.CONSTANTS = CONSTANTS;
    $scope.isLoggedIn = Auth.isLoggedIn;

    $scope.isLanguageSetTo = function (key) {
      var currentLanguage = $translate.use().substring(0,2);
      if(currentLanguage == key)
        return true;
      return false;
    };

    $scope.changeLanguage = function (key) {
      if($scope.isLanguageSetTo(key)) return;

      Misc.changeLanguage(key);
      if(Auth.isLoggedIn())
        Auth.update({language: key});
    };

  });
