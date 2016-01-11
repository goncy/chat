(function () {
  'use strict';

  //Module
  angular.module('ChatApp.chat', [])

  .controller('chatController', chatController);

  chatController.$inject = ['$scope', '$timeout', '$pusher', 'Upload', '$routeParams', 'apiFactory'];

  function chatController($scope, $timeout, $pusher, Upload, $routeParams, apiFactory) {
    var chatCtrl = this;

    //Functions
    chatCtrl.sendMessage = sendMessage;
    chatCtrl.uploadFiles = uploadFiles;
    chatCtrl.previewImage = previewImage;

    //Pusher cfg
    chatCtrl.pusher = [];
    chatCtrl.channel = [];

    //Scope
    chatCtrl.user = {
      name: "Anonimo",
      uid: "",
      me: {},
      admin: false
    };

    //Partner
    chatCtrl.partner = false;

    //Notificaciones
    chatCtrl.config = {
      conexNotif: true,
      svNotif: true
    };

    //Users array
    chatCtrl.users = [];

    //Chat content
    chatCtrl.messages = [];

    iniciar();

    function iniciar() {
      //Chat name
      chatCtrl.name = $routeParams.sala.toUpperCase();
      chatCtrl.slug = $routeParams.sala.toLowerCase();
      chatCtrl.user.admin = localStorage.getItem("admin") === chatCtrl.slug ? true : false;

      //Init
      chatCtrl.pusher = $pusher(new Pusher('1af1d4c26abef175083a', {
        encrypted: true,
        authEndpoint: 'server/auth.php',
        auth: {
          headers: {
            'X-CSRF-Token': "{'dev':'Gonzalo Pozzo'}"
          },
          params: {
            'sala': $routeParams.sala,
            'password': apiFactory.getPassword(),
            'admin': chatCtrl.user.admin
          }
        }
      }));

      //Channel
      chatCtrl.channel = chatCtrl.pusher.subscribe('presence-' + chatCtrl.slug);

      //Partner
      chatCtrl.partner = apiFactory.getPartner() === "true" ? true : false;

      $scope.$on('$destroy', function () {
        apiFactory.reset();
        chatCtrl.pusher.disconnect();
      });

      //Bind events
      bindEvents();
    }

    function bindEvents() {
      chatCtrl.pusher.connection.bind('connected', function () {

        chatCtrl.user.uid = chatCtrl.pusher.connection.socket_id;
        chatCtrl.user.name = "Anonimo";

        //Sub completed
        chatCtrl.channel.bind('pusher:subscription_succeeded', function (members) {
          chatCtrl.user.me = members.me;
          chatCtrl.messages.push({
            "name": "server",
            "msg": "Bienvenido al chat de " + strong(chatCtrl.slug) + ", hay " + strong(members.count) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Sub completed
        chatCtrl.channel.bind('pusher:subscription_error', function (members) {
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
        chatCtrl.channel.bind('pusher:member_added', function (member) {
          chatCtrl.users.push(member);
          if (chatCtrl.config.conexNotif) chatCtrl.messages.push({
            "name": "server",
            "msg": "Otra persona se unio al chat, hay " + strong(chatCtrl.users.length + 1) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Se fue alguien
        chatCtrl.channel.bind('pusher:member_removed', function (member) {
          chatCtrl.users.splice(chatCtrl.users.indexOf(member), 1);
          if (chatCtrl.config.conexNotif) chatCtrl.messages.push({
            "name": "server",
            "msg": "Una persona se fue del chat, hay " + strong(chatCtrl.users.length + 1) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Mensaje nuevo de servidor
        chatCtrl.channel.bind('server-new_msg', function (data) {
          if (chatCtrl.config.svNotif) addMessage(data)
        });

        //Mensaje nuevo de cliente
        chatCtrl.channel.bind('client-new_msg', function (data) {
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
        admin: chatCtrl.user.admin
      }

      chatCtrl.channel.trigger('client-new_msg', data);

      chatCtrl.messages.push({
        src: chatCtrl.user.admin ? "admin" : "self",
        name: "Yo",
        msg: $scope.msg
      });
      $scope.msg = "";

      goBottom();
    }

    function addMessage(data) {
      data.src = data.src || "other";
      chatCtrl.messages.push({
        src: data.admin ? "admin" : data.src,
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
        $('#photo_unavailable').show();
        $('#photo_available').hide();
        file.upload = Upload.upload({
          url: 'server/uploadFile.php',
          file: file,
          sendFieldsAs: 'form'
        });
        file.upload.then(function (response) {
          $timeout(function () {
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

            $('#photo_unavailable').hide();
            $('#photo_available').show();

            goBottom();
          });
        }, function (response) {
          if (response.status > 0)
            $scope.errorMsg = response.status + ': ' + response.data;
          $('#photo_unavailable').hide();
          $('#photo_available').show();
        }, function (evt) {
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
      setTimeout(function () {
        $("#chat")
          .scrollTop($("#chat")[0].scrollHeight);
      }, 10);
    }
  }
})();
