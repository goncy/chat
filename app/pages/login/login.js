'use strict';

angular.module('ChatApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'pages/login/login.html',
    controller: 'loginController',
    controllerAs: 'loginCtrl'
  });
}])

.controller('loginController', ['$http','$scope','$location', function($http,$scope,$location) {
  var loginCtrl = this;

  loginCtrl.login = login;

  function login(){
    $http.post('server/login.php', {sala: "srpao", password: $scope.password})
    .then(function(res){
      console.log(res);
      if (res.data === "true") {
        $location.path('/chat').search({sala: 'srpao', password: $scope.password});
      }else{
        alert("Error, la password no es correcta o hubo un error con el servidor");
      }
    }, function(err){
      alert("Error, la password no es correcta o hubo un error con el servidor");
    });
  }
}]);
