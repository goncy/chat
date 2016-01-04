(function() {
  'use strict';

  //Module
  angular.module('ChatApp.chat', ['ngRoute'])

    .config(chatConfig)

    .directive('chatNav', chatNav)
    .directive('chatModals', chatModals)

    .controller('chatController', chatController);

  chatConfig.$inject = ['$routeProvider'];
  chatController.$inject = ['$scope', '$timeout', '$pusher', 'Upload', '$routeParams'];

  //Config
  function chatConfig($routeProvider) {
    $routeProvider.when('/chat', {
      templateUrl: 'pages/chat/chat.html',
      controller: 'chatController',
      controllerAs: 'chatCtrl'
    });
  }

  //Directives
  function chatNav() {
    return {
      templateUrl: 'pages/chat/partials/nav.html'
    };
  }

  function chatModals() {
    return {
      templateUrl: 'pages/chat/partials/modals.html'
    };
  }

  function chatController($scope, $timeout, $pusher, Upload, $routeParams) {
    var chatCtrl = this;

    chatCtrl.sendMessage = sendMessage;
    chatCtrl.uploadFiles = uploadFiles;
    chatCtrl.previewImage = previewImage;

    //Pusher cfg
    chatCtrl.pusher = [];
    chatCtrl.channel = [];

    //Scope
    chatCtrl.user = {
      name: "Anonimo",
      uid: ""
    }

    chatCtrl.config = {
      conexNotif: true,
      svNotif: true
    }

    chatCtrl.users = [];

    //Chat content
    chatCtrl.messages = [];

    iniciar();

    function iniciar() {
      //Init
      chatCtrl.pusher = $pusher(new Pusher('1af1d4c26abef175083a', {
        encrypted: true,
        authEndpoint: 'server/auth.php',
        auth: {
          headers: {
            'X-CSRF-Token': "srpao"
          },
          params: {
            'sala': $routeParams.sala,
            'password': $routeParams.password
          }
        }
      }));

      //Channel
      chatCtrl.channel = chatCtrl.pusher.subscribe('presence-srpao');

      //Bind events
      bindEvents();
    }

    function bindEvents() {
      chatCtrl.pusher.connection.bind('connected', function() {

        chatCtrl.user.uid = chatCtrl.pusher.connection.socket_id;
        chatCtrl.user.name = "Anonimo";

        //Sub completed
        chatCtrl.channel.bind('pusher:subscription_succeeded', function(members) {
          chatCtrl.messages.push({
            "name": "server",
            "msg": "Bienvenido a <strong>SRPAO Chat</strong> hay " + strong(members.count) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Sub completed
        chatCtrl.channel.bind('pusher:subscription_error', function(members) {
          $('#alertError')
            .text("Hubo un error al unirse a la sala, posiblemente la contraseña sea incorrecta");
          $('#alertModal')
            .modal('show');

          chatCtrl.messages.push({
            "name": "error",
            "msg": "Hubo un error al unirse a la sala, por favor, intenta nuevamente mas tarde",
            "src": "server"
          });
          goBottom();
        });

        //Se unio alguien
        chatCtrl.channel.bind('pusher:member_added', function(member) {
          chatCtrl.users.push(member);
          if (chatCtrl.config.conexNotif) chatCtrl.messages.push({
            "name": "server",
            "msg": "Otra persona se unio al chat, hay " + strong(chatCtrl.users.length + 1) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Se fue alguien
        chatCtrl.channel.bind('pusher:member_removed', function(member) {
          chatCtrl.users.splice(chatCtrl.users.indexOf(member), 1);
          if (chatCtrl.config.conexNotif) chatCtrl.messages.push({
            "name": "server",
            "msg": "Una persona se fue del chat, hay " + strong(chatCtrl.users.length + 1) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Mensaje nuevo de servidor
        chatCtrl.channel.bind('new_sv_msg', function(data) {
          if (chatCtrl.config.svNotif) addMessage(data)
        });

        //Mensaje nuevo de cliente
        chatCtrl.channel.bind('client-new_msg', function(data) {
          addMessage(data)
        });

      });
    }

    //Messages functions
    function sendMessage() {
      var data = {
        uid: chatCtrl.user.uid,
        msg: $scope.msg,
        name: chatCtrl.user.name,
      }

      chatCtrl.channel.trigger('client-new_msg', data);
      chatCtrl.messages.push({
        src: "self",
        name: "Yo",
        msg: $scope.msg
      });
      $scope.msg = "";

      goBottom();
    }

    function addMessage(data) {
      console.log(data);
      chatCtrl.messages.push({
        src: data.src || "other",
        name: data.name,
        msg: data.msg
      });
      goBottom();
    }

    //Image
    function uploadFiles(file, errFiles) {
      $scope.f = file;
      $scope.errFile = errFiles && errFiles[0];
      if ($scope.errFile) {
        $('#alertError')
          .text("Hubo un error al enviar el archivo, asegurate de que sea una foto o video y que pese menos de 10MB");
        $('#alertModal')
          .modal('show');
        return;
      }
      if (file) {
        file.upload = Upload.upload({
          url: 'server/uploadFile.php',
          file: file,
          sendFieldsAs: 'form'
        });
        file.upload.then(function(response) {
          $timeout(function() {
            file.result = response.data;

            var data = {
              uid: chatCtrl.user.uid,
              src: "image",
              msg: response.data.path,
              name: chatCtrl.user.name,
            }

            chatCtrl.channel.trigger('client-new_msg', data);
            chatCtrl.messages.push({
              src: "image",
              name: "Yo",
              msg: response.data.path
            });

            goBottom();
          });
        }, function(response) {
          if (response.status > 0)
            $scope.errorMsg = response.status + ': ' + response.data;
        }, function(evt) {
          file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
      }
    }

    function previewImage(img, username) {
      $.fancybox.open([{
        href: img,
        title: username
      }], {
        padding: 5,
        closeBtn: true
      });
    }

    //Helpers
    function strong(txt) {
      return "<strong>" + txt + "</strong>";
    }

    function goBottom() {
      setTimeout(function() {
        $("#chat")
          .scrollTop($("#chat")[0].scrollHeight);
      }, 10);
    }
  }
})();
