'use strict';

angular.module('classActApp')
  .factory('Modal', function ($rootScope, $uibModal, $translate) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $uibModal.open() returns
     */
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $uibModal.open({
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {

      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a remove confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} rem - callback, ran when remove is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        remove: function(rem) {
          rem = rem || angular.noop;

          /**
           * Open a remove confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed straight to rem callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift(),
                removeModal;

            removeModal = openModal({
              modal: {
                dismissable: true,
                title: $translate.instant('CONFIRM_REMOVE'),
                html: '<p>'+$translate.instant('REMOVE_CONFIRMATION_MESSAGE',{name: name})+'</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: $translate.instant('REMOVE'),
                  click: function(e) {
                    removeModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: $translate.instant('CANCEL'),
                  click: function(e) {
                    removeModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            removeModal.result.then(function(event) {
              rem.apply(event, args);
            });
          };
        },

        flag: function(flag) {
          flag = flag || angular.noop;

          return function() {
            var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              flagModal;

            flagModal = openModal({
              modal: {
                dismissable: true,
                title: $translate.instant('CONFIRM_FLAG'),
                html: '<p>'+$translate.instant('FLAG_CONFIRMATION_MESSAGE',{title: name})+'</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: $translate.instant('FLAG'),
                  click: function(e) {
                    flagModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: $translate.instant('CANCEL'),
                  click: function(e) {
                    flagModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            flagModal.result.then(function(event) {
              flag.apply(event, args);
            });
          };
        },

        update: function(update) {
          update = update || angular.noop;

          return function() {
            var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              action = args.shift(),
              updateModal;

            updateModal = openModal({
              modal: {
                dismissable: true,
                title: $translate.instant('CONFIRM_UPDATE'),
                html: '<p>'+$translate.instant('UPDATE_CONFIRMATION_MESSAGE',{name: name, action: action})+'</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: $translate.instant('YES'),
                  click: function(e) {
                    updateModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: $translate.instant('CANCEL'),
                  click: function(e) {
                    updateModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            updateModal.result.then(function(event) {
              update.apply(event, args);
            });
          };
        },

        generic: function(generic) {
          generic = generic || angular.noop;

          return function() {
            var args = Array.prototype.slice.call(arguments),
              title = args.shift(),
              message = args.shift(),
              translationParams = args.shift(),
              genericModal;

            genericModal = openModal({
              modal: {
                dismissable: true,
                title: $translate.instant(title,translationParams),
                html: '<p>'+$translate.instant(message,translationParams)+'</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: $translate.instant('YES'),
                  click: function(e) {
                    genericModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: $translate.instant('CANCEL'),
                  click: function(e) {
                    genericModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            genericModal.result.then(function(event) {
              generic.apply(event, args);
            });
          };
        },

      }
    };
  });
