'use strict';

angular.module('classActApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        title: 'HOME_PAGE'
      })
      .state('post-classified', {
        url: '/post-classified',
        templateUrl: 'app/main/post-classified/post-classified.html',
        controller: 'PostClassifiedCtrl',
        title: 'POST_CLASSIFIED_TITLE'
      })
      .state('about', {
        url: '/about',
        templateUrl: 'app/main/about/about.html',
        controller: 'AboutCtrl',
        title: 'ABOUT_TITLE'
      })
      .state('site-utilization', {
        url: '/site-utilization',
        templateUrl: 'app/main/site-utilization/site-utilization.html',
        controller: 'SiteUtilizationCtrl',
        title: 'SITE_UTILIZATION_TITLE'
      })
      .state('view-classified', {
        url: '/view-classified/:classifiedId',
        templateUrl: 'app/main/view-classified/view-classified.html',
        controller: 'ViewClassifiedCtrl',
        title: 'VIEW_CLASSIFIED_TITLE'
      })


  });
