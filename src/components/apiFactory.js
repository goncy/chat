(function() {
  'use strict';

  angular.module('ChatApp.api', [])
    .factory('apiFactory', apiFactory);

  apiFactory.$inject = ['$http'];

  function apiFactory($http) {
    var api = this;

    api.data = {
      logged: false,
      partner: false,
      password: ""
    }

    api.hasPassword = hasPassword;
    api.login = login;
    api.setPassword = setPassword;
    api.getPassword = getPassword;
    api.setPartner = setPartner;
    api.getPartner = getPartner;
    api.reset = reset;

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
      api.data.password = status;
    }

    function getPassword(){
      return api.data.password;
    }

    function setPartner(status){
      api.data.partner = status;
    }

    function getPartner(){
      return api.data.partner;
    }

    function reset(){
      api.data = {
        logged: false,
        partner: false,
        password: ""
      }
    }

    return api;
  }
})();
