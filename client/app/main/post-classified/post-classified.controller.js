'use strict';

angular.module('classActApp')
  .controller('PostClassifiedCtrl', function ($scope, $translate, Auth, Classified, $rootScope, $timeout, blockUI, ClassifiedResource, $state, CONSTANTS, notify, $location) {
    $scope.CONSTANTS = CONSTANTS;

    Auth.isLoggedInAsync(function(loggedIn) {
      $scope.isLoggedIn = loggedIn;
      if(loggedIn)
        $scope.currentUser = Auth.getCurrentUser();
    });

    $scope.signupUrl = $state.get('signup').url;
    $scope.loginUrl = $state.get('login').url;
    $scope.settingsUrl = $state.get('settings').url;

    $scope.invalidImages = [];
    $scope.images = [];
    var removedImages = [];

    $scope.categoriesHashMap = {};

    $scope.multiSelectCategoriesLangage = {
      selectAll: '',
      selectNone: '',
      reset: '',
      search: '...',
      nothingSelected: ''
    };

    $scope.multiSelectCategoriesOutputModel = [];

    var translateAndSetUpMultiSelectCategoriesInputModel = function () {
      var categoryTranslationIDs = [];

      for (var key in $scope.categoriesHashMap) {
        categoryTranslationIDs.push("category"+$scope.categoriesHashMap[key]._id);
      }

      $translate(categoryTranslationIDs).then(function (translations) {
        Object.keys(translations).forEach(function (key) {
          $scope[key] = translations[key];
        });

        $scope.multiSelectCategoriesInputModel = [];
        $scope.multiSelectCategoriesInputModel.push({name: '', categoriesGroup: true});
        for (var key in $scope.categoriesHashMap) {
          $scope.multiSelectCategoriesInputModel.push({
            _id: $scope.categoriesHashMap[key]._id,
            icon: '<i class="fa fa-lg fa-'+$scope.categoriesHashMap[key].icon+'"></i>',
            name: $scope["category"+$scope.categoriesHashMap[key]._id],
            ticked: false
          });
        }
        $scope.multiSelectCategoriesInputModel.push({categoriesGroup: false});
      });
    }

    $scope.validateContent = function(value){
      if( /<[a-z][\s\S]*>/i.test(value))
        return false;
      return true;
    }

    Classified.getCategories(function(categoriesHashMap) {
      $scope.categoriesHashMap = categoriesHashMap;

      translateAndSetUpMultiSelectCategoriesInputModel();

      $rootScope.$on('$translateChangeSuccess', function () {
        translateAndSetUpMultiSelectCategoriesInputModel();
      });

    });

    $scope.imagesRelatedServerProcessingUnderway = false;

    $scope.$watch('images', function (images) {
      if (images != null) {
        if (!angular.isArray(images)) {
          $timeout(function () {
            $scope.images = images = [images];
          });
          return;
        }
        for (var i = 0; i < images.length; i++) {
          (function (image) {
            uploadImage(image);
          })(images[i]);
        }
      }
    });

    var resetImagesRelatedServerProcessingUnderway = function()
    {
      for(var i=0; i<$scope.images.length; i++)
        if(!$scope.images[i].result || !$scope.images[i].thumbnail)
          return;
      $scope.imagesRelatedServerProcessingUnderway = false;
    }

    var uploadImage = function(image)
    {
      if(image.result) return;

      $scope.imagesRelatedServerProcessingUnderway = true;

      var uploadCompleteFunction = function(response) {
        $timeout(function () {
          //console.log('Success ' + response.config.data.image.name + ' uploaded. Response: ' + response.data);
          image.result = response.data.filename;
          image.thumbnail = response.data.thumbnail;
          resetImagesRelatedServerProcessingUnderway();
        });
      }

      var errorFunction = function(response) {
        if (response.status > 0) {
          $timeout(function () {
            image.$error = 'server';
            image.$errorParam = response.data;
            removeImageInternal(image);
            $scope.invalidImages.push(image);
          });
        }
      }

      var progressFunction = function(evt) {
        image.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        //console.log('progress: ' + image.progress + '% ' + evt.config.data.image.name);
      }

      Classified.uploadImage(image,uploadCompleteFunction,errorFunction,progressFunction);
    }

    $scope.abortUpload = function(image)
    {
      image.upload.abort();
      image.upload.aborted=true;
      removeImageInternal(image);
      resetImagesRelatedServerProcessingUnderway();
    }

    $scope.rotateImage = function(image,orientation) {
      if(!image.result || !image.thumbnail) return;

      $scope.imagesRelatedServerProcessingUnderway = true;

      Classified.rotateImageOnServer(image,orientation,function(err) {
        if(err) {
            $scope.customImageError = image.name+": "+err.message;
        }
        resetImagesRelatedServerProcessingUnderway();
      })
    }

    $scope.beforeResizingImages = function(images)
    {
      blockUI.start($translate.instant('FORMATTING_IMAGES')+"...");
      $scope.$apply();
    }

    $scope.afterResizingImages = function(images)
    {
      blockUI.stop();
    }

    $scope.getTempImageUrl = function(imageFile)
    {
      var url = ClassifiedResource.Image.getTemp.url.replace(":imageFile",imageFile);
      return url;
    }

    $scope.getError = function(image)
    {
      if(image.$error == 'server')
        return image.$errorParam.message;
      else
        return $translate.instant('IMAGE_UPLOAD_ERROR_'+(image.$error=='validateFn'?image.$errorParam:image.$error));
    }

    $scope.validateImage = function(image)
    {
      if($scope.images.length>=10)
        return "maxFiles";
      return true;
    }

    var removeImageInternal = function(image)
    {
      var i=_.indexOf($scope.images,image);
      if(i>=0)
        $scope.images.splice(i,1);
    }
    $scope.getUploadProgressString = function(image)
    {
      if(image.progress<100)
        return(image.progress+"%");
      else if(image.progress==100 && !image.result)
        return($translate.instant('PROCESSING')+"...");
      else if(image.progress==100 && image.result)
        return("100%");
      else
        return("");
    }
    $scope.removeImage = function(idx)
    {
      var image = $scope.images[idx];
      removedImages.push(image.result);
      $scope.images.splice(idx, 1);
    }

    $scope.removeInvalidImages = function() {
      $scope.invalidImages = [];
    }

    var formIsValid = $scope.formIsValid = function(form) {
      return(
           form.newClassifiedTitle.$valid
        && form.newClassifiedLocation.$valid
        && form.newClassifiedContact.$valid
        && form.newClassifiedContent.$valid
        && ($scope.isLoggedIn || (!$scope.isLoggedIn && form.newClassifiedEmail.$valid))
        && $scope.multiSelectCategoriesOutputModel.length!=0
        && !$scope.imagesRelatedServerProcessingUnderway
      );
    }

    $scope.postClassified = function(form) {
      $scope.submitted = true;
      $scope.message = "";
      if(formIsValid(form))
      {
        blockUI.start($translate.instant('PROCESSING')+"...");
        var categories = [];
        for(var i=0; i<$scope.multiSelectCategoriesOutputModel.length; i++)
          categories[i] = {_id: $scope.multiSelectCategoriesOutputModel[i]._id};
        var images = [];
        for(var i=0; i<$scope.images.length; i++)
          images[i] = $scope.images[i].result;
        Classified.postClassified
        (
          {
            title: $scope.newClassifiedTitle,
            location: $scope.newClassifiedLocation,
            contact: $scope.newClassifiedContact,
            content: $scope.newClassifiedContent,
            email: $scope.newClassifiedEmail,
            categories: categories,
            images: images,
            removedImages: removedImages
          }
        )
          .then( function(classified) {
            var title = $scope.newClassifiedTitle;

            $scope.submitted=false;
            $scope.newClassifiedTitle = '';
            $scope.newClassifiedLocation = '';
            $scope.newClassifiedContact = '';
            $scope.newClassifiedContent = '';
            $scope.newClassifiedEmail = '';
            $scope.images = [];
            $scope.invalidImages = [];
            $scope.customImageError = '';
            removedImages = [];

            angular.forEach( $scope.multiSelectCategoriesInputModel, function( value, key ) {
              value[ 'ticked' ] = false;
            });
            if(classified.posted)
              $scope.message=$translate.instant('CLASSIFIED_SUBMITTED_POSTED',{title: title});
            else
              $scope.message=$translate.instant('CLASSIFIED_SUBMITTED_NOT_POSTED',{title: title});
            notify.config({
              startTop:75,
              duration:0,
              position:'center'
            });
            notify({
              messageTemplate:"<span>"+$scope.message+"</span>"
            });
            $timeout(function () {
              $scope.message = '';
            },20000);
            blockUI.stop();
            $location.path("/"); //[Adeel Mufti, 4/14/16] Added this to redirect user after successful submit, since people don't seem to understand their classified was submitted. Hopefully this will help
          })
          .catch( function(err) {
            $scope.message = $translate.instant('CLASSIFIED_POST_ERROR',{message: err.data.message});
            blockUI.stop();
          });
      }
    };
  });
