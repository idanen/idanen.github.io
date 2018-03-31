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

  PlayerDetailsController.$inject = ['$q', '$stateParams', '$element', 'Players', 'Games', 'playersMembership', 'communitiesSvc'];
  function PlayerDetailsController($q, $stateParams, $element, Players, Games, playersMembership, communitiesSvc) {
    this.$q = $q;
    this.$element = $element;
    this.Games = Games;
    this.Players = Players;
    this.communityId = $stateParams.communityId;
    this.playersMembership = playersMembership;
    this.communitiesSvc = communitiesSvc;

    this.isAdmin = function () {
      return true;
    };

    this.updatePlayer = this.updatePlayer.bind(this);
  }

  PlayerDetailsController.prototype = {
    $onInit() {
      if (this.player) {
        return;
      }
      this.player = this.Players.createPlayer(this.communityId);
      this.ready = this.$q.resolve();

      if (this.onChanges) {
        this.onChanges({player: this.player});
      }
    },
    $onChanges: function (changes) {
      if (!changes) {
        return;
      }

      if (changes.playerId) {
        this.handlePlayerIdChanges(changes.playerId.currentValue, changes.playerId.previousValue);
      }

      if (changes.communityFilter && changes.communityFilter.currentValue) {
        this.filteredGames = this.playerGames.filter(game => game.communityId === this.communityFilter);
      } else {
        this.filteredGames = this.playerGames;
      }
    },

    $onDestroy() {
      this.$element.off();
    },

    updatePlayer() {
      if (!this.isAdmin()) {
        return;
      }
      Object.keys(this.inputs).forEach(field => {
        this.player[field] = this.inputs[field].value;
      });
      return this.player.$save();
    },

    handlePlayerIdChanges(currentPlayerId, previousPlayerId) {
      const playerId = currentPlayerId;
      if (playerId && playerId !== previousPlayerId) {
        if (this.player && _.isFunction(this.player.$destroy)) {
          this.player.$destroy();
        }
        if (this.playerGames && _.isFunction(this.playerGames.$destroy)) {
          this.playerGames.$destroy();
        }
        this.player = this.Players.getPlayer(playerId);
        this.playerGames = this.Players.getPlayerGames(playerId);
        this.ready = this.player.$loaded()
          .then(() => {
            this.initializeInputs();
          });
      } else {
        this.player = this.Players.createPlayer(this.communityId);
        this.playerGames = [];
        this.ready = this.$q.resolve();
      }

      this.ready.then(() => {
        if (this.onChanges) {
          this.onChanges({player: this.player});
        }
      });
    },

    initializeInputs() {
      this.inputs = ['email', 'displayName', 'phone']
        .reduce((inputs, field) => {
          const fieldInput = this.$element.find(`.player-${field}`)[0];
          fieldInput.value = this.player[field];
          fieldInput.addEventListener('input', this.updatePlayer);
          return Object.assign({}, inputs, {
            [field]: fieldInput
          });
        }, {});
    },

    giveUserAdminPrivileges: function () {
      if (this.player.membership[this.communityId]) {
        return this.communitiesSvc.getUnboundCommunity(this.communityId)
          .then(community => this.playersMembership.setPlayerAsAdminOfCommunity(community, this.player));
      }
    },

    promoteGuestToMember: function () {
      if (this.player.membership[this.communityId]) {
        return this.communitiesSvc.getUnboundCommunity(this.communityId)
          .then(community => this.Players.joinCommunity(this.player, community));
      }
    }
  };
}());
