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
