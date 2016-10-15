(function () {
  'use strict';

  angular.module('pokerManager')
    .component('playerChip', {
      templateUrl: 'scripts/players/player-chip.view.html',
      bindings: {
        player: '<'
      }
    });
}());
