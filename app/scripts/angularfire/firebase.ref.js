(function () {
  'use strict';

  angular.module('firebase.ref', ['firebase', 'firebase.config'])
    .factory('Ref', RefFactory);

  RefFactory.$inject = ['$window', 'FBURL'];

  function RefFactory($window, FBURL) {
    return new $window.Firebase(FBURL);
  }
}());
