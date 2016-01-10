  //Module
  angular.module('ChatApp.chat.directives', [])

    .directive('chatNav', chatNav)
    .directive('chatModals', chatModals)

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