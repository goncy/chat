  //Module
  angular.module('ChatApp.chat.directives', [])

    .directive('chatNav', chatNav)
    .directive('configModal', configModal);

//Directives
  function chatNav() {
    return {
      templateUrl: 'pages/chat/partials/nav.html'
    };
  }

  function configModal() {
    return {
      templateUrl: 'pages/chat/partials/configModal.html',
      scope: {
        config: '=',
        username: '='
      }
    };
  }