'use strict';

angular.module('classActApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin-classified', {
        url: '/admin/classified',
        templateUrl: 'app/admin/classified/admin.classified.html',
        controller: 'AdminClassifiedCtrl',
        title: ['ADMIN_TITLE','-','CLASSIFIED'],
        authenticate: true
      })
      .state('admin-user', {
        url: '/admin/user',
        templateUrl: 'app/admin/user/admin.user.html',
        controller: 'AdminUserCtrl',
        title: ['ADMIN_TITLE','-','USER'],
        authenticate: true
      })
      .state('admin-email-digest', {
        url: '/admin/email-digest',
        templateUrl: 'app/admin/email-digest/admin.email-digest.html',
        controller: 'AdminEmailDigestCtrl',
        title: ['ADMIN_TITLE','-','EMAIL_DIGEST'],
        authenticate: true
      })
      .state('admin-miscellaneous', {
        url: '/admin/miscellaneous',
        templateUrl: 'app/admin/miscellaneous/admin.miscellaneous.html',
        controller: 'AdminMiscellaneousCtrl',
        title: ['ADMIN_TITLE','-','MISCELLANEOUS'],
        authenticate: true
      });
  });
