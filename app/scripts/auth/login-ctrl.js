(function () {
  'use strict';

  /**
   * Login controller
   */
  angular.module('pokerManager').
    controller('LoginCtrl', LoginController);

  LoginController.$inject = ['userService', 'Players'];

  function LoginController(userService, Players) {
    var vm = this;

    vm.signIn = signIn;
    vm.signOut = signOut;

    userService.save().then(obtainedUserInfo);

    function signIn(provider) {
      userService.login(provider)
        .then(obtainedUserInfo)
        .catch(function (error) {
          console.log(error);
        });
    }

    function signOut() {
      // TODO(idan): Add analytics event
      userService.logout();
      delete vm.user;
    }

    function obtainedUserInfo(user) {
      var player;
      if (user) {
        player = {
          name: user[user.provider].displayName,
          email: user[user.provider].email,
          imageUrl: user[user.provider].profileImageURL
        };

        vm.user = angular.extend({}, user, player);
        // console.log(vm.user);

        // Save user as a player
        return Players.matchUserToPlayer(vm.user);
      }
    }
  }
}());
