(function() {
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
    chatCtrl.setPrvt = setPrvt;
    chatCtrl.unSetPrvt = unSetPrvt;
    chatCtrl.kickUser = kickUser;

    //Pusher cfg
    chatCtrl.server = {
      pusher: []
    };

    //Chanels
    chatCtrl.channels = {
      room: [],
      self: [],
      prvt: []
    };

    //User
    chatCtrl.user = {
      name: "" || "Anonimo",
      color: getRandomColor(),
      uid: generateUid(10),
      data: {},
      admin: false,
      uploading: false
    };

    //Notificaciones
    chatCtrl.config = {
      conexNotif: true,
      svNotif: true,
      sound: true
    };

    //Prvt info
    chatCtrl.prvt = {
      name: "",
      uid: ""
    };

    //Partner
    chatCtrl.partner = false;

    //Users array
    chatCtrl.users = [];

    //Chat content
    chatCtrl.messages = [];

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
      chatCtrl.channels.room = chatCtrl.server.pusher.subscribe('presence-' + chatCtrl.slug);
      chatCtrl.channels.self = chatCtrl.server.pusher.subscribe('private-' + chatCtrl.user.uid);

      //Partner
      chatCtrl.partner = apiFactory.getPartner() === "true" ? true : false;

      $scope.$on('$destroy', function() {
        apiFactory.reset();
        chatCtrl.server.pusher.disconnect();
      });

      //Bind events
      bindEvents();
    }

    function bindEvents() {
      chatCtrl.server.pusher.connection.bind('connected', function() {

        chatCtrl.user.name = "Anonimo";

        //Sub completed
        chatCtrl.channels.room.bind('pusher:subscription_succeeded', function(members) {
          chatCtrl.user.data = members.me;
          chatCtrl.messages.push({
            "name": "server",
            "msg": "Bienvenido al chat de " + strong(chatCtrl.slug) + ", hay " + strong(members.count) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Sub completed
        chatCtrl.channels.room.bind('pusher:subscription_error', function(members) {
          toasty.error("Hubo un error al unirse a la sala, posiblemente la contraseña sea incorrecta");

          chatCtrl.messages.push({
            "name": "error",
            "msg": "Hubo un error al unirse a la sala, por favor, intenta nuevamente mas tarde",
            "src": "server"
          });
          goBottom();
        });

        //Se unio alguien
        chatCtrl.channels.room.bind('pusher:member_added', function(member) {
          chatCtrl.users.push(member);
          if (chatCtrl.config.conexNotif) chatCtrl.messages.push({
            "name": "server",
            "msg": "Otra persona se unio al chat, hay " + strong(chatCtrl.users.length + 1) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Se fue alguien
        chatCtrl.channels.room.bind('pusher:member_removed', function(member) {
          chatCtrl.users.splice(chatCtrl.users.indexOf(member), 1);
          if (chatCtrl.config.conexNotif) chatCtrl.messages.push({
            "name": "server",
            "msg": "Una persona se fue del chat, hay " + strong(chatCtrl.users.length + 1) + " personas en la sala",
            "src": "server"
          });
          goBottom();
        });

        //Kick user
        chatCtrl.channels.room.bind('kick', function(data) {
          if (data.uid === chatCtrl.user.uid) {
            apiFactory.reset();
            chatCtrl.server.pusher.disconnect();
            toasty.error("Fuiste expulsado de la sala");

            chatCtrl.messages.push({
              "name": "server",
              "msg": "Fuiste expulsado de la sala",
              "src": "server"
            });
          }
        });

        //Mensaje nuevo de cliente
        chatCtrl.channels.room.bind('client-other-msg', function(data) {
          addMessage(data);
        });

        //Mensaje nuevo privado
        chatCtrl.channels.self.bind('client-prvt-msg', function(data) {
          addPrvtMessage(data);
        });

      });
    }

    iniciar();

    //Messages functions
    function sendMessage() {
      if ($scope.msg) {
        var data = buildMsg({
          admin: chatCtrl.user.admin,
          color: chatCtrl.user.color,
          msg: $scope.msg,
          name: chatCtrl.user.name,
          uid: chatCtrl.user.uid,
          to: {
            uid: chatCtrl.prvt.uid || "",
            name: chatCtrl.prvt.name || ""
          }
        });

        if (chatCtrl.prvt.uid) {
          data.src = "prvt";
          chatCtrl.channels.prvt.trigger('client-prvt-msg', data);
        } else {
          chatCtrl.channels.room.trigger('client-other-msg', data);
        }

        data.src = data.src === "prvt" ? "prvt" : "self";
        chatCtrl.messages.push(data);

        $scope.msg = "";

        goBottom(true);
      }
    }

    function addMessage(data) {
      data.src = data.src || "other";
      chatCtrl.messages.push({
        color: data.color,
        media: data.media || "",
        msg: data.msg,
        name: data.name,
        src: data.admin ? "admin" : data.src,
        uid: data.uid
      });
      goBottom(true);
    }

    function addPrvtMessage(data) {
      chatCtrl.messages.push({
        color: data.color,
        media: data.media || "",
        msg: data.msg,
        name: data.name,
        src: "prvt",
        to: {
          uid: data.to.uid,
          name: data.to.name
        },
        uid: data.uid
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

        toasty.wait({
          msg: "Subiendo archivo",
          sound: false
        });

        file.upload = Upload.upload({
          url: 'server/uploadFile.php',
          file: file,
          sendFieldsAs: 'form'
        });

        file.upload.then(uploadSuccess, uploadError, uploadProgress);
      }

      function uploadSuccess(response) {
        $timeout(function() {
          file.result = response.data;

          var fileType = getFileExt(response.data.tipo);

          var data = buildMsg({
            color: chatCtrl.user.color,
            msg: response.data.path,
            name: chatCtrl.user.name,
            media: fileType,
            to: {
              uid: chatCtrl.prvt.uid || "",
              name: chatCtrl.prvt.name || ""
            },
            uid: chatCtrl.user.uid
          });

          if (chatCtrl.prvt.uid) {
            data.src = "prvt";
            chatCtrl.channels.prvt.trigger('client-prvt-msg', data);
          } else {
            data.src = "media";
            chatCtrl.channels.room.trigger('client-other-msg', data);
          }

          data.name = "Yo (" + chatCtrl.user.name + ")";
          chatCtrl.messages.push(data);

          chatCtrl.user.uploading = false;
          goBottom(true);
        });
      }

      function uploadError(response) {
        if (response.status > 0) {
          toasty.error(response.status + ': ' + response.data);
        }
        chatCtrl.user.uploading = false;
      }

      function uploadProgress(evt) {
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
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

    function kickUser() {
      if (chatCtrl.user.admin) {
        apiFactory.kick(chatCtrl.prvt.uid, chatCtrl.slug);

        chatCtrl.prvt.name = "";
        chatCtrl.prvt.uid = "";
      }
    }

    function setPrvt(name, uid) {
      if (uid !== chatCtrl.user.uid) {
        chatCtrl.prvt.name = name;
        chatCtrl.prvt.uid = uid;

        chatCtrl.channels.prvt = chatCtrl.server.pusher.subscribe('private-' + uid);
      }
    }

    function unSetPrvt() {
      chatCtrl.channels.prvt = [];
      chatCtrl.server.pusher.unsubscribe('private-' + chatCtrl.prvt.uid);

      chatCtrl.prvt.name = "";
      chatCtrl.prvt.uid = "";
    }

    //Helpers
    function strong(txt) {
      return "<strong>" + txt + "</strong>";
    }

    function goBottom(sound) {
      setTimeout(function() {
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
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function generateUid(lgt) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < lgt; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }

    function buildMsg(msg) {
      return $.extend({
        admin: false,
        color: "#000",
        msg: "?",
        name: "Anonimo",
        media: "",
        src: "",
        to: {
          uid: "",
          name: "Anonimo"
        },
        uid: ""
      }, msg);
    }
  }
})();
