(function () {
  'use strict';

  /**
   * Login controller
   */
  angular.module('pokerManager')
    .controller('LoginCtrl', LoginController);

  LoginController.$inject = ['userService', '$analytics', '$firebaseAuth', 'playersUsers', 'Players'];
  function LoginController(userService, $analytics, $firebaseAuth, playersUsers, playersSvc) {
    this.userService = userService;
    this.$analytics = $analytics;
    this.playersUsers = playersUsers;
    this.playersSvc = playersSvc;

    $firebaseAuth().$onAuthStateChanged(this.obtainedUserInfo.bind(this));
    this.userService.onUserChange(this.obtainedUserInfo.bind(this));
  }

  LoginController.prototype = {
    signOut: function () {
      try {
        this.$analytics.eventTrack('Sign out', {category: 'Actions', label: this.user.name});
      } catch (err) {}

      this.userService.logout();
      delete this.user;
    },

    matchUserToPlayer: function (user) {
      if (!user) {
        console.warn('Trying to match user to player but user is undefined');
        return;
      }

      if (user.playerId) {
        return this.playersSvc.getPlayer(user.playerId);
      }

      return this.playersUsers.matchUserToPlayer(user);
    },

    obtainedUserInfo: function (user) {
      this.user = user;
      return this.user;
    }
  };
}());
