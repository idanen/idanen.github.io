(function () {
  'use strict';

  /**
   * Login controller
   */
  angular.module('pokerManager')
    .controller('LoginCtrl', LoginController);

  LoginController.$inject = ['userService', '$analytics', '$firebaseAuth', 'playersUsers'];
  function LoginController(userService, $analytics, $firebaseAuth) {
    this.userService = userService;
    this.$analytics = $analytics;
    this.playersUsers = playersUsers;

    $firebaseAuth().$onAuthStateChanged(this.obtainedUserInfo.bind(this));
  }

  LoginController.prototype = {
    signIn: function (provider) {
      this.userService.login(provider)
      // TODO: match user to player only if not already matched
        .then(this.playersUsers.matchUserToPlayer.bind(this.playersUsers))
        .catch(function (error) {
          console.log(error);
        });
    },

    signOut: function () {
      try {
        this.$analytics.eventTrack('Sign out', {category: 'Actions', label: this.user.name});
      } catch (err) {}

      this.userService.logout();
      delete this.user;
    },

    obtainedUserInfo: function (user) {
      var player, providerData;
      if (user) {
        providerData = user.providerData[0];

        player = {
          name: providerData.displayName,
          email: providerData.email,
          photoURL: providerData.photoURL
        };

        this.user = angular.extend({}, user, player);

        return this.user;
      }
    }
  };
}());
