(function () {
  'use strict';

  angular.module('pokerManager')
    .directive('loginState', loginStateDirective);

  function loginStateDirective() {
    return {
      restrict: 'EA',
      controller: 'LoginCtrl',
      controllerAs: 'authCtrl',
      templateUrl: 'partials/tmpls/login-state-tmpl.html',
      bindToController: {
        onLogout: '&'
      }
    };
  }
}());
