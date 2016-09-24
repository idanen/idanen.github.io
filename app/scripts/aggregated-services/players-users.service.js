(function () {
  'use strict';

  angular.module('pokerManager')
    .service('playersUsers', PlayersUsersService);

  PlayersUsersService.$inject = ['$q', 'Ref', 'Players', 'userService'];
  function PlayersUsersService($q, Ref, Players, userService) {
    this.$q = $q;
    this.Ref = Ref;
    this.playersSvc = Players;
    this.userSvc = userService;
  }

  PlayersUsersService.prototype = {
    createUser: function (name, email, pass) {
      return this.userSvc.createUser(name, email, pass)
        .then(savedUser => this.matchUserToPlayer(savedUser));
    },

    matchUserToPlayer: function (user) {
      return this.$q.resolve(
        this.playersSvc.findBy('email', user.email)
          .then(player => this.playersSvc.addUser(user, player))
          .then(this.userSvc.linkUserToPlayer.bind(this.userSvc))
      );
    }
  };
}());
