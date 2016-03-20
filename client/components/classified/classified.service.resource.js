'use strict';

angular.module('classActApp')
  .factory('ClassifiedResource', function ($resource) {
    return {

      WithId: $resource(
        '/api/classified/:id/:controller',
        {
          id: '@_id'
        },
        {
          flag: {
            method: 'GET',
            params: {
              controller: 'flag'
            }
          },
          update: {
            method: 'PUT',
          },
        }
      ),
      All: $resource(
        '/api/classified/getAll/:startTime/:window',
        {
        },
        {
        }
      ),
      MultipleUpdate: $resource(
        '/api/classified/multipleUpdate',
        {
        },
        {
        }
      ),
      MultipleRemove: $resource(
        '/api/classified/multipleRemove',
        {
        },
        {
        }
      ),
      Posted: $resource(
        '/api/classified/getPosted/:startTime/:window',
        {
        },
        {
        }
      ),
      User: $resource(
        '/api/classified/getForUser',
        {
        },
        {
        }
      ),
      Categories: $resource(
        '/api/classified/categories'
      ),
      EmailDigest: $resource(
        '/api/classified/emailDigest',
        {
        },
        {
        }
      ),
      Image:
      {
        upload: {url: '/api/classified/image/upload'},
        rotate: {url: '/api/classified/image/rotate/:imageFile/:orientation'},
        getImage: {url: '/api/classified/:classifiedId/images/image/:imageId'},
        getThumbnail: {url: '/api/classified/:classifiedId/images/thumbnail/:imageId'},
        getTemp: {url: '/api/classified/image/getTemp/:imageFile'}
      }

    };
  });
