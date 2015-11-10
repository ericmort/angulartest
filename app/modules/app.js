'use strict';

//
//  Initialize the Appstax app engine with your appkey
//
appstax.init("RHpxb29lQ0xXYWpn");

var module = angular.module('MyApp', [
    //'flow',
    //'ngSanitize',    
    'ui.router',
    'ui.bootstrap',
    //'angular-ladda',
    //'ngAnimate',
    'angular-loading-bar', 
    'bootstrapLightbox',
    'ngMaterial'
    //'angularSpinner'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $log, conf) {

      $stateProvider
        .state('public', {
          template: '<ui-view>',
          abstract: true    
      });


      $stateProvider
        .state('public.landingsite', {
          url: '/',
          templateUrl: 'modules/main/landingsite.html',
          controller: 'OpenCtrl'
      });

        $stateProvider
        .state('public.login', {
         url: '/login', 
        templateUrl: 'modules/user/login.html',
        controller: 'UserCtrl'
      });

      $stateProvider
        .state('public.signup', {
          url: '/signup',
          templateUrl: 'modules/user/signup.html',
          controller: 'UserCtrl'
      });

      $stateProvider
      .state('app', {
        url: '/app',
        templateUrl: 'modules/main/main.html',
        controller: 'MainCtrl',
        resolve: {
            groups: function(GroupService, $q, $log) {
                $log.debug("resolve groups1");
                return GroupService.getGroups();
            }
        }
      });

      $stateProvider
      .state('app.photos', {
        url: '/photos/:albumId',
        templateUrl: 'modules/main/photos.html',
        controller: function($scope, $log) {
          $log.debug("HERE")
        }
      });

      /*$stateProvider
      .state('app.albums', {
        url: '/albums/:groupId',
        templateUrl: 'modules/main/albums.html',
        controller: 'AlbumsCtrl',
        resolve: {
            groupId: function($stateParams) {
                return $stateParams.groupId;
            },
        }
      });*/



      /*$stateProvider
      .state('app.albums.entries', {
        url: '/entries',
        templateUrl: 'modules/main/album-entries.html',
        controller: 'AlbumsCtrl'
      });*/

      //$urlRouterProvider.otherwise('/app');
      
      // Send browser to landing page "/#/" when URL is "/"
      if(location.pathname === "/" && location.hash === "") {
        location.replace("/app");
      }

  }]);


module.config(function (LightboxProvider) {
      LightboxProvider.getImageUrl = function (post) {
        return post.image.url;
      };
    
      LightboxProvider.getImageCaption = function (post) {
        return post.text;
      };

      LightboxProvider.templateUrl = './lightbox.html';


});

module.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Loading...</div>';
}]);

/* Configure degug logging */
module.config(function ($logProvider) {
  $logProvider.debugEnabled(true);
});


/* Directive for autofocusing the input field in modals */

module.directive('focusMe', function($timeout) {
    return function(scope, element, attrs) {
        attrs.$observe('focusMe', function(value) {
            if ( value==="true" ) {
                $timeout(function(){
                    element[0].focus();
                },5);
            }
        });
    }
});



/*
 * Module that checks if the user is logged in every time a route is changed.
 * If the user is logged in he gets to proceed to the requested url, if not he is redirected to
 * the main page.
 */

module.run(['$rootScope', '$state', '$location', '$log', function ($rootScope, $state, $location, $log) {
  $rootScope.$on("$stateChangeStart", function (event, toState, fromState, fromParams) {

    $rootScope.loading = true;
    if (appstax.currentUser()) {
      $rootScope.currentUser = appstax.currentUser().username;
      $log.debug('User is logged in');
    } else {
      $location.path("/");
      $log.debug('User is not logged in');
    }
   
  });

  $rootScope.$on("$stateChangeSuccess", function (event, toState, fromState, fromParams) {
        
    $rootScope.loading = false;
        
  });

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
    $log.error('Error from stateChange: ' + error);
  });

    // somewhere else
  $rootScope.$on(['$stateNotFound', '$log'],
    function(event, unfoundState, fromState, fromParams, $log){
        $log.error('Unfound state to' + JSON.stringify(unfoundState.to)); 
        $log.error('unfoundState params:',  unfoundState.toParams);
        $log.error('unfoundState options:', unfoundState.options); 
    });
}]);

