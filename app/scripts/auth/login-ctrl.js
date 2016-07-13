(function () {
  'use strict';

  /**
   * Login controller
   */
  angular.module('pokerManager')
    .controller('LoginCtrl', LoginController);

  LoginController.$inject = ['userService', '$analytics', '$firebaseAuth'];
  function LoginController(userService, $analytics, $firebaseAuth) {
    var vm = this;

    vm.signIn = signIn;
    vm.signOut = signOut;

    $firebaseAuth().$onAuthStateChanged(obtainedUserInfo);

    function signIn(provider) {
      userService.login(provider)
        .then(obtainedUserInfo)
        .catch(function (error) {
          console.log(error);
        });
    }

    function signOut() {
      try {
        $analytics.eventTrack('Sign out', {category: 'Actions', label: vm.user.name});
      } catch (err) {}

      userService.logout();
      delete vm.user;
    }

    function obtainedUserInfo(user) {
      var player, providerData;
      if (user) {
        providerData = user.providerData[0];

        player = {
          name: providerData.displayName,
          email: providerData.email,
          photoURL: providerData.photoURL
        };

        vm.user = angular.extend({}, user, player);
      }
    }
  }
}());
