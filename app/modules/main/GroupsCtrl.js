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
