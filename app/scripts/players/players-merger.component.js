(function () {
  'use strict';

  class PlyersMergerController {
    static get $inject() {
      return ['$element', '$q', 'playersGames'];
    }

    constructor($element, $q, playersGames) {
      this.$element = $element;
      this.$q = $q;
      this.playersGames = playersGames;
    }

    $onInit() {
      this.targetSelector = this.$element.find('.target-player')[0];
      this.sourceSelector = this.$element.find('.source-player')[0];
    }

    $onChanges() {
      let promises = [];
      if (this.players) {
        promises.push(this.players.$loaded());
      }
      if (this.guests) {
        promises.push(this.guests.$loaded());
      }

      return this.$q.all(promises)
        .then(() => this._initPickersLists());
    }

    $postLink() {
      this.targetSelector.addEventListener('value-changed', event => {
        this.targetPlayer = _.find(this.players, {$id: event.detail.value}) || _.find(this.guests, {$id: event.detail.value});
      });
      this.sourceSelector.addEventListener('value-changed', event => {
        this.sourcePlayerId = event.detail.value;
      });
    }

    _initPickersLists() {
      let allPlayers = [];
      if (this.players) {
        allPlayers = allPlayers.concat(this.players.map(this._playersMappingFn));
      }
      if (this.guests) {
        allPlayers = allPlayers.concat(this.guests.map(this._playersMappingFn));
      }
      this.targetSelector.items = allPlayers;
      this.sourceSelector.items = allPlayers;
    }

    mergePlayers() {
      if (this.targetPlayer && this.sourcePlayerId) {
        return this.playersGames.moveResultsToAnotherPlayer(this.sourcePlayerId, this.targetPlayer);
      }
    }

    _playersMappingFn(player) {
      return {
        label: player.displayName || player.name,
        value: player.$id
      };
    }
  }

  angular.module('pokerManager')
    .component('playersMerger', {
      controller: PlyersMergerController,
      bindings: {
        players: '<',
        guests: '<'
      },
      templateUrl: 'scripts/players/players-merger.view.html'
    });
}());
