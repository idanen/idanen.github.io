(function () {
  'use strict';

  class PlayerChipController {
    static get $inject() {
      return ['userService'];
    }

    constructor(userService) {
      this.userService = userService;
    }

    get photoURL() {
      return this.player.photoURL || this.userService.generateImageUrl(this.player.email || this.player.$id);
    }
  }

  angular.module('pokerManager')
    .component('playerChip', {
      templateUrl: 'scripts/players/player-chip.view.html',
      bindings: {
        player: '<'
      },
      controller: PlayerChipController
    });
}());
