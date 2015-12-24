(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('PlayersCtrl', PlayersController);

  PlayersController.$inject = ['players'];
  function PlayersController(players) {
    this.players = players;
  }
}());
