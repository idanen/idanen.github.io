(function() {
  'use strict';
  angular.module('firebase.auth', ['firebase', 'firebase.ref'])
    .factory('Auth', AuthFactory);

  AuthFactory.$inject = ['$firebaseAuth', 'Ref'];
  function AuthFactory($firebaseAuth, Ref) {

    return $firebaseAuth(Ref);
  }
})();
