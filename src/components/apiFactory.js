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
    };

    api.login = login;
    api.kick = kick;
    api.checkSala = checkSala;
    api.setPassword = setPassword;
    api.getPassword = getPassword;
    api.setPartner = setPartner;
    api.getPartner = getPartner;
    api.reset = reset;

    function checkSala(sala) {
      return $http.post('server/login.php', {
          sala: sala.toLowerCase(),
          action: "checkSala"
        });
    }

    function login(sala, password) {
      return $http.post('server/login.php', {
          sala: sala.toLowerCase(),
          password: password || "",
          action: "login"
        });
    }

    function kick(uid, channel){
      return $http.post('server/eventHandler.php', {
          action: "kick",
          channel: channel,
          uid: uid
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
