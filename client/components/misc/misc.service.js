'use strict';

angular.module('classActApp')
  .factory('Misc', function ($rootScope, $cookies, CONSTANTS, $translate, $window, amMoment, $state) {

    return {

      setLanguageCookie: function(language) {
        var nowDate = new Date(),
            expDate = new Date(nowDate.getFullYear()+1, nowDate.getMonth(), nowDate.getDate());
        $cookies.put('language',language,{ expires: expDate });
      },

      setTokenCookie: function(token) {
        var nowDate = new Date(),
            expDate = new Date(nowDate.getFullYear()+1, nowDate.getMonth(), nowDate.getDate());
        $cookies.put('token',token,{ expires: expDate });
      },

      getToken: function() {
        return $cookies.get('token');
      },

      setPageTitle: function(currentState) {
        var pageTitle = CONSTANTS.WEBSITE_NAME;
        if (currentState && currentState.hasOwnProperty('title')) {
          if(currentState.title instanceof Array)
          {
            var translations = "";
            currentState.title.forEach(function(translationKey) {
              translations += $translate.instant(translationKey) + " ";
            });
            pageTitle = pageTitle+" - "+translations;
          }
          else
            pageTitle = pageTitle +" - "+ $translate.instant(currentState.title);
        }
        $rootScope.pageTitle = pageTitle;
      },

      replaceOrInsertInArray: function replaceOrInsertInArray(array, item, insertAtEnd)
      {
        var oldItem = _.find(array, {_id: item._id});
        var index = array.indexOf(oldItem);

        // replace oldItem if it exists
        // otherwise just add item to the collection
        if (oldItem) {
          //console.log("Replacing item in array: "+item._id);
          array.splice(index, 1, item);
        } else if(insertAtEnd) {
          //console.log("Pushing item to end of array: "+item._id);
          array.push(item);
        }
        else {
          //console.log("Pushing item to start of array: "+item._id);
          array.unshift(item);
        }
      },

      updateInArrayIfExists: function updateInArrayIfExists(array, item)
      {
        var oldItem = _.find(array, {_id: item._id});

        if (oldItem) {
          for(var key in item)
            oldItem[key] = item[key];
        }
      },

      changeLanguage: function(key) {
        this.setLanguageCookie(key);
        $translate.use(key);
        amMoment.changeLocale(key);
        this.setPageTitle($state.current);
      },

      responsiveDetection: function() {
        var w = $window.innerWidth;
        if (w < 768) {
          return 'xs';
        } else if (w < 992) {
          return 'sm';
        } else if (w < 1200) {
          return 'md';
        } else {
          return 'lg';
        }
      }


    };
  });
