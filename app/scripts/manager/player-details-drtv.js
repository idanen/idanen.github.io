(function () {
  'use strict';

  /**
   * The managed game's directive
   */
  angular.module('pokerManager')
    .component('playerDetails', {
      controller: PlayerDetailsController,
      controllerAs: 'pCtrl',
      bindings: {
        playerId: '<?',
        communityFilter: '<?',
        onChanges: '&'
      },
      templateUrl: 'partials/tmpls/player-details-tmpl.html'
    });

  PlayerDetailsController.$inject = ['$q', '$stateParams', 'Players', 'Games'];
  function PlayerDetailsController($q, $stateParams, Players, Games) {
    this.$q = $q;
    this.Games = Games;
    this.Players = Players;
    this.communityId = $stateParams.communityId;

    this.isAdmin = function () {
      return true;
    };

    // Re-fetch player from server
    if (this.playerId) {
      this.player = this.Players.getPlayer(this.playerId);
      this.playerGames = this.Players.getPlayerGames(this.playerId);

      // Get games and calculate stats
      // this.ready = this.$q.all([this.player.$loaded(), this.playerGames.$loaded()])
      //     .then(this.dataForChart.bind(this))
      //     .finally(this.stopLoadingIndication.bind(this));
    } else {
      this.player = this.Players.createPlayer(this.communityId);
      this.ready = this.$q.resolve();
    }

    this.onChanges({player: this.player});
  }

  PlayerDetailsController.prototype = {
    $onChanges: function (changes) {
      if (changes && changes.playerId && changes.playerId.currentValue !== changes.playerId.previousValue) {
        const playerId = changes.playerId.currentValue;
        if (playerId) {
          this.player = this.Players.getPlayer(playerId);
          this.playerGames = this.Players.getPlayerGames(playerId);
        }
      }

      if (changes && changes.communityFilter && changes.communityFilter.currentValue) {
        this.filteredGames = this.playerGames.filter(game => game.communityId === this.communityFilter);
      } else {
        this.filteredGames = this.playerGames;
      }
    },

    onUserChanges: function () {
      if (_.isFunction(this.player.$save)) {
        this.player.$save();
      }
      this.onChanges({player: this.player});
    }
  };
}());
