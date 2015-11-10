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