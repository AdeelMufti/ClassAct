'use strict';

angular.module('classActApp')
  .controller('SettingsCtrl', function ($scope, User, Auth, Classified, Modal, $translate, Misc, CONSTANTS, $state, $timeout, translations) {
    $scope.CONSTANTS = CONSTANTS;
    $scope.currentUser = Auth.getCurrentUser;
    $scope.isAdmin = Auth.isAdmin();

    $scope.errors = {};

    $scope.viewClassifiedUrl = $state.get('view-classified').url.replace("\/:classifiedId","");
    $scope.deregisterUrl = $state.get('deregister').url;

    $scope.languages = [];
    for(var key in translations)
      $scope.languages.push({key: key, name: translations[key]['THIS_LANGUAGE_NAME']});

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
        Auth.update({language: key})
          .then( function() {
            $timeout(function () {
              $scope.changeLanguageMessageTranslationKey = '';
            },5000);
            $scope.changeLanguageMessageTranslationKey = 'SETTINGS_SAVED';
          })
          .catch( function(err) {
            $scope.changeLanguageMessageTranslationKey = 'ERROR_PROCESSING_REQUEST';
          });
    };

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
            $timeout(function () {
              $scope.passwordChangeMessageTranslationKey = '';
            },5000);
            $scope.passwordChangeMessageTranslationKey = 'PASSWORD_CHANGED';
            $scope.user.oldPassword = "";
            $scope.user.newPassword = "";
            $scope.submitted = false;
            form.$setPristine(true);
        })
        .catch( function() {
          form.oldPassword.$setValidity('mongoose', false);
          $scope.errors.passwordChange = $translate.instant('INCORRECT_PASSWORD');
            $scope.passwordChangeMessageTranslationKey = '';
        });
      }
		};

    $scope.userClassifieds = [];

    Classified.getForUser(function(userClassifieds) {
      $scope.userClassifieds = userClassifieds;
    });

    $scope.removeClassified = Modal.confirm.remove(function(classified) {
      Classified.removeClassified(classified)
      .then( function() {
          $timeout(function () {
            $scope.removeClassifiedMessageTranslationKey = '';
          },5000);
          $scope.removeClassifiedMessageTranslationKey = 'CLASSIFIED_REMOVED';
          $scope.removeClassifiedMessageTranslationData = {title: classified.title}
      })
      .catch( function(err) {
        $scope.removeClassifiedMessageTranslationKey = 'CLASSIFIED_REMOVE_ERROR';
        $scope.removeClassifiedMessageTranslationData = {title: classified.title, message: err.data.message}
      });
    });

    $scope.generateVerificationEmail = function() {
      Auth.generateVerificationEmail()
        .then( function() {
          $timeout(function () {
            $scope.generateEmailMessageTranslationKey = '';
          },5000);
          $scope.generateEmailMessageTranslationKey = 'VERIFICATION_EMAIL_GENERATED';
        })
        .catch( function() {
          $scope.generateEmailMessageTranslationKey = 'VERIFICATION_EMAIL_GENERATION_ERROR';
        });
    }

    $scope.hasEmailSubscriptions = function() {
      return _.indexOf(Auth.getCurrentUser().emailSubscriptions,'all')>-1;
    }

    $scope.changeEmailSubscriptions = function(subscribe) {
      if((subscribe && $scope.hasEmailSubscriptions()) || (!subscribe && !$scope.hasEmailSubscriptions()))
        return;
      var updateFields;
      if(subscribe)
        updateFields={emailSubscriptions: ['all']};
      else
        updateFields={emailSubscriptions: []};

      Auth.update(updateFields)
        .then( function() {
          $timeout(function () {
            $scope.changeEmailSubscriptionsMessageTranslationKey = '';
          },5000);
          $scope.changeEmailSubscriptionsMessageTranslationKey = 'SETTINGS_SAVED';
        })
        .catch( function(err) {
          $scope.changeEmailSubscriptionsMessageTranslationKey = 'ERROR_PROCESSING_REQUEST';
        });
    }


  });
