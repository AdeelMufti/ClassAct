'use strict';

angular.module('classActApp')
  .controller('MainCtrl', function ($location, $scope, Auth, CONSTANTS, $translate, Misc, Classified, ClassifiedResource, amMoment, $state, $rootScope, Modal, notify, $timeout) {

    $scope.CONSTANTS = CONSTANTS;
    $scope.Auth = Auth;

    $scope.postedClassifieds = [];
    $scope.filteredClassifieds = 0;
    $scope.categoriesHashMap = {};

    $scope.viewClassifiedUrl = $state.get('view-classified').url.replace("\/:classifiedId","");

    $scope.multiSelectCategoriesLangage = {
      selectAll: '',
      selectNone: '',
      reset: '',
      search: '...',
      nothingSelected: ''
    };
    $scope.multiSelectCategoriesOutputModel = [];

    $scope.searchKeywords = Classified.getSearchKeywords();

    $scope.$watch('multiSelectCategoriesOutputModel', function(newVal, oldVal) {
      if (!_.isEqual(newVal,oldVal)) {
        var selectedCategories = [];
        for(var i=0; i<newVal.length; i++)
          selectedCategories.push(newVal[i]._id);
        Classified.setSelectedCategories(selectedCategories);
      }
    });

    $scope.$watch('searchKeywords', function(newVal, oldVal) {
      if (newVal != oldVal) {
        Classified.setSearchKeywords(newVal);
      }
    });


    var translateAndSetUpMultiSelectCategoriesInputModel = function()
    {
      var categoryTranslationIDs = [];

      for (var key in $scope.categoriesHashMap) {
        categoryTranslationIDs.push("category"+$scope.categoriesHashMap[key]._id);
      }
      categoryTranslationIDs[categoryTranslationIDs.length+1]='SELECT_ALL';

      $translate(categoryTranslationIDs).then(function (translations) {
        Object.keys(translations).forEach(function(key) {
          $scope[key] = translations[key];
        });

        var selectedCategories = Classified.getSelectedCategories();

        $scope.multiSelectCategoriesInputModel = [];
        $scope.multiSelectCategoriesInputModel.push({name: $scope["SELECT_ALL"], categoriesGroup: true});
        for (var key in $scope.categoriesHashMap) {
          $scope.multiSelectCategoriesInputModel.push({
            _id: $scope.categoriesHashMap[key]._id,
            icon: '<i class="fa fa-lg fa-'+$scope.categoriesHashMap[key].icon+'"></i>',
            name: $scope["category"+$scope.categoriesHashMap[key]._id],
            ticked: _.indexOf(selectedCategories, String($scope.categoriesHashMap[key]._id))>-1 ? true : false
          });
        }
        $scope.multiSelectCategoriesInputModel.push({categoriesGroup: false});

      });
    }

    $scope.multiSelectCategoriesClick = function(data)
    {
      if(!data.categoriesGroup)
      {
        for(var i=0; i<$scope.multiSelectCategoriesInputModel.length; i++)
        {
          if(String($scope.multiSelectCategoriesInputModel[i]._id) != String(data._id))
            $scope.multiSelectCategoriesInputModel[i].ticked = false;
          else if(String($scope.multiSelectCategoriesInputModel[i]._id) == String(data._id))
            $scope.multiSelectCategoriesInputModel[i].ticked = true;
        }
      }
      $timeout(function() {
        document.getElementById('multiSelectCategories').click();
      });
    }

    $scope.filterFunction = function(classified) {
      if(!classified.posted)
        return false;

      if(classified.flagged)
        return false;

      var returnValue = true;

      if($scope.multiSelectCategoriesOutputModel.length==0)
        returnValue = returnValue && true;
      else {
        var categoryApplies = false;
        for (var i = 0; i < $scope.multiSelectCategoriesOutputModel.length; i++) {
          if (classified.categories) {
            for (var j = 0; j < classified.categories.length; j++) {
              if ($scope.multiSelectCategoriesOutputModel[i]._id == classified.categories[j]._id) {
                categoryApplies = true;
                break;
              }
            }
          }
        }
        returnValue = returnValue && categoryApplies;
      }

      if(returnValue && $scope.searchKeywords)
      {
        var keywords = $scope.searchKeywords.split(" ");
        for(var i=0; i<keywords.length; i++)
        {
          var keyword = keywords[i].toLowerCase();
          if(
                  classified.title.toLowerCase().indexOf(keyword)>-1
              ||  (classified.location && classified.location.toLowerCase().indexOf(keyword)>-1)
              ||  (classified.contact && classified.contact.toLowerCase().indexOf(keyword)>-1)
              ||  classified.content.toLowerCase().indexOf(keyword)>-1
          )
          {
          }
          else {
            returnValue = false;
            break;
          }
        }
      }

      return returnValue;
    };

    Classified.getCategories(function(categoriesHashMap) {
      $scope.categoriesHashMap = categoriesHashMap;

      translateAndSetUpMultiSelectCategoriesInputModel();

      $rootScope.$on('$translateChangeSuccess', function () {
        translateAndSetUpMultiSelectCategoriesInputModel();
      });

    });

    $scope.removeClassified = Modal.confirm.remove(function(classified) {
      Classified.removeClassified(classified, {showNotification: true});
    });

    $scope.flagClassified = Modal.confirm.flag(function(classified) {
      Classified.flag(classified,{showNotification: true});
    });

    $scope.arrayBufferToBase64 = Classified.arrayBufferToBase64;

    $scope.getImageUrl = Classified.getImageUrl;

    $scope.initialLoadDone = false;
    $scope.getMorePosted = function(window) {
      if($scope.loadingClassifieds) return;

      $scope.loadingClassifieds = true;

      if(!$scope.initialLoadDone) {
        Classified.getPosted(function (postedClassifieds) {
          $scope.postedClassifieds = postedClassifieds;
          $scope.loadingClassifieds = false;
          $scope.initialLoadDone = true;
        });
      }
      else
      {
        var filteredClassifiedOriginalCount = $scope.filteredClassifieds.length;
        var apiMethod = function(callback) {
          //console.log("Loading more posted classifieds...");
          Classified.getMorePosted(window,function(err,numberOfClassifiedsGotten) {
            $timeout(function(){
              if (numberOfClassifiedsGotten == 0) {
                $scope.noMoreClassifieds = true;
                $scope.loadingClassifieds = false;
              }
              else if($scope.filteredClassifieds.length!=filteredClassifiedOriginalCount)
              {
                $scope.loadingClassifieds = false;
              }
              if($scope.loadingClassifieds)
                return callback(true);
              else
                return callback(null);
            },0,false);
          });
        }
        async.retry({times: 99999, interval: 0}, apiMethod, function() {});
      }
    }

    $scope.shouldContentBeCollapsed = function(content) {
      var maxLength;
      var maxLines;
      if(Misc.responsiveDetection()=='xs')
      {
        maxLength=500;
        maxLines=4;
      }
      else {
        maxLength = 1000;
        maxLines=8;
      }

      if(content.length>maxLength || content.split('\n').length>maxLines)
        return true;
      return false;
    }

  });
