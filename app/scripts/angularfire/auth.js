(function () {
  'use strict';

  angular.module('firebase.auth', [])
    .factory('Auth', AuthFactory);

  AuthFactory.$inject = ['$firebaseAuth'];
  function AuthFactory($firebaseAuth) {
    return $firebaseAuth();
  }
}());
