'use strict';

angular.module('classActApp')
  .controller('AdminUserCtrl', function ($scope, $translate, Admin, $timeout, $state, $rootScope, Modal, notify) {
    $scope.users = [];

    var stateVariables = Admin.getStateVariables();

    if(!stateVariables.usersFiltersInclusive)
      stateVariables.usersFiltersInclusive = false;
    $scope.usersFiltersInclusive = stateVariables.usersFiltersInclusive;
    $scope.$watch('usersFiltersInclusive', function(newVal, oldVal) {
      if (newVal != oldVal) {
        stateVariables.usersFiltersInclusive = newVal;
      }
    });

    if(!stateVariables.expandedUsers)
      stateVariables.expandedUsers = [];
    $scope.expandOrCollapseUser = function(userId)
    {
      var i=_.indexOf(stateVariables.expandedUsers,userId);
      if(i>=0)
        stateVariables.expandedUsers.splice(i,1);
      else
        stateVariables.expandedUsers.push(userId);
    }
    $scope.isCollapsed = function(userId)
    {
      return _.indexOf(stateVariables.expandedUsers,userId) < 0;
    }

    if(!stateVariables.usersSelected)
      stateVariables.usersSelected = {};
    $scope.usersSelected = stateVariables.usersSelected;
    $scope.toggleSelect = function($event,user) {
      if($event.target.id=='userDiv' || $event.target.id=='userLabel')
      {
        if($scope.usersSelected[user._id]) {
          $scope.selectAll = false;
          delete $scope.usersSelected[user._id];
        }
        else
          $scope.usersSelected[user._id] = true;
      }
    }

    if(!stateVariables.usersSearchKeywords)
      stateVariables.usersSearchKeywords = "";
    else
      $scope.usersSearchKeywords = stateVariables.usersSearchKeywords;
    $scope.$watch('usersSearchKeywords', function(newVal, oldVal) {
      if (newVal != oldVal) {
        $scope.usersSelected = stateVariables.usersSelected = {};
        $scope.selectAll = false;
        stateVariables.usersSearchKeywords = newVal;
      }
    });

    if(!stateVariables.selectedUsersFilters)
      stateVariables.selectedUsersFilters = [];
    $scope.multiSelectFiltersOutputModel = [];
    $scope.$watch('multiSelectFiltersOutputModel', function(newVal, oldVal) {
      if (!_.isEqual(newVal,oldVal)) {
        $scope.usersSelected = stateVariables.usersSelected = {};
        $scope.selectAll = false;
        stateVariables.selectedUsersFilters = [];
        for(var i=0; i<newVal.length; i++)
          stateVariables.selectedUsersFilters.push(newVal[i].id);
      }
    });
    function translateAndSetUpMultiSelectFiltersInputModel() {
      $scope.multiSelectFiltersInputModel = [];
      $scope.multiSelectFiltersInputModel.push({name: $translate.instant('SELECT_ALL'), filtersGroup: true});
      var filters = [
        {
          id: 'APPROVED',
          name: $translate.instant('APPROVED')
        },
        {
          id: 'NOT_APPROVED',
          name: $translate.instant('NOT_APPROVED'),
        },
        {
          id: 'VERIFIED',
          name: $translate.instant('VERIFIED'),
        },
        {
          id: 'NOT_VERIFIED',
          name: $translate.instant('NOT_VERIFIED'),
        },
        {
          id: 'ADMINISTRATORS',
          name: $translate.instant('ADMINISTRATORS'),
        },
        {
          id: 'REGULAR_USERS',
          name: $translate.instant('REGULAR_USERS'),
        },
        {
          id: 'EMAIL_ONLY_USERS',
          name: $translate.instant('EMAIL_ONLY_USERS'),
        },
        {
          id: 'EMAIL_SUBSCRIBED',
          name: $translate.instant('EMAIL_SUBSCRIBED'),
        },
        {
          id: 'NOT_EMAIL_SUBSCRIBED',
          name: $translate.instant('NOT_EMAIL_SUBSCRIBED'),
        },
        {
          id: 'LOCALLY_REGISTERED_USERS',
          name: $translate.instant('LOCALLY_REGISTERED_USERS'),
        },
        {
          id: 'FACEBOOK_REGISTERED_USERS',
          name: $translate.instant('FACEBOOK_REGISTERED_USERS'),
        },
        {
          id: 'PERMANENT_USERS',
          name: $translate.instant('PERMANENT_USERS'),
        },
      ]
      for(var i=0; i<filters.length; i++)
      {
        var filter = filters[i];
        filter.ticked = _.indexOf(stateVariables.selectedUsersFilters, filter.id)>-1 ? true : false
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

    $scope.filterFunction = function(user) {
      var returnValue = true;

      if($scope.multiSelectFiltersOutputModel.length==0)
        returnValue = returnValue && true;
      else {
        var filterApplies = false;
        if($scope.usersFiltersInclusive)
          filterApplies = true;
        for (var i = 0; i < $scope.multiSelectFiltersOutputModel.length; i++) {
          var filter = $scope.multiSelectFiltersOutputModel[i];
          if(filter.id == 'APPROVED')
          {
            if(user.approved) {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'NOT_APPROVED')
          {
            if(!user.approved) {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'VERIFIED')
          {
            if(user.verified) {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'NOT_VERIFIED')
          {
            if(!user.verified) {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'ADMINISTRATORS')
          {
            if(user.role=='admin') {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'REGULAR_USERS')
          {
            if(user.role=='user') {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'EMAIL_ONLY_USERS')
          {
            if(user.role=='email') {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'EMAIL_SUBSCRIBED')
          {
            if(user.emailSubscriptions && user.emailSubscriptions.length>0) {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'NOT_EMAIL_SUBSCRIBED')
          {
            if(!user.emailSubscriptions || user.emailSubscriptions.length==0) {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'LOCALLY_REGISTERED_USERS')
          {
            if(user.provider=='local') {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'FACEBOOK_REGISTERED_USERS')
          {
            if(user.provider=='facebook') {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
          else if(filter.id == 'PERMANENT_USERS')
          {
            if(user.permanent) {
              if(!$scope.usersFiltersInclusive) {
                filterApplies =  true;
                break;
              }
            }
            else if($scope.usersFiltersInclusive) {
              filterApplies = false;
              break;
            }
          }
        }
        returnValue = returnValue && filterApplies;
      }

      if(returnValue && $scope.usersSearchKeywords)
      {
        var keywords = $scope.usersSearchKeywords.split(" ");
        for(var i=0; i<keywords.length; i++)
        {
          var keyword = keywords[i].toLowerCase();
          if(
                String(user._id).toLowerCase().indexOf(keyword)>-1
            ||  (user.name && user.name.toLowerCase().indexOf(keyword)>-1)
            ||  user.email.toLowerCase().indexOf(keyword)>-1
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
      if($scope.loadingUsers) return;

      $scope.loadingUsers = true;

      if(!$scope.initialLoadDone) {
        Admin.getAllUsers(function (users) {
          $scope.users = users;
          $scope.loadingUsers = false;
          $scope.initialLoadDone = true;
        });
      }
      else
      {
        var filteredUserOriginalCount = $scope.filteredUsers.length;
        var apiMethod = function(callback) {
          Admin.getMoreAllUsers(window,function(err,numberOfUsersGotten) {
            $timeout(function(){
              $scope.selectAll = false;
                if (numberOfUsersGotten == 0 || window == 0) {
                $scope.noMoreUsers = true;
                $scope.loadingUsers = false;
              }
              else if($scope.filteredUsers.length!=filteredUserOriginalCount)
              {
                $scope.loadingUsers = false;
              }
              if($scope.loadingUsers)
                return callback(true);
              else
                return callback(null);
            },0,false);
          });
        }
        async.retry({times: 99999, interval: 0}, apiMethod, function() {});
      }
    }

    $scope.removeUser = Modal.confirm.remove(function(user) {
      Admin.removeUser(user,function(err){
        if(!err)
        {
          notify.config({
            startTop: 75,
            duration: 5000,
            position: 'center'
          });
          notify({
            message: $translate.instant('USER_REMOVED',{email:user.email})
          });
        }
        else {
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
            message: $translate.instant('USER_REMOVE_ERROR',{message: message})
          });
        }
      });
    });

    $scope.setFieldValue = function(action, field, value, user)
    {
      if(user[field] && ((!user[field]&&!value) || (user[field]==value) || (String(user[field]).length==String(value).length))) return;

      var actionTranslation = $translate.instant(action);

      Modal.confirm.update(function(user) {
        var fields = {};
        fields[field] = value;
        Admin.updateUserFields(user,fields,function(err,savedUser) {
          if(!err)
          {
            notify.config({
              startTop: 75,
              duration: 5000,
              position: 'center'
            });
            notify({
              message: $translate.instant('USER_UPDATED',{email:user.email, action:actionTranslation})
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
              message: $translate.instant('USER_UPDATE_ERROR',{email:user.email, message:message})
            });
          }
        });
      })(user.email,actionTranslation,user);
    }

    $scope.selectAll = false;
    $scope.toggleSelectAll = function() {
      if($scope.selectAll)
      {
        for(var i=0; i<$scope.users.length; i++)
        {
          var user = $scope.users[i];
          if($scope.filterFunction(user))
            $scope.usersSelected[user._id] = true;
        }
      }
      else
      {
        $scope.usersSelected = stateVariables.usersSelected = {};
      }
    }

    $scope.countSelected = function()
    {
      var count=0;
      for(var _id in $scope.usersSelected) {
        if ($scope.usersSelected.hasOwnProperty(_id) && !$scope.usersSelected[_id]) {
          $scope.selectAll = false;
          delete $scope.usersSelected[_id];
        }
        else if ($scope.usersSelected.hasOwnProperty(_id) && $scope.usersSelected[_id]) {
          count++;
        }
      }
      return count;
    }

    $scope.multipleRemove = function()
    {
      var userIds = [];
      for(var userId in $scope.usersSelected) {
        if ($scope.usersSelected[userId]) {
          var user = _.find($scope.users,{_id: userId});
          if(!user.permanent)
            userIds.push(userId);
          else {
            notify.config({
              startTop: 75,
              duration: 5000,
              position: 'center'
            });
            notify({
              message: $translate.instant('PERMANENT_ACCOUNT_MODIFY_ERROR')
            });
            return;
          }
        }
      }
      Modal.confirm.generic(function() {
        Admin.multipleRemoveUser(userIds,function(err){
          if(!err)
          {
            $scope.selectAll = false;
            $scope.usersSelected = stateVariables.usersSelected = {};
            notify.config({
              startTop: 75,
              duration: 5000,
              position: 'center'
            });
            notify({
              message: $translate.instant('MULTIPLE_ITEMS_REMOVED',{selectedCount: userIds.length})
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
      })('PLEASE_CONFIRM','MULTIPLE_REMOVE_CONFIRM',{selectedCount: userIds.length});
    }

    $scope.multipleUpdate = function(action)
    {
      var actionTranslation = $translate.instant(action);

      var selectedCount = $scope.countSelected();

      var userIds = [];
      for(var userId in $scope.usersSelected)
      {
        if($scope.usersSelected[userId]) {
          var user = _.find($scope.users,{_id: userId});
          if(action == 'APPROVED' && !user.approved && !user.permanent)
            userIds.push(userId);
          else if(action == 'NOT_APPROVED' && user.approved && !user.permanent)
            userIds.push(userId);
          else if(action == 'VERIFIED' && !user.verified && !user.permanent)
            userIds.push(userId);
          else if(action == 'NOT_VERIFIED' && user.verified && !user.permanent)
            userIds.push(userId);
          else if(action == 'EMAIL_SUBSCRIBED' && (!user.emailSubscriptions || user.emailSubscriptions.length==0))
            userIds.push(userId);
          else if(action == 'NOT_EMAIL_SUBSCRIBED' && user.emailSubscriptions && user.emailSubscriptions.length>0)
            userIds.push(userId);
          else if(action == 'ADMINISTRATOR' && user.role=='user' && !user.permanent)
            userIds.push(userId);
          else if(action == 'NOT_ADMINISTRATOR' && user.role=='admin' && !user.permanent)
            userIds.push(userId);
        }
      }

      if(userIds.length==0)
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
      if(userIds.length != selectedCount)
        confirmMessage = $translate.instant('MULTIPLE_UPDATE_APPLICABLE_ITEMS_MESSAGE',{selectedCount: selectedCount, applicableCount: userIds.length, action: actionTranslation})+" ";
      confirmMessage += $translate.instant('MULTIPLE_UPDATE_CONFIRM',{applicableCount: userIds.length, action: actionTranslation});
      Modal.confirm.generic(function() {
        var fields = {};
        if(action == 'APPROVED')
          fields['approved'] = true;
        else if(action == 'NOT_APPROVED')
          fields['approved'] = false;
        else if(action == 'VERIFIED')
          fields['verified'] = true;
        else if(action == 'NOT_VERIFIED')
          fields['verified'] = false;
        else if(action == 'EMAIL_SUBSCRIBED')
          fields['emailSubscriptions'] = ['all'];
        else if(action == 'NOT_EMAIL_SUBSCRIBED')
          fields['emailSubscriptions'] = [];
        else if(action == 'ADMINISTRATOR')
          fields['role'] = 'admin';
        else if(action == 'NOT_ADMINISTRATOR')
          fields['role'] = 'user';
        Admin.multipleUpdateUser(userIds,fields,function(err){
          if(!err)
          {
            $scope.selectAll = false;
            $scope.usersSelected = stateVariables.usersSelected = {};
            notify.config({
              startTop: 75,
              duration: 5000,
              position: 'center'
            });
            notify({
              message: $translate.instant('MULTIPLE_ITEMS_UPDATED',{applicableCount: userIds.length, action: actionTranslation})
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

    $scope.exportEmails = function() {
      var userEmails = "";
      for(var userId in $scope.usersSelected) {
        if ($scope.usersSelected[userId]) {
          var user = _.find($scope.users, {_id: userId});
          userEmails += user.email +", ";
        }
      }
      userEmails = userEmails.substr(0,userEmails.length-2);
      notify.config({
        startTop: 75,
        duration: 0,
        position: 'center'
      });
      notify({
        messageTemplate: '<p>'+$translate.instant('COPY_EXPORTED_EMAILS_MESSAGE')+':</p><textarea style="width:100%;" rows="8">'+userEmails+'</textarea>'
      });
      $scope.selectAll = false;
      $scope.usersSelected = stateVariables.usersSelected = {};
    }

  });
