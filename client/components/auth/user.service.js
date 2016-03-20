'use strict';

angular.module('classActApp')
  .factory('User', function ($resource) {
    return {
      WithId: $resource(
        '/api/user/:id/:controller',
        {
          id: '@_id'
        },
        {
          verify: {
            method: 'PUT',
            params: {
              controller: 'verify'
            }
          },
          update: {
            method: 'PUT',
            params: {
              controller: 'update'
            }
          },
          changePassword: {
            method: 'PUT',
            params: {
              controller: 'password'
            }
          },
          generateVerificationEmail: {
            method: 'PUT',
            params: {
              controller: 'generateVerificationEmail'
            }
          },
          get: {
            method: 'GET',
            params: {
              id: 'me'
            }
          }
        }
      ),
      MultipleUpdate: $resource(
        '/api/user/multipleUpdate',
        {
        },
        {
        }
      ),
      MultipleRemove: $resource(
        '/api/user/multipleRemove',
        {
        },
        {
        }
      ),
      All: $resource(
        '/api/user/getAll/:startTime/:window',
        {
        },
        {
        }
      ),
      Misc: $resource(
        '/api/user/misc/:controller',
        null,
        {
          generateResetPasswordToken: {
            method: 'POST',
            params: {
              controller: 'generateResetPasswordToken'
            }
          },
          resetPassword: {
            method: 'POST',
            params: {
              controller: 'resetPassword'
            }
          },
          generateDeregisterToken: {
            method: 'POST',
            params: {
              controller: 'generateDeregisterToken'
            }
          },
          deregister: {
            method: 'POST',
            params: {
              controller: 'deregister'
            }
          }
        }
      )
    };
  });
