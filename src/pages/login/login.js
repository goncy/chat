(function() {
  'use strict';

  angular.module('ChatApp.login', ['ngRoute'])
    .config(loginConfig)
    .controller('loginController', loginController);

  loginConfig.$inject = ["$routeProvider"];
  loginController.$inject = ["$http", "$scope", "$location"];

  function loginConfig($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'pages/login/login.html',
      controller: 'loginController',
      controllerAs: 'loginCtrl'
    });
  }

  function loginController($http, $scope, $location) {
    var loginCtrl = this;

    loginCtrl.checkedPass = false;

    loginCtrl.login = login;

    iniciar();

    function iniciar() {
      login();
    }

    function login() {
      $http.post('server/login.php', {
          sala: "srpao",
          password: $scope.password
        })
        .then(function(res) {
          if(res.data === "true") {
            $location.path('/chat')
              .search({
                sala: 'srpao',
                password: $scope.password
              });
          } else {
            if(loginCtrl.checkedPass) alert("Error, la password no es correcta o hubo un error con el servidor");
            loginCtrl.checkedPass = true;
          }
        }, function(err) {
          if(loginCtrl.checkedPass) alert("Error, la password no es correcta o hubo un error con el servidor");
          loginCtrl.checkedPass = true;
        });
    }
  }
})();
