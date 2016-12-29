(function () {
  'use strict';

  /**
   * Login controller
   */
  angular.module('pokerManager')
    .controller('LoginCtrl', LoginController);

  LoginController.$inject = ['userService', '$analytics', 'playersUsers', 'Players'];
  function LoginController(userService, $analytics, playersUsers, playersSvc) {
    this.userService = userService;
    this.$analytics = $analytics;
    this.playersUsers = playersUsers;
    this.playersSvc = playersSvc;

    this.userService.onUserChange(this.obtainedUserInfo.bind(this));
  }

  LoginController.prototype = {
    signOut: function () {
      try {
        this.$analytics.eventTrack('Sign out', {category: 'Actions', label: this.user.name});
      } catch (err) {}

      this.userService.logout();
      delete this.user;
      this.onLogout();
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
