(function() {
  'use strict';

  var modules = [
    'ngRoute','ngSanitize','pusher-angular','ngFileUpload',
    'ChatApp.login',
    'ChatApp.chat',
      'ChatApp.chat.directives',
    'ChatApp.api'
  ];

  angular.module('ChatApp', modules)
    .config(ChatAppConfig);

  ChatAppConfig.$inject = ['$routeProvider'];

  function ChatAppConfig($routeProvider) {
    //Chat
    $routeProvider.when('/:sala/chat', {
      templateUrl: 'pages/chat/chat.html',
      controller: 'chatController',
      controllerAs: 'chatCtrl'
    })
    //Login
    .when('/:sala', {
      templateUrl: 'pages/login/login.html',
      controller: 'loginController',
      controllerAs: 'loginCtrl'
    })
    //Redirect
    .otherwise({
      redirectTo: '/principal'
    });
  }
})();
