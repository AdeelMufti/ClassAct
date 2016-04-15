'use strict';

angular.module('classActApp')
  .controller('SiteUtilizationCtrl', function ($scope, CONSTANTS, $translate, translations) {
    $scope.CONSTANTS = CONSTANTS;

    translations['en']['SITE_UTILIZATION'] = "Enter your rules, regulations and user guide here.";
    translations['fr']['SITE_UTILIZATION'] = "Entrez vos règles, règlements et mode d'emploi ici.";

    $translate.refresh();

  });
