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
