'use strict';

// Declare app level module which depends on views, and components
angular.module('ChatApp', [
  'ngRoute',
  'ngSanitize',
  'pusher-angular',
  'ngFileUpload',
  'ChatApp.login',
  'ChatApp.chat'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/login'});
}]);
