(function () {
  'use strict';

  /**
   * Login controller
   */
  angular.module('pokerManager').
    controller('LoginCtrl', LoginController);

  LoginController.$inject = ['userService', 'Players', '$state'];

  function LoginController(userService, Players, $state) {
    var vm = this;

    vm.signIn = signIn;
    vm.signOut = signOut;

    userService.save()
      .then(obtainedUserInfo);

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
        return Players.matchUserToPlayer(vm.user)
          .then(function (userPlayer) {
            var communitiesIds = Object.keys(userPlayer.memberIn);
            if (communitiesIds && communitiesIds.length && !$state.includes('community')) {
              $state.go('community', {
                communityId: communitiesIds[0]
              });
            }
          });
      }
    }
  }
}());
