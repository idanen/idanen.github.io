(function () {
  'use strict';

  angular.module('firebase.auth', ['firebase', 'firebase.ref'])
    .factory('Auth', AuthFactory);

  AuthFactory.$inject = ['$firebaseAuth'];
  function AuthFactory($firebaseAuth) {
    return $firebaseAuth();
  }
}());
