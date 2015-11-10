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
    'bootstrapLightbox'
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


angular.module('MyApp').provider("conf", function() {
  
return {
    $get: function () {
      return {
        siteName: "MyApp"
      };
    }
  };

});
'use strict';

angular.module('MyApp').controller('AlbumsCtrl', function ($log, $scope, $rootScope, $state,  groupId, $modal) {
   $log.debug('Entering AlbumsCtrl');
   $rootScope.currentGroupId = groupId;
   $log.debug("AlbumsCtrl.currentGroupId = " + groupId);

   var groups = $scope.groups;
   for(var i = 0; i < groups.length; i++) {
     if (groups[i].id == groupId) {
         $scope.currentGroup = groups[i];
         $rootScope.currentGroup = groups[i];
   
         break;
     }
   }
   $log.debug("AlbumsCtrl: currentGroup=" + JSON.stringify($scope.currentGroup))
   $scope.posts = $scope.currentGroup.posts;
   $scope.mytest = "eric is here"


   $scope.openPostModal = function() {  
      $log.debug("enter openPostModal")     
      var modalInstance = $modal.open({
         templateUrl: 'modules/main/createPost.html',
         controller: 'modalNewPostCtrl',
         
      });

      modalInstance.result.then(function(post){
         //$log.debug("post result: " + JSON.stringify($scope.posts));
         //$log.debug("post result2: " + JSON.stringify(post));
         //$log.debug("post result3: " + JSON.stringify($rootScope.currentGroup.posts));

         //$scope.posts.push(post);
         //$state.go($state.current, {}, {reload:true});
      });
   }



   $log.debug('Exiting AlbumsCtrl');
});   


angular.module('MyApp').controller('PostsListCtrl', function ($log, $scope, groups, $stateParams, Lightbox) {
    $log.debug('Entering PostsListCtrl');
    $scope.groups = groups; 
    for(var i = 0; i < groups.length; i++) {
      if (groups[i].id == $stateParams.groupId) {
          $scope.currentGroup = groups[i];
          var posts = $scope.currentGroup.posts
          if (posts != null && posts.length > 0) {
            for(var j=0; j< posts.length; j++) {
              var post = posts[j];
              if (post.image != null) {
                post.image.thumbnail = post.image.imageUrl("resize", {width:200});
              }
            }
          }
          break;
      }
    }
    $scope.posts = $scope.currentGroup.posts;

    $scope.openLightboxModal = function (index) {
      Lightbox.openModal($scope.posts, index);
    };

    $log.debug('Exiting PostsListCtrl');
});


angular.module('MyApp').controller('modalNewPostCtrl', function ($log, $scope,  $rootScope, $modalInstance, GroupService) {
    var currentGroup = $rootScope.currentGroup;
    $log.debug('entering: modalNewPostCtrl: currentGroup=' + JSON.stringify(currentGroup))

    $scope.ok = function(file) {
      $scope.loading = true;

      var newPost = {
          "text": $scope.text,
          "group": currentGroup,
          "image" :  appstax.file(file)
      };
      GroupService.savePost(newPost).then(function(post){
          $modalInstance.close(post);
          post.image.thumbnail = post.image.imageUrl("resize", {width:200});
                        
      }, function(error){
        $scope.error = error.errorMessage;
        $log.error('ERROR: ' + error);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

});

angular.module('MyApp').controller('modalInviteCtrl', function ($log, $scope,  $rootScope, $modalInstance, GroupService) {
    var currentGroup = $rootScope.currentGroup;
    $log.debug('entering: modalInviteCtrl: currentGroup=' + JSON.stringify(currentGroup))

    $scope.ok = function(file) {
      $scope.loading = true;

      var newInvite = {
          "email": $scope.email,
          "group": currentGroup
      };
      GroupService.invite(newInvite).then(function(invite){
          $modalInstance.close(invite);
                        
      }, function(error){
        $scope.error = error.errorMessage;
        $log.error('ERROR: ' + error);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

});


angular.module('MyApp').controller('LightboxCtrl', function ($log, $scope, Lightbox) {
    $log.debug('entering: LightboxCtrl')

    $scope.nextImage = function() {
      $log.debug("Enter nextImage")
      $scope.showSpinner = true;
      Lightbox.nextImage();
//      $scope.showSpinner = false;
       
    }
    $log.debug('Exiting: LightboxCtrl');
});


angular.module('MyApp').controller('modalNewGroupCtrl', function ($log, $scope, $modalInstance, GroupService) {
    $log.debug('entering: modalNewGroupCtrl')
      
    $scope.change = function() {
      $log.debug("Change is gonna come");
    }
    
    $scope.ok = function () {
      
      var newGroup = {
          "name":$scope.type.name
      };
      $log.debug("Group to save: " + JSON.stringify(newGroup));

      GroupService.saveGroup(newGroup).then(function(group){
        //$scope.type.sysObjectId = group.sysObjectId;
        $modalInstance.close(group);

      }, function(error){
        $scope.error = error.errorMessage;
        $log.error('ERROR: ' + error);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $log.debug('Exiting: modalNewGroupCtrl')
});//End modalNewGroupCtrl

module.directive('fileChanged', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.fileChanged);
      console.log("fileChanged:" + (JSON.stringify(attrs.fileChanged)))
      element.bind('change', onChangeHandler);
    }
  };
});

'use strict';

angular.module('MyApp').controller('GroupsCtrl', function ($log, $scope, $rootScope, $state, conf, GroupService) {
   $log.debug('Entering GroupsCtrl');
          
    $scope.addGroup = function () {
      var newGroup = {
          "name":$scope.type.name
      };
      $log.debug("Group to save: " + JSON.stringify(newGroup));

      GroupService.saveGroup(newGroup).then(function(group){
        //$scope.type.sysObjectId = group.sysObjectId;
        $modalInstance.close(group);

      }, function(error){
        $scope.error = error.errorMessage;
        $log.error('ERROR: ' + error);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

   $log.debug('Exiting GroupsCtrl');
});

'use strict';

angular.module('MyApp').controller('MainCtrl', function ($log, $scope, $rootScope, $state, conf, groups, $modal, GroupService) {
   $log.debug('Entering MainCtrl');
   $scope.currentUser = appstax.currentUser();

   $scope.user = appstax;
   $scope.groups = groups;
   $log.debug("MainCtrl: groups =", $scope.groups);

   $scope.logout = function(){
   	$log.debug("Trying to logout");
   	appstax.logout();
   	$rootScope.currentUser = null;
   	$state.go("public.landingsite", {},{reload:true, notify:true,inherit:true});
   }


   $scope.saveNewGroup = function() {
      var newGroup = {
         "name" : $scope.name
      }
      GroupService.saveGroup(newGroup).then(function(post){
                        
      }, function(error){
        $scope.error = error.errorMessage;
        $log.error('ERROR: ' + error);
      });
   }

   $scope.newAlbum = function(group, name) {

      var newAlbum = {
         "name" : name,
         "group" : group
      }
      GroupService.saveAlbum(newAlbum).then(function(post){
      }, function(error){
        $scope.error = error.errorMessage;
        $log.error('ERROR: ' + error);
      });
   }
   $log.debug('Exiting MainCtrl');
});   

'use strict';

angular.module('MyApp').controller('PostsMainCtrl', function ($log, $scope, $rootScope, $state,  groupId, $modal) {
   $log.debug('Entering PostsCtrl');
   $rootScope.currentGroupId = groupId;
   $log.debug("PostsMainCtrl.currentGroupId = " + groupId);

   var groups = $scope.groups;
   for(var i = 0; i < groups.length; i++) {
     if (groups[i].id == groupId) {
         $scope.currentGroup = groups[i];
         $rootScope.currentGroup = groups[i];
   
         break;
     }
   }
   $log.debug("PostsMainCtrl: currentGroup=" + JSON.stringify($scope.currentGroup))
   $scope.posts = $scope.currentGroup.posts;
   $scope.mytest = "eric is here"

   $scope.openGroupModal = function() {       
      var modalInstance = $modal.open({
         templateUrl: 'modules/main/createGroup.html',
         controller: 'modalNewGroupCtrl',
         
      });

      modalInstance.result.then(function(group){
         $log.debug('opened openGroupModal');
         //console.log("group result: " + JSON.stringify(group));
         $scope.groups.push(group)      
      });
   }   

   $scope.openPostModal = function() {  
      $log.debug("enter openPostModal")     
      var modalInstance = $modal.open({
         templateUrl: 'modules/main/createPost.html',
         controller: 'modalNewPostCtrl',
         
      });

      modalInstance.result.then(function(post){
         //$log.debug("post result: " + JSON.stringify($scope.posts));
         //$log.debug("post result2: " + JSON.stringify(post));
         //$log.debug("post result3: " + JSON.stringify($rootScope.currentGroup.posts));

         //$scope.posts.push(post);
         //$state.go($state.current, {}, {reload:true});
      });
   }

    $scope.openInviteModal = function() {  
      $log.debug("enter openInviteModal")     
      var modalInstance = $modal.open({
         templateUrl: 'modules/main/invite.html',
         controller: 'modalInviteCtrl',
         
      });

   }


   $log.debug('Exiting PostsCtrl');
});   


angular.module('MyApp').controller('PostsListCtrl', function ($log, $scope, groups, $stateParams, Lightbox) {
    $log.debug('Entering PostsListCtrl');
    $scope.groups = groups; 
    for(var i = 0; i < groups.length; i++) {
      if (groups[i].id == $stateParams.groupId) {
          $scope.currentGroup = groups[i];
          var posts = $scope.currentGroup.posts
          if (posts != null && posts.length > 0) {
            for(var j=0; j< posts.length; j++) {
              var post = posts[j];
              if (post.image != null) {
                post.image.thumbnail = post.image.imageUrl("resize", {width:200});
              }
            }
          }
          break;
      }
    }
    $scope.posts = $scope.currentGroup.posts;

    $scope.openLightboxModal = function (index) {
      Lightbox.openModal($scope.posts, index);
    };

    $log.debug('Exiting PostsListCtrl');
});


angular.module('MyApp').controller('modalNewPostCtrl', function ($log, $scope,  $rootScope, $modalInstance, GroupService) {
    var currentGroup = $rootScope.currentGroup;
    $log.debug('entering: modalNewPostCtrl: currentGroup=' + JSON.stringify(currentGroup))

    $scope.ok = function(file) {
      $scope.loading = true;

      var newPost = {
          "text": $scope.text,
          "group": currentGroup,
          "image" :  appstax.file(file)
      };
      GroupService.savePost(newPost).then(function(post){
          $modalInstance.close(post);
          post.image.thumbnail = post.image.imageUrl("resize", {width:200});
                        
      }, function(error){
        $scope.error = error.errorMessage;
        $log.error('ERROR: ' + error);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

});

angular.module('MyApp').controller('modalInviteCtrl', function ($log, $scope,  $rootScope, $modalInstance, GroupService) {
    var currentGroup = $rootScope.currentGroup;
    $log.debug('entering: modalInviteCtrl: currentGroup=' + JSON.stringify(currentGroup))

    $scope.ok = function(file) {
      $scope.loading = true;

      var newInvite = {
          "email": $scope.email,
          "group": currentGroup
      };
      GroupService.invite(newInvite).then(function(invite){
          $modalInstance.close(invite);
                        
      }, function(error){
        $scope.error = error.errorMessage;
        $log.error('ERROR: ' + error);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

});


angular.module('MyApp').controller('LightboxCtrl', function ($log, $scope, Lightbox) {
    $log.debug('entering: LightboxCtrl')

    $scope.nextImage = function() {
      $log.debug("Enter nextImage")
      $scope.showSpinner = true;
      Lightbox.nextImage();
//      $scope.showSpinner = false;
       
    }
    $log.debug('Exiting: LightboxCtrl');
});


angular.module('MyApp').controller('modalNewGroupCtrl', function ($log, $scope, $modalInstance, GroupService) {
    $log.debug('entering: modalNewGroupCtrl')
      
    $scope.change = function() {
      $log.debug("Change is gonna come");
    }
    
    $scope.ok = function () {
      
      var newGroup = {
          "name":$scope.type.name
      };
      $log.debug("Group to save: " + JSON.stringify(newGroup));

      GroupService.saveGroup(newGroup).then(function(group){
        //$scope.type.sysObjectId = group.sysObjectId;
        $modalInstance.close(group);

      }, function(error){
        $scope.error = error.errorMessage;
        $log.error('ERROR: ' + error);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $log.debug('Exiting: modalNewGroupCtrl')
});//End modalNewGroupCtrl

module.directive('fileChanged', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.fileChanged);
      console.log("fileChanged:" + (JSON.stringify(attrs.fileChanged)))
      element.bind('change', onChangeHandler);
    }
  };
});

'use strict';

var module = angular.module('MyApp');

module.service('GroupService', ['$http', '$q', '$log', function($http, $q, $log) {
	$log.debug("Entering GroupService");
    //var groups = [{"id":"m4NpAPhv4vBV","internalId":"internal-id-1-1","collectionName":"groups","created":"2015-11-04T13:53:02.069Z","updated":"2015-11-04T13:59:22.015Z","permissions":[],"posts":[{"id":"vbrOdBhYnLYp","internalId":"internal-id-1-2","collectionName":"posts","created":"2015-11-04T13:58:52.622Z","updated":"2015-11-04T13:59:22.151Z","permissions":[],"text":"asdsad"},{"id":"43Akk6ua0ObzB","internalId":"internal-id-1-3","collectionName":"posts","created":"2015-11-04T13:59:04.603Z","updated":"2015-11-04T13:59:22.120Z","permissions":[],"text":"post 2"},{"id":"xaYow3Gc7lqwP","internalId":"internal-id-1-4","collectionName":"posts","created":"2015-11-04T13:59:21.906Z","updated":"2015-11-04T13:59:21.906Z","permissions":[],"text":"post 4"},{"id":"jDLwzetKzlBzq","internalId":"internal-id-1-5","collectionName":"posts","created":"2015-11-04T13:59:11.386Z","updated":"2015-11-04T13:59:22.156Z","permissions":[],"text":"post 3"}]},{"id":"O9L5vqeCXv4N4x","internalId":"internal-id-1-6","collectionName":"groups","created":"2015-11-04T13:52:17.339Z","updated":"2015-11-04T13:59:40.556Z","permissions":[],"posts":[{"id":"zYrlNYKfgvOr4","internalId":"internal-id-1-7","collectionName":"posts","created":"2015-11-04T13:59:40.458Z","updated":"2015-11-04T13:59:40.458Z","permissions":[],"text":"post 2"},{"id":"kOP4NkI9BPMd","internalId":"internal-id-1-8","collectionName":"posts","created":"2015-11-04T13:59:33.692Z","updated":"2015-11-04T13:59:40.655Z","permissions":[],"text":"post 1"}]},{"id":"KKwL81VU53Aw6B","internalId":"internal-id-1-9","collectionName":"groups","created":"2015-11-04T13:51:43.021Z","updated":"2015-11-04T14:06:45.273Z","permissions":[],"posts":[{"id":"gzdleRdfnPYwo","internalId":"internal-id-1-10","collectionName":"posts","created":"2015-11-04T14:01:50.177Z","updated":"2015-11-04T14:06:45.394Z","permissions":[],"text":"post 1"},{"id":"b8bM7rc55NrZ","internalId":"internal-id-1-11","collectionName":"posts","created":"2015-11-04T14:06:45.154Z","updated":"2015-11-04T14:06:45.154Z","permissions":[],"text":"adasd"}]},{"id":"16jggDcmarb8","internalId":"internal-id-1-12","collectionName":"groups","created":"2015-11-04T13:50:32.644Z","updated":"2015-11-04T14:06:37.316Z","permissions":[],"posts":[{"id":"qX41MYgSOxB4B7","internalId":"internal-id-1-13","collectionName":"posts","created":"2015-11-04T14:06:37.191Z","updated":"2015-11-04T14:06:37.191Z","permissions":[],"text":"adasd"},{"id":"dPneDmubpqmlR","internalId":"internal-id-1-14","collectionName":"posts","created":"2015-11-04T14:02:03.666Z","updated":"2015-11-04T14:06:37.435Z","permissions":[],"text":"post 2"}]},{"id":"Yd65eOFdojzb","internalId":"internal-id-1-15","collectionName":"groups","created":"2015-11-04T13:49:06.719Z","updated":"2015-11-04T14:03:36.331Z","permissions":[],"posts":[{"id":"kX31RLXt537aek","internalId":"internal-id-1-16","collectionName":"posts","created":"2015-11-04T14:03:36.206Z","updated":"2015-11-04T14:03:36.206Z","permissions":[],"text":"dadad"}]},{"id":"dKwBRn0FRPmnP","internalId":"internal-id-1-17","collectionName":"groups","created":"2015-11-04T13:48:57.912Z","updated":"2015-11-04T14:05:13.329Z","permissions":[],"posts":[{"id":"BX6Aq09HOd8Ld","internalId":"internal-id-1-18","collectionName":"posts","created":"2015-11-04T14:05:13.209Z","updated":"2015-11-04T14:05:13.209Z","permissions":[],"text":"adasdas"}]},{"id":"BXBVeyvuR89xbM","internalId":"internal-id-1-19","collectionName":"groups","created":"2015-11-04T13:48:47.589Z","updated":"2015-11-04T13:48:47.589Z","permissions":[]},{"id":"LR1rX0Of4Gl5GA","internalId":"internal-id-1-20","collectionName":"groups","created":"2015-11-04T13:40:07.279Z","updated":"2015-11-04T14:05:21.195Z","permissions":[],"posts":[{"id":"1O816rTBaZvL","internalId":"internal-id-1-21","collectionName":"posts","created":"2015-11-04T14:05:21.073Z","updated":"2015-11-04T14:05:21.073Z","permissions":[],"text":"qwewqewqe"},{"id":"1y0AK3tZDqrK","internalId":"internal-id-1-22","collectionName":"posts","created":"2015-11-04T14:05:17.711Z","updated":"2015-11-04T14:05:21.314Z","permissions":[],"text":"adsadasd"}]},{"id":"aywqR8RcwXMrl","internalId":"internal-id-1-23","collectionName":"groups","created":"2015-11-04T12:38:51.668Z","updated":"2015-11-04T13:03:29.751Z","permissions":[],"name":"g6","posts":[{"id":"KwMaDkc5noYaw","internalId":"internal-id-1-24","collectionName":"posts","created":"2015-11-04T12:38:58.203Z","updated":"2015-11-04T13:03:29.862Z","permissions":[],"text":"p1"},{"id":"Bwp0WMtoezkL","internalId":"internal-id-1-25","collectionName":"posts","created":"2015-11-04T12:39:03.741Z","updated":"2015-11-04T13:03:29.866Z","permissions":[],"text":"p2"},{"id":"dKr60mOhXrYWj","internalId":"internal-id-1-26","collectionName":"posts","created":"2015-11-04T12:59:52.977Z","updated":"2015-11-04T13:03:29.905Z","permissions":[],"text":"p3"},{"id":"9PloMbeTkMLYVq","internalId":"internal-id-1-27","collectionName":"posts","created":"2015-11-04T13:03:04.408Z","updated":"2015-11-04T13:03:29.915Z","permissions":[],"text":"asd"},{"id":"wK9XxdFkBpDk","internalId":"internal-id-1-28","collectionName":"posts","created":"2015-11-04T13:00:38.839Z","updated":"2015-11-04T13:03:29.870Z","permissions":[],"text":"kanskje"},{"id":"qj70b8UOYZNpd","internalId":"internal-id-1-29","collectionName":"posts","created":"2015-11-04T13:02:22.870Z","updated":"2015-11-04T13:03:29.905Z","permissions":[],"text":"p5"},{"id":"1B7qmwWTa5M1ob","internalId":"internal-id-1-30","collectionName":"posts","created":"2015-11-04T13:03:09.729Z","updated":"2015-11-04T13:03:29.920Z","permissions":[],"text":"p5"},{"id":"AGvKA8crBeaW","internalId":"internal-id-1-31","collectionName":"posts","created":"2015-11-04T13:03:20.788Z","updated":"2015-11-04T13:03:29.925Z","permissions":[],"text":"dette er en test"},{"id":"9aGaYBcbVL5v","internalId":"internal-id-1-32","collectionName":"posts","created":"2015-11-04T13:03:29.643Z","updated":"2015-11-04T13:03:29.643Z","permissions":[],"text":"en yny"},{"id":"Vez7lxHRjv0Le","internalId":"internal-id-1-33","collectionName":"posts","created":"2015-11-04T13:00:22.898Z","updated":"2015-11-04T13:03:29.903Z","permissions":[],"text":"p3"}]},{"id":"nXODPG6IPGwD3","internalId":"internal-id-1-34","collectionName":"groups","created":"2015-11-04T12:37:22.640Z","updated":"2015-11-04T13:56:04.006Z","permissions":[],"name":"gruppe 5","posts":[{"id":"xav4xdpcO6WyR","internalId":"internal-id-1-35","collectionName":"posts","created":"2015-11-04T12:37:31.179Z","updated":"2015-11-04T13:56:04.116Z","permissions":[],"text":"post 1"},{"id":"WM8Lv4ei6aeqq","internalId":"internal-id-1-36","collectionName":"posts","created":"2015-11-04T13:53:59.318Z","updated":"2015-11-04T13:56:04.113Z","permissions":[],"text":"adasdad"},{"id":"o5o3eXtZOYZR5","internalId":"internal-id-1-37","collectionName":"posts","created":"2015-11-04T13:55:14.776Z","updated":"2015-11-04T13:56:04.163Z","permissions":[],"text":"post 4"},{"id":"Z88pX4gFevRe4","internalId":"internal-id-1-38","collectionName":"posts","created":"2015-11-04T13:56:03.900Z","updated":"2015-11-04T13:56:03.900Z","permissions":[],"text":"post 5"},{"id":"rGxkGMLHB3WqG","internalId":"internal-id-1-39","collectionName":"posts","created":"2015-11-04T12:38:41.101Z","updated":"2015-11-04T13:56:04.117Z","permissions":[],"text":"post 2"},{"id":"LRoOBvbtGP7yz","internalId":"internal-id-1-40","collectionName":"posts","created":"2015-11-04T12:38:44.733Z","updated":"2015-11-04T13:56:04.163Z","permissions":[],"text":"post 3"}]},{"id":"AV3lAdosGD7xXl","internalId":"internal-id-1-41","collectionName":"groups","created":"2015-11-04T12:36:41.070Z","updated":"2015-11-04T12:37:14.468Z","permissions":[],"name":"gruppe 4","posts":[{"id":"poxnGKHk5XRG","internalId":"internal-id-1-42","collectionName":"posts","created":"2015-11-04T12:36:48.491Z","updated":"2015-11-04T12:36:48.491Z","permissions":[],"text":"post 1"},{"id":"gz4r6aKH8zX8X","internalId":"internal-id-1-43","collectionName":"posts","created":"2015-11-04T12:37:14.365Z","updated":"2015-11-04T12:37:14.365Z","permissions":[],"text":"post 5"}]},{"id":"q5eLakcOAqdZq","internalId":"internal-id-1-44","collectionName":"groups","created":"2015-11-04T12:35:53.924Z","updated":"2015-11-04T13:56:15.796Z","permissions":[],"name":"gruppe 3","posts":[{"id":"XB77xBuvyG3kb","internalId":"internal-id-1-45","collectionName":"posts","created":"2015-11-04T13:56:15.693Z","updated":"2015-11-04T13:56:15.693Z","permissions":[],"text":"post 3"},{"id":"Aj5vjyCGeKDj","internalId":"internal-id-1-46","collectionName":"posts","created":"2015-11-04T12:36:34.245Z","updated":"2015-11-04T13:56:15.898Z","permissions":[],"text":"post 2"},{"id":"3wG4AmoHRRxNVe","internalId":"internal-id-1-47","collectionName":"posts","created":"2015-11-04T12:36:01.101Z","updated":"2015-11-04T13:56:15.906Z","permissions":[],"text":"post 1"}]},{"id":"kXyVyw7CxnY3j","internalId":"internal-id-1-48","collectionName":"groups","created":"2015-11-04T12:33:25.914Z","updated":"2015-11-04T12:35:44.311Z","permissions":[],"name":"gruppe 2","posts":[{"id":"VB3mz3ncaZbgX","internalId":"internal-id-1-49","collectionName":"posts","created":"2015-11-04T12:35:44.190Z","updated":"2015-11-04T12:35:44.190Z","permissions":[],"text":"post 5"},{"id":"qnao1ZHmN4Wo","internalId":"internal-id-1-50","collectionName":"posts","created":"2015-11-04T12:33:34.412Z","updated":"2015-11-04T12:33:34.412Z","permissions":[],"text":"post 1"},{"id":"pNweMztrqrNw","internalId":"internal-id-1-51","collectionName":"posts","created":"2015-11-04T12:34:26.601Z","updated":"2015-11-04T12:34:26.601Z","permissions":[],"text":"post 3"},{"id":"nbzDz8cYw7zb","internalId":"internal-id-1-52","collectionName":"posts","created":"2015-11-04T12:34:55.872Z","updated":"2015-11-04T12:34:55.872Z","permissions":[],"text":"post 4"},{"id":"wVPZjG6UzbAeL","internalId":"internal-id-1-53","collectionName":"posts","created":"2015-11-04T12:33:41.262Z","updated":"2015-11-04T12:33:41.262Z","permissions":[],"text":"post 2"}]},{"id":"WlWYmVC7eeXd","internalId":"internal-id-1-54","collectionName":"groups","created":"2015-11-04T12:32:40.907Z","updated":"2015-11-04T12:32:48.036Z","permissions":[],"name":"gruppe 1","posts":[{"id":"4o1lmPGt4aGeW","internalId":"internal-id-1-55","collectionName":"posts","created":"2015-11-04T12:32:47.921Z","updated":"2015-11-04T12:32:47.921Z","permissions":[],"text":"post 1"}]},{"id":"aRbWRvIdyzyy","internalId":"internal-id-1-56","collectionName":"groups","created":"2015-11-04T12:28:58.708Z","updated":"2015-11-04T12:29:06.915Z","permissions":[],"name":"dilldall2","posts":[{"id":"gzxWazPuaprvM","internalId":"internal-id-1-57","collectionName":"posts","created":"2015-11-04T12:29:06.809Z","updated":"2015-11-04T12:29:06.809Z","permissions":[],"text":"12"}]},{"id":"5ww9KqkTkmPkLP","internalId":"internal-id-1-58","collectionName":"groups","created":"2015-11-04T12:27:29.493Z","updated":"2015-11-04T12:32:26.361Z","permissions":[],"name":"dilldall","posts":[{"id":"39Vkm4fm5KVK","internalId":"internal-id-1-59","collectionName":"posts","created":"2015-11-04T12:27:37.969Z","updated":"2015-11-04T12:27:37.969Z","permissions":[],"text":"kanskje 1"},{"id":"wVpjxNWF741b9","internalId":"internal-id-1-60","collectionName":"posts","created":"2015-11-04T12:27:47.974Z","updated":"2015-11-04T12:27:47.974Z","permissions":[],"text":"kanskje2"},{"id":"yLz83RIjzR4L","internalId":"internal-id-1-61","collectionName":"posts","created":"2015-11-04T12:27:38.275Z","updated":"2015-11-04T12:27:38.275Z","permissions":[],"text":"kanskje 1"},{"id":"e4ZXwKWuanYK6","internalId":"internal-id-1-62","collectionName":"posts","created":"2015-11-04T12:27:53.839Z","updated":"2015-11-04T12:27:53.839Z","permissions":[],"text":"kanskje3"},{"id":"d0wOXaixZMK6","internalId":"internal-id-1-63","collectionName":"posts","created":"2015-11-04T12:27:53.595Z","updated":"2015-11-04T12:27:53.595Z","permissions":[],"text":"kanskje3"},{"id":"K08xbqCqzM0x","internalId":"internal-id-1-64","collectionName":"posts","created":"2015-11-04T12:32:26.242Z","updated":"2015-11-04T12:32:26.242Z","permissions":[],"text":"kanskje4"}]},{"id":"eneXw4UlpVnm5","internalId":"internal-id-1-65","collectionName":"groups","created":"2015-11-03T12:07:23.639Z","updated":"2015-11-04T11:50:57.695Z","permissions":[],"name":"dilldall5","posts":[{"id":"lL6gZYNUMYlllr","internalId":"internal-id-1-66","collectionName":"posts","created":"2015-11-03T22:26:18.802Z","updated":"2015-11-03T22:26:18.802Z","permissions":[],"text":"dette er en test i dillldall5"},{"id":"oYarDDCZ8ePRm","internalId":"internal-id-1-67","collectionName":"posts","created":"2015-11-04T11:47:12.122Z","updated":"2015-11-04T11:47:12.122Z","permissions":[],"text":"asdasd"},{"id":"01MwW0xt7BwOpK","internalId":"internal-id-1-68","collectionName":"posts","created":"2015-11-03T21:30:04.363Z","updated":"2015-11-03T21:30:04.363Z","permissions":[],"text":"asdqwe"},{"id":"nXde6KDTzvVAr","internalId":"internal-id-1-69","collectionName":"posts","created":"2015-11-04T11:47:29.425Z","updated":"2015-11-04T11:47:29.425Z","permissions":[],"text":"kalle balle"},{"id":"KKxvglzhXv5R8","internalId":"internal-id-1-70","collectionName":"posts","created":"2015-11-03T22:26:37.602Z","updated":"2015-11-03T22:26:37.602Z","permissions":[],"text":"dette er en test i dilldall4\nenda en linke"},{"id":"7AYqnBrhVe3aZ4","internalId":"internal-id-1-71","collectionName":"posts","created":"2015-11-03T21:20:09.691Z","updated":"2015-11-03T21:20:09.691Z","permissions":[],"text":"asdasd"},{"id":"m4DMLjbu1w93Y","internalId":"internal-id-1-72","collectionName":"posts","created":"2015-11-04T11:16:27.393Z","updated":"2015-11-04T11:16:27.393Z","permissions":[],"text":"wqeqwewqe"},{"id":"3wApReqfRO1Rka","internalId":"internal-id-1-73","collectionName":"posts","created":"2015-11-04T11:12:57.078Z","updated":"2015-11-04T11:12:57.078Z","permissions":[],"text":"qwewqewqe"},{"id":"RprXbrIO3vRD","internalId":"internal-id-1-74","collectionName":"posts","created":"2015-11-04T11:13:05.061Z","updated":"2015-11-04T11:13:05.061Z","permissions":[],"text":"wqewqewqe"},{"id":"K7ayrVU5GGG65","internalId":"internal-id-1-75","collectionName":"posts","created":"2015-11-04T11:13:14.565Z","updated":"2015-11-04T11:13:14.565Z","permissions":[],"text":"asdsadsad"},{"id":"m401z5dUgldog","internalId":"internal-id-1-76","collectionName":"posts","created":"2015-11-04T11:14:15.919Z","updated":"2015-11-04T11:14:15.919Z","permissions":[],"text":"asdasdasd"},{"id":"Bmz98xiROazV3","internalId":"internal-id-1-77","collectionName":"posts","created":"2015-11-04T11:16:11.409Z","updated":"2015-11-04T11:16:11.409Z","permissions":[],"text":"asdasdasd"},{"id":"v8ymZain5VoA","internalId":"internal-id-1-78","collectionName":"posts","created":"2015-11-04T11:50:57.574Z","updated":"2015-11-04T11:50:57.574Z","permissions":[],"text":"eric3"},{"id":"ZKbp3ghOW0b3r","internalId":"internal-id-1-79","collectionName":"posts","created":"2015-11-04T11:48:41.954Z","updated":"2015-11-04T11:48:41.954Z","permissions":[],"text":"eric eric"}]},{"id":"v5qNrDtzan9n","internalId":"internal-id-1-80","collectionName":"groups","created":"2015-11-03T12:05:49.812Z","updated":"2015-11-04T11:17:55.374Z","permissions":[],"name":"dilldall4","posts":[{"id":"lMwaw6FD1a1d","internalId":"internal-id-1-81","collectionName":"posts","created":"2015-11-03T22:31:03.225Z","updated":"2015-11-03T22:31:03.225Z","permissions":[],"text":"denne skal i dilldall4"},{"id":"Gerd6l9u70L0lq","internalId":"internal-id-1-82","collectionName":"posts","created":"2015-11-04T11:17:55.265Z","updated":"2015-11-04T11:17:55.265Z","permissions":[],"text":"asdsadsad"}]},{"id":"ym40DjTMLVVj","internalId":"internal-id-1-83","collectionName":"groups","created":"2015-11-03T12:05:36.772Z","updated":"2015-11-04T11:54:24.641Z","permissions":[],"name":"dilldall3","posts":[{"id":"MoGwpaH9vZ8Y","internalId":"internal-id-1-84","collectionName":"posts","created":"2015-11-03T21:09:10.803Z","updated":"2015-11-03T21:09:10.803Z","permissions":[],"text":"asdasd"},{"id":"0VD3Zli71nYlZ","internalId":"internal-id-1-85","collectionName":"posts","created":"2015-11-03T22:27:18.782Z","updated":"2015-11-03T22:27:18.782Z","permissions":[],"text":"og denne skal i dilldall3"},{"id":"1zqw7Oimnra3","internalId":"internal-id-1-86","collectionName":"posts","created":"2015-11-04T11:31:31.489Z","updated":"2015-11-04T11:31:31.489Z","permissions":[],"text":"adsad"},{"id":"bAN57DBUpX5AL","internalId":"internal-id-1-87","collectionName":"posts","created":"2015-11-04T11:46:28.452Z","updated":"2015-11-04T11:46:28.452Z","permissions":[],"text":"asdasd"},{"id":"3wYx8D8HvLYev","internalId":"internal-id-1-88","collectionName":"posts","created":"2015-11-04T11:54:15.104Z","updated":"2015-11-04T11:54:15.104Z","permissions":[],"text":"this is on my mid"},{"id":"3r3dWBiAqvVy","internalId":"internal-id-1-89","collectionName":"posts","created":"2015-11-04T11:54:24.536Z","updated":"2015-11-04T11:54:24.536Z","permissions":[],"text":"denne er også ny"}]},{"id":"Geb9vLGs7yYMqj","internalId":"internal-id-1-90","collectionName":"groups","created":"2015-11-03T12:05:12.809Z","updated":"2015-11-04T11:11:55.232Z","permissions":[],"name":"k3","posts":[{"id":"demmWkt0mn7V","internalId":"internal-id-1-91","collectionName":"posts","created":"2015-11-03T22:27:28.668Z","updated":"2015-11-03T22:27:28.668Z","permissions":[],"text":"denne skal i k3"},{"id":"jX7460Vu6md46","internalId":"internal-id-1-92","collectionName":"posts","created":"2015-11-03T22:27:38.210Z","updated":"2015-11-03T22:27:38.210Z","permissions":[],"text":"denne skal i d2"},{"id":"ABdr9GtaKVPx","internalId":"internal-id-1-93","collectionName":"posts","created":"2015-11-04T11:11:55.137Z","updated":"2015-11-04T11:11:55.137Z","permissions":[],"text":"asd"},{"id":"gj1AdMC4VpYR","internalId":"internal-id-1-94","collectionName":"posts","created":"2015-11-04T11:11:28.729Z","updated":"2015-11-04T11:11:28.729Z","permissions":[],"text":"adasdas"},{"id":"VBKDyXVSRv0Ro3","internalId":"internal-id-1-95","collectionName":"posts","created":"2015-11-03T21:23:44.469Z","updated":"2015-11-03T21:23:44.469Z","permissions":[],"text":"asdad"},{"id":"Ad4j15t9xaOm","internalId":"internal-id-1-96","collectionName":"posts","created":"2015-11-04T11:10:46.795Z","updated":"2015-11-04T11:10:46.795Z","permissions":[],"text":"qwewqewqe"}]},{"id":"VBKxR8rsRvVWyR","internalId":"internal-id-1-97","collectionName":"groups","created":"2015-11-03T12:04:41.418Z","updated":"2015-11-04T12:26:14.645Z","permissions":[],"name":"d2","posts":[{"id":"axqlMliKMMMMG","internalId":"internal-id-1-98","collectionName":"posts","created":"2015-11-04T11:12:08.122Z","updated":"2015-11-04T11:12:08.122Z","permissions":[],"text":"qwewqewqewqeqwe"},{"id":"pRgDr7LFqvYro","internalId":"internal-id-1-99","collectionName":"posts","created":"2015-11-04T11:31:45.663Z","updated":"2015-11-04T11:31:45.663Z","permissions":[],"text":"123123123"},{"id":"wNv951hqO3px4","internalId":"internal-id-1-100","collectionName":"posts","created":"2015-11-04T11:32:19.573Z","updated":"2015-11-04T11:32:19.573Z","permissions":[],"text":"asdasd"},{"id":"VBgxDRzfRNg3xl","internalId":"internal-id-1-101","collectionName":"posts","created":"2015-11-04T11:32:01.093Z","updated":"2015-11-04T11:32:01.093Z","permissions":[],"text":"eric isd2"},{"id":"Wj7zm4Cg6RBPg","internalId":"internal-id-1-102","collectionName":"posts","created":"2015-11-04T12:26:14.534Z","updated":"2015-11-04T12:26:14.534Z","permissions":[],"text":"this is a new post"},{"id":"695yAqHoZBKv","internalId":"internal-id-1-103","collectionName":"posts","created":"2015-11-04T11:12:42.565Z","updated":"2015-11-04T11:12:42.565Z","permissions":[],"text":"qwewqewqe"}]},{"id":"gzma3NkcOablO","internalId":"internal-id-1-104","collectionName":"groups","created":"2015-11-03T12:04:02.910Z","updated":"2015-11-04T12:31:43.144Z","permissions":[],"name":"kanskje","posts":[{"id":"4oLW8yvcawRk41","internalId":"internal-id-1-105","collectionName":"posts","created":"2015-11-04T12:31:29.270Z","updated":"2015-11-04T12:31:29.270Z","permissions":[],"text":"adasd"},{"id":"Ge091a1FeGOZM","internalId":"internal-id-1-106","collectionName":"posts","created":"2015-11-04T12:31:43.027Z","updated":"2015-11-04T12:31:43.027Z","permissions":[],"text":"asdsad"}]},{"id":"Mk6eXzT5gLWx","internalId":"internal-id-1-107","collectionName":"groups","created":"2015-11-03T11:59:37.311Z","updated":"2015-11-03T21:32:27.463Z","permissions":[],"name":"newgroup","posts":[{"id":"x1ZB0nSOgAwaW","internalId":"internal-id-1-108","collectionName":"posts","created":"2015-11-03T21:32:27.335Z","updated":"2015-11-03T21:32:27.335Z","permissions":[],"text":"dadasd"},{"id":"3wkMX5MCwdd7X","internalId":"internal-id-1-109","collectionName":"posts","created":"2015-11-03T21:32:11.075Z","updated":"2015-11-03T21:32:11.075Z","permissions":[],"text":"asda"}]},{"id":"wMWVKXCWO07o","internalId":"internal-id-1-110","collectionName":"groups","created":"2015-11-03T11:50:18.045Z","updated":"2015-11-04T12:30:32.611Z","permissions":[],"name":"g2","posts":[{"id":"PjkwZkcPplxbX","internalId":"internal-id-1-111","collectionName":"posts","created":"2015-11-04T12:30:32.490Z","updated":"2015-11-04T12:30:32.490Z","permissions":[],"text":"her er en"}]},{"id":"1ye03at6DbLw","internalId":"internal-id-1-112","collectionName":"groups","created":"2015-11-03T11:50:07.686Z","updated":"2015-11-03T21:31:44.369Z","permissions":[],"name":"dad","posts":[{"id":"1BKm5BeSkAWy3","internalId":"internal-id-1-113","collectionName":"posts","created":"2015-11-03T21:20:37.269Z","updated":"2015-11-03T21:20:37.269Z","permissions":[],"text":"sadasd"},{"id":"pRlwm0BSA1vwO","internalId":"internal-id-1-114","collectionName":"posts","created":"2015-11-03T21:31:44.245Z","updated":"2015-11-03T21:31:44.245Z","permissions":[],"text":"adasd"}]},{"id":"pbaeagiBZkDk1","internalId":"internal-id-1-115","collectionName":"groups","created":"2015-11-03T11:39:35.725Z","updated":"2015-11-04T11:45:39.655Z","permissions":[],"name":"g1","posts":[{"id":"01qqWqouz90yY","internalId":"internal-id-1-116","collectionName":"posts","created":"2015-11-04T11:45:27.883Z","updated":"2015-11-04T11:45:27.883Z","permissions":[],"text":"asdasdasd"},{"id":"WoqjRZsK4aMR","internalId":"internal-id-1-117","collectionName":"posts","created":"2015-11-04T11:34:06.748Z","updated":"2015-11-04T11:34:06.748Z","permissions":[],"text":"asdsadsad"},{"id":"jXoV03mFzPaO4","internalId":"internal-id-1-118","collectionName":"posts","created":"2015-11-04T11:45:39.546Z","updated":"2015-11-04T11:45:39.546Z","permissions":[],"text":"adasdasd"}]},{"id":"1jW946T1Ybrx","internalId":"internal-id-1-119","collectionName":"groups","created":"2015-11-03T09:20:39.027Z","updated":"2015-11-03T09:20:43.107Z","permissions":[],"name":"Adele"},{"id":"MMnNgKjhmyYyp","internalId":"internal-id-1-120","collectionName":"groups","created":"2015-11-03T09:03:48.001Z","updated":"2015-11-03T13:08:42.280Z","permissions":[],"name":"Family"}];
    var groups = null;
    
    this.findGroup = function(groupId) {
        $log.debug("findGroup: groups: " + groups)
        
        for(var i = 0; i < groups.length; i++) {
            if (groups[i].id == groupId) {
                return groups[i];
            }
        }
    }

    this.getPosts = function(groupId){
        $log.debug("Fetching posts for group: " + groupId);
        return this.findGroup(groupId).posts;
    }

    this.savePost = function(data) {
        var deferred = $q.defer();
        var post = appstax.object("posts");
        post.text = data.text;
        post.image = data.image;
        $log.debug("savePost: file=" + JSON.stringify(post.image))
        var group = data.group;
        if (group.hasOwnProperty('posts')) {
            group.posts.push(post);
        } else {
            group.posts = [];
            group.posts.push(post);
        }

        group.saveAll().then(function(result) {   
            $log.debug("new post save OK: "+ JSON.stringify(post))
            deferred.resolve(post);
        })
        .fail(function(error) {
            $log.error("Error: " + error);
            deferred.reject(error); 
        });

        return deferred.promise;
    }
	this.getGroups = function(){
        var deferred = $q.defer();
        $log.debug("Fetching data for: " + "groups");
        appstax.findAll("groups", {expand:1}).then(function(objects) {   
            $log.debug("getGroups: " + JSON.stringify(objects));
            groups = objects;
            deferred.resolve(objects);
       })
        .fail(function(error) {
           $log.error("Error: " + error);
           deferred.reject(error); 
       });
        return deferred.promise;
	}

    this.saveGroup = function(group) {
        var deferred = $q.defer();
        $log.debug("Saving data for: " + group);
        var g = appstax.object("groups");
        g.name = group.name
        g.save().then(function(result) {   
            console.log(JSON.stringify(result));
            deferred.resolve(result);
        })
        .fail(function(error) {
            $log.error("Error: " + error);
            deferred.reject(error); 
        });
        return deferred.promise;
       
    }

    this.saveAlbum = function(data) {
        var deferred = $q.defer();
        var group = data.group;
        var album = appstax.object("albums");
        album.name = data.name;

        if (group.hasOwnProperty('albums')) {
            group.albums.push(album);
        } else {
            group.albums = [];
            group.albums.push(album);
        }

        group.saveAll().then(function(result) {   
            console.log(JSON.stringify(result));
            deferred.resolve(result);
        })
        .fail(function(error) {
            $log.error("Error: " + error);
            deferred.reject(error); 
        });
        return deferred.promise;
       
    }


    this.invite = function(newInvite) {
        var deferred = $q.defer();
        var invitation = appstax.object("invitations");
        invitation.email = newInvite.email
        invitation.group = newInvite.group
        $log.debug("invitation: " + JSON.stringify(invitation))
        
        invitation.save().then(function(result) {   
            console.log(JSON.stringify(result));

            deferred.resolve(result);
        })
        .fail(function(error) {
            $log.error("Error: " + error);
            deferred.reject(error); 
        });
        return deferred.promise;
    }

	$log.debug("Exiting GroupService");
}]);
'use strict';

var module = angular.module('MyApp');

module.service('PostService', ['$http', '$q', '$log', function($http, $q, $log) {
	$log.debug("Entering PostService");

	this.getPosts = function(groupId){
        var deferred = $q.defer();
        $log.debug("Fetching data for posts: group=" + groupId);
        /*appstax.find("groups", groupId, {expand: 1}).then(function(group) {   
            $log.debug("found posts: " + JSON.stringify(group.posts));
            //return group.posts;
            deferred.resolve(group.posts);
       })
        .fail(function(error) {
           $log.error("Error: " + error);
           return null;
           deferred.reject(error); 
       });*/
        return deferred.promise;
	}

    this.save = function(data) {
        var deferred = $q.defer();
        var post = appstax.object("posts");
        post.text = data.text;
        var group = data.group;
        if (group.hasOwnProperty('posts')) {
            group.posts.push(post);
        } else {
            group.posts = [post];
        }

        group.saveAll().then(function(result) {   
            deferred.resolve(post);
        })
        .fail(function(error) {
            $log.error("Error: " + error);
            deferred.reject(error); 
        });

        return deferred.promise;
    }

	$log.debug("Exiting PostService");
}]);
'use strict';

angular.module('MyApp').controller('UserCtrl', function ($log, $scope, $state, conf, $timeout) {
   $log.debug('Entering UserCtrl');
   
   $scope.email = "";
   $scope.password = "";
   $scope.message = "";
   $scope.conf = conf;
   $scope.error = false;
   
   $scope.login = function(){
   	 $log.debug("Login is called");
   	 $log.debug("Username is: " + $scope.email);
   	 $log.debug("Password is is: " + $scope.password);
   	 appstax.login($scope.email, $scope.password)
       .then(function(user) {
        $scope.error = false;
           $log.debug("User logged in successfully...");
           $state.go('app');

       })
       .fail(function(error) {
          $scope.$apply(function(){
            $scope.error = true;
            $scope.message = "Could not log in. Please verify your username and password.";  
          });

          //Cancel the error after 3 seconds
           $timeout(function(){
            $scope.error = false;
            $scope.message = "";  
          },3000);
          
           
       });
   }

   $scope.signup = function(){
     $log.debug("Signup is called");
     $log.debug("Username is: " + $scope.email);
     $log.debug("Password is is: " + $scope.password);
     appstax.signup($scope.email, $scope.password)
       .then(function(user) {          
           $log.debug("User logged in successfully...");
           $state.go('app');

       })
       .fail(function(error) {
        
          $scope.$apply(function(){
            $scope.error = true;
            $scope.message = "Could not sign up.";  
          });

          //Cancel the error after 3 seconds
          $timeout(function(){
            $scope.error = false;
            $scope.message = "";  
          },3000);
                   
       });
   }

   $scope.cancel = function() {
      $state.go("public.landingsite");
   }

   $log.debug('Exiting UserCtrl');
});
