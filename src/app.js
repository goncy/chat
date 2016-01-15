(function () {
  'use strict';

  var modules = [
    'ngRoute', 'ngSanitize', 'pusher-angular', 'ngFileUpload', 'angular-toasty', 'colorpicker.module',
    'ChatApp.login',
    'ChatApp.chat',
      'ChatApp.chat.directives',
    'ChatApp.api'
  ];

  angular.module('ChatApp', modules)
    .config(ChatAppConfig);

  ChatAppConfig.$inject = ['$routeProvider', 'toastyConfigProvider'];

  function ChatAppConfig($routeProvider, toastyConfigProvider) {
    routes($routeProvider);
    toasty(toastyConfigProvider);
  }

  function toasty(toastyConfigProvider) {
    toastyConfigProvider.setConfig({
      sound: true,
      shake: false,
      position: 'top-right',
      limit: 1,
      timeout: 7000,
      showClose: true,
      clickToClose: true
    });
  }

  function routes($routeProvider) {
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
