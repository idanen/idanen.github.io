(function () {
  'use strict';

  angular.module('firebase.app.auth', [])
    .factory('Auth', AuthFactory);

  AuthFactory.$inject = ['$firebaseAuth'];
  function AuthFactory($firebaseAuth) {
    return $firebaseAuth();
  }
}());
