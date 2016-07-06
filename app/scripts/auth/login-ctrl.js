(function () {
  'use strict';

  /**
   * Login controller
   */
  angular.module('pokerManager')
    .controller('LoginCtrl', LoginController);

  LoginController.$inject = ['userService', 'playersUsers', '$state', '$analytics', '$firebaseAuth'];

  function LoginController(userService, playersUsers, $state, $analytics, $firebaseAuth) {
    var vm = this;

    vm.signIn = signIn;
    vm.signOut = signOut;

    // userService.waitForUser()
    //  .then(obtainedUserInfo);
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
        // console.log(vm.user);

        // Save user as a player
        // return playersUsers.matchUserToPlayer(vm.user)
        //   .then(function (userPlayer) {
        //     var communitiesIds = Object.keys(userPlayer.memberIn);
        //     if (communitiesIds && communitiesIds.length) {
        //       userService.setUserCommunities(communitiesIds);
        //       if (!$state.includes('community')) {
        //         $state.go('community', {
        //           communityId: communitiesIds[0]
        //         });
        //       }
        //     }
        //   });
      }
    }
  }
}());
