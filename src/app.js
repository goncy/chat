(function() {
  'use strict';

  var modules = [
    'ngRoute','ngSanitize','pusher-angular','ngFileUpload',
    'ChatApp.login','ChatApp.chat'
  ];

  angular.module('ChatApp', modules)
    .config(ChatAppConfig);

  ChatAppConfig.$inject = ['$routeProvider'];

  function ChatAppConfig($routeProvider) {
    $routeProvider.otherwise({
      redirectTo: '/login/principal'
    });
  }
})();
