(function () {
  'use strict';

  class PlyersMergerController {
    static get $inject() {
      return ['$element', 'playersGames'];
    }

    constructor($element, playersGames) {
      this.$element = $element;
      this.playersGames = playersGames;
    }

    $onInit() {
      this.targetSelector = this.$element.find('.target-player')[0];
      this.sourceSelector = this.$element.find('.source-player')[0];
    }

    $onChanges() {
      if (this.players) {
        this.players.$loaded()
          .then(() => this._initPickersLists());
      }
    }

    $postLink() {
      this.targetSelector.addEventListener('value-changed', event => {
        this.targetPlayer = _.find(this.players, {$id: event.detail.value});
      });
      this.sourceSelector.addEventListener('value-changed', event => {
        this.sourcePlayerId = event.detail.value;
      });
    }

    _initPickersLists() {
      let playersForPickers = this.players.map(player => {
        return {
          label: player.displayName || player.name,
          value: player.$id
        };
      });
      this.targetSelector.items = playersForPickers;
      this.sourceSelector.items = playersForPickers;
    }

    mergePlayers() {
      if (this.targetPlayer && this.sourcePlayerId) {
        return this.playersGames.moveResultsToAnotherPlayer(this.sourcePlayerId, this.targetPlayer);
      }
    }
  }

  angular.module('pokerManager')
    .component('playersMerger', {
      controller: PlyersMergerController,
      bindings: {
        players: '<'
      },
      templateUrl: 'scripts/players/players-merger.view.html'
    });
}());
