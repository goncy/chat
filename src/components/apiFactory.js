(function() {
  'use strict';

  angular.module('ChatApp.api', [])
    .factory('apiFactory', apiFactory);

  apiFactory.$inject = ['$http'];

  function apiFactory($http) {
    var api = this;

    api.logged = false;
    api.partner = false;
    api.password = "";

    api.hasPassword = hasPassword;
    api.login = login;
    api.setPassword = setPassword;
    api.getPassword = getPassword;
    api.setPartner = setPartner;
    api.getPartner = getPartner;

    function hasPassword(sala) {
      return $http.post('server/login.php', {
          sala: sala.toLowerCase(),
          action: "hasPassword"
        });
    }

    function login(sala, password) {
      return $http.post('server/login.php', {
          sala: sala.toLowerCase(),
          password: password || "",
          action: "login"
        });
    }

    function setPassword(status){
      api.password = status;
    }

    function getPassword(){
      return api.password;
    }

    function setPartner(status){
      api.partner = status;
    }

    function getPartner(){
      return api.partner;
    }

    return api;
  }
})();
