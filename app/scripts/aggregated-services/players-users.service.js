(function () {
  'use strict';

  angular.module('pokerManager')
    .service('playersUsers', PlayersUsersService);

  PlayersUsersService.$inject = ['Ref', 'Players', 'userService'];
  function PlayersUsersService(Ref, Players, userService) {
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
      return this.playersSvc.findBy('email', user.email)
        .then(this.playersSvc.addUser.bind(this.playersSvc, user))
        .then(this.userSvc.linkUserToPlayer.bind(this.userSvc));
    }
  };
}());
