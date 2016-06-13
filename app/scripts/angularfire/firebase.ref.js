(function () {
  'use strict';

  angular.module('firebase.ref', ['firebase', 'firebase.config'])
    .factory('Ref', RefFactory);

  RefFactory.$inject = ['$window'];
  function RefFactory($window) {
    return $window.firebase.database().ref();
  }
}());
