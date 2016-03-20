'use strict';

angular.module('classActApp')
  .controller('AdminClassifiedCtrl', function ($scope, $translate, Admin, $timeout, $state, $rootScope, Classified, Modal, notify, socket) {

    $scope.viewClassifiedUrl = $state.get('view-classified').url.replace("\/:classifiedId","");

    $scope.classifieds = [];

    var stateVariables = Admin.getStateVariables();

    if(!stateVariables.classifiedsFiltersInclusive)
      stateVariables.classifiedsFiltersInclusive = false;
    $scope.classifiedsFiltersInclusive = stateVariables.classifiedsFiltersInclusive;
    $scope.$watch('classifiedsFiltersInclusive', function(newVal, oldVal) {
      if (newVal != oldVal) {
        stateVariables.classifiedsFiltersInclusive = newVal;
      }
    });

    if(!stateVariables.expandedClassifieds)
      stateVariables.expandedClassifieds = [];
    $scope.expandOrCollapseClassified = function(classifiedId)
    {
      var i=_.indexOf(stateVariables.expandedClassifieds,classifiedId);
      if(i>=0)
        stateVariables.expandedClassifieds.splice(i,1);
      else
        stateVariables.expandedClassifieds.push(classifiedId);
    }
    $scope.isCollapsed = function(classifiedId)
    {
      return _.indexOf(stateVariables.expandedClassifieds,classifiedId) < 0;
    }

    if(!stateVariables.classifiedsSelected)
      stateVariables.classifiedsSelected = {};
    $scope.classifiedsSelected = stateVariables.classifiedsSelected;
    $scope.toggleSelect = function($event,classified) {
      if($event.target.id=='classifiedDiv')
      {
        if($scope.classifiedsSelected[classified._id]) {
          $scope.selectAll = false;
          delete $scope.classifiedsSelected[classified._id];
        }
        else
          $scope.classifiedsSelected[classified._id] = true;
      }
    }

    if(!stateVariables.classifiedsSearchKeywords)
      stateVariables.classifiedsSearchKeywords = "";
    else
      $scope.classifiedsSearchKeywords = stateVariables.classifiedsSearchKeywords;
    $scope.$watch('classifiedsSearchKeywords', function(newVal, oldVal) {
      if (newVal != oldVal) {
        $scope.classifiedsSelected = stateVariables.classifiedsSelected = {};
        $scope.selectAll = false;
        stateVariables.classifiedsSearchKeywords = newVal;
      }
    });

    if(!stateVariables.selectedClassifiedsFilters)
      stateVariables.selectedClassifiedsFilters = [];
    $scope.multiSelectFiltersOutputModel = [];
    $scope.$watch('multiSelectFiltersOutputModel', function(newVal, oldVal) {
      if (!_.isEqual(newVal,oldVal)) {
        $scope.classifiedsSelected = stateVariables.classifiedsSelected = {};
        $scope.selectAll = false;
        stateVariables.selectedClassifiedsFilters = [];
        for(var i=0; i<newVal.length; i++)
          stateVariables.selectedClassifiedsFilters.push(newVal[i].id);
      }
    });
    function translateAndSetUpMultiSelectFiltersInputModel() {
      $scope.multiSelectFiltersInputModel = [];
      $scope.multiSelectFiltersInputModel.push({name: $translate.instant('SELECT_ALL'), filtersGroup: true});
      var filters = [
        {
          id: 'APPROVED_POSTED',
          name: $translate.instant('APPROVED_POSTED')
        },
        {
          id: 'NOT_APPROVED_NOT_POSTED',
          name: $translate.instant('NOT_APPROVED_NOT_POSTED'),
        },
        {
          id: 'FLAGGED_AND_REMOVED',
          name: $translate.instant('FLAGGED_AND_REMOVED'),
        },
        {
          id: 'FLAGGED_BY_USERS',
          name: $translate.instant('FLAGGED_BY_USERS'),
        },
        {
          id: 'POSTED_OVER_30_DAYS_AGO',
          name: $translate.instant('POSTED_OVER_30_DAYS_AGO'),
        },
        {
          id: 'POSTED_OVER_60_DAYS_AGO',
          name: $translate.instant('POSTED_OVER_60_DAYS_AGO'),
        },
        {
          id: 'POSTED_OVER_90_DAYS_AGO',
          name: $translate.instant('POSTED_OVER_90_DAYS_AGO'),
        },
        {
          id: 'POSTED_OVER_180_DAYS_AGO',
          name: $translate.instant('POSTED_OVER_180_DAYS_AGO'),
        }
      ]
      for(var i=0; i<filters.length; i++)
      {
        var filter = filters[i];
        filter.ticked = _.indexOf(stateVariables.selectedClassifiedsFilters, filter.id)>-1 ? true : false
        $scope.multiSelectFiltersInputModel.push(filter);
      }
      $scope.multiSelectFiltersInputModel.push({filtersGroup: false});
    }
    translateAndSetUpMultiSelectFiltersInputModel();
    $rootScope.$on('$translateChangeSuccess', function () {
      translateAndSetUpMultiSelectFiltersInputModel();
    });
    $scope.multiSelectFiltersLangage = {
      selectAll: '',
      selectNone: '',
      reset: '',
      search: '...',
      nothingSelected: ''
    };

    $scope.filterFunction = function(classified) {
      var returnValue = true;

      if($scope.multiSelectFiltersOutputModel.length==0)
        returnValue = returnValue && true;
      else {
        var filterApplies = false;
        if($scope.classifiedsFiltersInclusive)
          filterApplies = true;
        for (var i = 0; i < $scope.multiSelectFiltersOutputModel.length; i++) {
          var filter = $scope.multiSelectFiltersOutputModel[i];
          if(filter.id == 'APPROVED_POSTED')
          {
            if(classified.posted) {
              if(!$scope.classifiedsFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.classifiedsFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'NOT_APPROVED_NOT_POSTED')
          {
            if(!classified.posted) {
              if(!$scope.classifiedsFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.classifiedsFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'FLAGGED_AND_REMOVED')
          {
            if(classified.flagged) {
              if(!$scope.classifiedsFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.classifiedsFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'FLAGGED_BY_USERS')
          {
            if(classified.flaggedBy && classified.flaggedBy.length!=0) {
              if(!$scope.classifiedsFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.classifiedsFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'POSTED_OVER_30_DAYS_AGO')
          {
            var timestamp30DaysAgo = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
            if(classified.posted && new Date(classified.posted).getTime() <= timestamp30DaysAgo) {
              if(!$scope.classifiedsFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.classifiedsFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'POSTED_OVER_60_DAYS_AGO')
          {
            var timestamp60DaysAgo = new Date().getTime() - (60 * 24 * 60 * 60 * 1000);
            if(classified.posted && new Date(classified.posted).getTime() <= timestamp60DaysAgo) {
              if(!$scope.classifiedsFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.classifiedsFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'POSTED_OVER_90_DAYS_AGO')
          {
            var timestamp90DaysAgo = new Date().getTime() - (90 * 24 * 60 * 60 * 1000);
            if(classified.posted && new Date(classified.posted).getTime() <= timestamp90DaysAgo) {
              if(!$scope.classifiedsFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.classifiedsFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'POSTED_OVER_180_DAYS_AGO')
          {
            var timestamp180DaysAgo = new Date().getTime() - (180 * 24 * 60 * 60 * 1000);
            if(classified.posted && new Date(classified.posted).getTime() <= timestamp180DaysAgo) {
              if(!$scope.classifiedsFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.classifiedsFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }

        }
        returnValue = returnValue && filterApplies;
      }

      if(returnValue && $scope.classifiedsSearchKeywords)
      {
        var keywords = $scope.classifiedsSearchKeywords.split(" ");
        for(var i=0; i<keywords.length; i++)
        {
          var keyword = keywords[i].toLowerCase();
          if(
                String(classified._id).toLowerCase().indexOf(keyword)>-1
            ||  classified.title.toLowerCase().indexOf(keyword)>-1
            ||  (classified.user && String(classified.user._id).toLowerCase().indexOf(keyword)>-1)
            ||  (classified.user && String(classified.user.email).toLowerCase().indexOf(keyword)>-1)
            ||  (classified.email && classified.email.toLowerCase().indexOf(keyword)>-1)
            ||  (classified.ipAddress && classified.ipAddress.toLowerCase().indexOf(keyword)>-1)
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

    $scope.initialLoadDone = false;
    $scope.getMoreAll = function(window) {
      if($scope.loadingClassifieds) return;

      $scope.loadingClassifieds = true;

      if(!$scope.initialLoadDone) {
        Admin.getAllClassifieds(function (classifieds) {
          $scope.classifieds = classifieds;
          $scope.loadingClassifieds = false;
          $scope.initialLoadDone = true;
        });
      }
      else
      {
        var filteredClassifiedOriginalCount = $scope.filteredClassifieds.length;
        var apiMethod = function(callback) {
          Admin.getMoreAllClassifieds(window,function(err,numberOfClassifiedsGotten) {
            $timeout(function(){
              $scope.selectAll = false;
              if (numberOfClassifiedsGotten == 0 || window == 0) {
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

    $scope.removeClassified = Modal.confirm.remove(function(classified) {
      Classified.removeClassified(classified, {showNotification: true});
    });

    $scope.setFieldValue = function(action, field, value, classified)
    {
      if(field=='posted' && ((value && classified.posted) || (!value && !classified.posted)))
        return;
      else if(classified[field] && ((!classified[field]&&!value) || (classified[field]==value) || (String(classified[field]).length==String(value).length)))
        return;

      if(field=='posted' && value)
        value = new Date();
      else if (field=='posted' && !value)
        value = null;

      var actionTranslation = $translate.instant(action);

      Modal.confirm.update(function(classified) {
        var fields = {};
        fields[field] = value;
        Classified.update(classified,fields,function(err,savedClassified) {
          if(!err)
          {
            notify.config({
              startTop: 75,
              duration: 5000,
              position: 'center'
            });
            notify({
              message: $translate.instant('CLASSIFIED_UPDATED',{title:classified.title,action:actionTranslation})
            });
          }
          else
          {
            var message = '';
            if(err.data && err.data.message)
              message = err.data.message;
            else if(err.message)
              message = err.message;
            notify.config({
              startTop: 75,
              duration: 0,
              position: 'center'
            });
            notify({
              message: $translate.instant('CLASSIFIED_UPDATE_ERROR',{title:classified.title, message:message})
            });
          }
        });
      })(classified.title,actionTranslation,classified);
    }

    $scope.selectAll = false;
    $scope.toggleSelectAll = function() {
      if($scope.selectAll)
      {
        for(var i=0; i<$scope.classifieds.length; i++)
        {
          var classified = $scope.classifieds[i];
          if($scope.filterFunction(classified))
            $scope.classifiedsSelected[classified._id] = true;
        }
      }
      else
      {
        $scope.classifiedsSelected = stateVariables.classifiedsSelected = {};
      }
    }

    $scope.countSelected = function()
    {
      var count=0;
      for(var _id in $scope.classifiedsSelected) {
        if ($scope.classifiedsSelected.hasOwnProperty(_id) && !$scope.classifiedsSelected[_id]) {
          $scope.selectAll=false;
          delete $scope.classifiedsSelected[_id];
        }
        else if ($scope.classifiedsSelected.hasOwnProperty(_id) && $scope.classifiedsSelected[_id]) {
          count++;
        }
      }
      return count;
    }

    $scope.multipleRemove = function()
    {
      var classifiedIds = [];
      for(var classifiedId in $scope.classifiedsSelected) {
        if ($scope.classifiedsSelected[classifiedId]) {
          classifiedIds.push(classifiedId);
        }
      }
      Modal.confirm.generic(function() {
        Classified.multipleRemove(classifiedIds,function(err){
          if(!err)
          {
            $scope.selectAll = false;
            $scope.classifiedsSelected = stateVariables.classifiedsSelected = {};
            notify.config({
              startTop: 75,
              duration: 5000,
              position: 'center'
            });
            notify({
              message: $translate.instant('MULTIPLE_ITEMS_REMOVED',{selectedCount: classifiedIds.length})
            });
          }
          else
          {
            var message = '';
            if(err.data && err.data.message)
              message = err.data.message;
            else if(err.message)
              message = err.message;
            notify.config({
              startTop: 75,
              duration: 0,
              position: 'center'
            });
            notify({
              message: $translate.instant('MULTIPLE_ITEMS_REMOVE_ERROR',{message:message})
            });
          }
        });
      })('PLEASE_CONFIRM','MULTIPLE_REMOVE_CONFIRM',{selectedCount: classifiedIds.length});
    }

    $scope.multipleUpdate = function(action)
    {
      var actionTranslation = $translate.instant(action);

      var selectedCount = $scope.countSelected();

      var classifiedIds = [];
      for(var classifiedId in $scope.classifiedsSelected)
      {
        if($scope.classifiedsSelected[classifiedId]) {
          var classified = _.find($scope.classifieds,{_id: classifiedId});
          if(action == 'APPROVED_POSTED' && !classified.posted)
            classifiedIds.push(classifiedId);
          else if(action == 'NOT_APPROVED_NOT_POSTED' && classified.posted)
            classifiedIds.push(classifiedId);
          else if(action == 'FLAGGED_AND_REMOVED' && !classified.flagged)
            classifiedIds.push(classifiedId);
          else if(action == 'NOT_FLAGGED_NOT_REMOVED' && classified.flagged)
            classifiedIds.push(classifiedId);
        }
      }

      if(classifiedIds.length==0)
      {
        notify.config({
          startTop: 75,
          duration: 5000,
          position: 'center'
        });
        notify({
          message: $translate.instant('ALL_ITEMS_NOT_APPLICABLE',{action: actionTranslation})
        });
        return;
      }

      var confirmMessage = '';
      if(classifiedIds.length != selectedCount)
        confirmMessage = $translate.instant('MULTIPLE_UPDATE_APPLICABLE_ITEMS_MESSAGE',{selectedCount: selectedCount, applicableCount: classifiedIds.length, action: actionTranslation})+" ";
      confirmMessage += $translate.instant('MULTIPLE_UPDATE_CONFIRM',{applicableCount: classifiedIds.length, action: actionTranslation});
      Modal.confirm.generic(function() {
        var fields = {};
        if(action == 'APPROVED_POSTED')
          fields['posted'] = new Date();
        else if(action == 'NOT_APPROVED_NOT_POSTED')
          fields['posted'] = null;
        else if(action == 'FLAGGED_AND_REMOVED')
          fields['flagged'] = true;
        else if(action == 'NOT_FLAGGED_NOT_REMOVED')
          fields['flagged'] = false;
        Classified.multipleUpdate(classifiedIds,fields,function(err){
          if(!err)
          {
            $scope.selectAll = false;
            $scope.classifiedsSelected = stateVariables.classifiedsSelected = {};
            notify.config({
              startTop: 75,
              duration: 5000,
              position: 'center'
            });
            notify({
              message: $translate.instant('MULTIPLE_ITEMS_UPDATED',{applicableCount: classifiedIds.length, action: actionTranslation})
            });
          }
          else
          {
            var message = '';
            if(err.data && err.data.message)
              message = err.data.message;
            else if(err.message)
              message = err.message;
            notify.config({
              startTop: 75,
              duration: 0,
              position: 'center'
            });
            notify({
              message: $translate.instant('MULTIPLE_ITEMS_UPDATE_ERROR',{message:message})
            });
          }
        });
      })('PLEASE_CONFIRM',confirmMessage,{});

    }


  });
