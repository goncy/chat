(function () {
  'use strict';

  //Module
  angular.module('ChatApp.chat', [])

  .controller('chatController', chatController);

  chatController.$inject = ['$scope', '$timeout', '$pusher', 'Upload', '$routeParams', 'apiFactory', 'toasty'];

  function chatController($scope, $timeout, $pusher, Upload, $routeParams, apiFactory, toasty) {
    var chatCtrl = this;

    //Functions
    chatCtrl.sendMessage = sendMessage;
    chatCtrl.uploadFiles = uploadFiles;
    chatCtrl.previewImage = previewImage;

    //Pusher cfg
    chatCtrl.server = {
      pusher: [],
      channel: []
    };

    //Scope
    chatCtrl.user = {
      name: "Anonimo",
      color: getRandomColor(),
      uid: "",
      data: {},
      admin: false,
      uploading: false
    };

    chatCtrl.prv = {
      name: "",
      id: ""
    };

    //Partner
    chatCtrl.partner = false;

    //Notificaciones
    chatCtrl.config = {
      conexNotif: true,
      svNotif: true,
      sound: true
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
      chatCtrl.server.pusher = $pusher(new Pusher('1af1d4c26abef175083a', {
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
      chatCtrl.server.channel = chatCtrl.server.pusher.subscribe('presence-' + chatCtrl.slug);

      //Partner
      chatCtrl.partner = apiFactory.getPartner() === "true" ? true : false;

      $scope.$on('$destroy', function () {
        apiFactory.reset();
        chatCtrl.server.pusher.disconnect();
      });

      //Bind events
      bindEvents();
    }

    function bindEvents() {
      chatCtrl.server.pusher.connection.bind('connected', function () {

        chatCtrl.user.uid = chatCtrl.server.pusher.connection.socket_id;
        chatCtrl.user.name = "Anonimo";

        //Sub completed
        chatCtrl.server.channel.bind('pusher:subscription_succeeded', function (members) {
          chatCtrl.user.data = members.me;
          chatCtrl.messages.push({
            "name": "server",
            "msg": "Bienvenido al chat de " + strong(chatCtrl.slug) + ", hay " + strong(members.count) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Sub completed
        chatCtrl.server.channel.bind('pusher:subscription_error', function (members) {
          toasty.error("Hubo un error al unirse a la sala, posiblemente la contraseña sea incorrecta");

          chatCtrl.messages.push({
            "name": "error",
            "msg": "Hubo un error al unirse a la sala, por favor, intenta nuevamente mas tarde",
            "src": "server"
          });
          goBottom();
        });

        //Se unio alguien
        chatCtrl.server.channel.bind('pusher:member_added', function (member) {
          chatCtrl.users.push(member);
          if (chatCtrl.config.conexNotif) chatCtrl.messages.push({
            "name": "server",
            "msg": "Otra persona se unio al chat, hay " + strong(chatCtrl.users.length + 1) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Se fue alguien
        chatCtrl.server.channel.bind('pusher:member_removed', function (member) {
          chatCtrl.users.splice(chatCtrl.users.indexOf(member), 1);
          if (chatCtrl.config.conexNotif) chatCtrl.messages.push({
            "name": "server",
            "msg": "Una persona se fue del chat, hay " + strong(chatCtrl.users.length + 1) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Mensaje nuevo de servidor
        chatCtrl.server.channel.bind('server-new_msg', function (data) {
          if (chatCtrl.config.svNotif) addMessage(data);
        });

        //Mensaje nuevo de cliente
        chatCtrl.server.channel.bind('client-new_msg', function (data) {
          addMessage(data);
        });

      });
    }

    //Messages functions
    function sendMessage() {
      if ($scope.msg) {
        var data = {
          uid: chatCtrl.user.uid,
          msg: $scope.msg,
          name: chatCtrl.user.name,
          color: chatCtrl.user.color,
          admin: chatCtrl.user.admin
        };

        chatCtrl.server.channel.trigger('client-new_msg', data);

        chatCtrl.messages.push({
          src: chatCtrl.user.admin ? "admin" : "self",
          name: "Yo",
          msg: $scope.msg,
          color: chatCtrl.user.color
        });

        $scope.msg = "";

        goBottom(true);
      }
    }

    function addMessage(data) {
      data.src = data.src || "other";
      chatCtrl.messages.push({
        src: data.admin ? "admin" : data.src,
        name: data.name,
        msg: data.msg,
        color: data.color
      });
      goBottom(true);
    }

    //Image
    function uploadFiles(file, errFiles) {
      $scope.f = file;
      $scope.errFile = errFiles && errFiles[0];
      if ($scope.errFile) {
        toasty.error("Hubo un error al enviar el archivo, asegurate de que sea una foto o video y que pese menos de 30MB");
        return;
      }
      if (file) {
        chatCtrl.user.uploading = true;
        toasty.wait({msg:"Subiendo archivo", sound:false});
        file.upload = Upload.upload({
          url: 'server/uploadFile.php',
          file: file,
          sendFieldsAs: 'form'
        });
        file.upload.then(function (response) {
          $timeout(function () {
            file.result = response.data;

            var fileType = getFileExt(response.data.tipo);

            var data = {
              uid: chatCtrl.user.uid,
              src: fileType,
              msg: response.data.path,
              name: chatCtrl.user.name,
              color: chatCtrl.user.color
            };

            chatCtrl.server.channel.trigger('client-new_msg', data);
            chatCtrl.messages.push({
              src: fileType,
              name: "Yo",
              msg: response.data.path
            });

            chatCtrl.user.uploading = false;
            goBottom(true);
          });
        }, function (response) {
          if (response.status > 0){
            toasty.error(response.status + ': ' + response.data);
          }
          chatCtrl.user.uploading = false;
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

    function goBottom(sound) {
      setTimeout(function () {
        $("#chat")
          .scrollTop($("#chat")[0].scrollHeight);
      }, 10);

      if (sound && chatCtrl.config.sound) toasty('Notificacion');
    }

    function getFileExt(mime) {
      if (mime.match(/video\/.*/g)) return "video";
      if (mime.match(/image\/.*/g)) return "image";
      else return "unknown";
    }

    function getRandomColor() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
  }
})();
