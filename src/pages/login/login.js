(function () {
  'use strict';

  window.angular.module('ChatApp.login', [])
    .controller('loginController', loginController);

  loginController.$inject = ["$scope", "$location", "$routeParams", "apiFactory"];

  function loginController($scope, $location, $routeParams, apiFactory) {
    var loginCtrl = this;

    loginCtrl.roomWithPass = false;

    loginCtrl.login = login;

    iniciar();

    function iniciar() {
      hasPassword();
    }

    function hasPassword() {
      apiFactory.hasPassword($routeParams.sala.toLowerCase())
        .then(function (res) {
          if (res.data.status === "false") {
            $location.path('/' + $routeParams.sala.toLowerCase() + '/chat');
          }else{
            loginCtrl.roomWithPass = true;
          }
        });
    }

    function login() {
      apiFactory.login($routeParams.sala.toLowerCase(), $scope.password)
        .then(function (res) {
          if (res.data.status === "true") {
            apiFactory.setPassword($scope.password);
            apiFactory.setPartner(res.data.partner);
            $location.path('/' + $routeParams.sala.toLowerCase() + '/chat');
          } else {
            alert("Error, la password no es correcta o hubo un error con el servidor");
          }
        }, function (err) {
          alert("Error, la password no es correcta o hubo un error con el servidor");
        });
    }
  }
})();
