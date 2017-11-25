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
      this.player = this.Players.createPlayer(this.communityId);
      this.ready = this.$q.resolve();

      if (this.onChanges) {
        this.onChanges({player: this.player});
      }
    },
    $onChanges: function (changes) {
      if (changes && changes.playerId && changes.playerId.currentValue !== changes.playerId.previousValue) {
        const playerId = changes.playerId.currentValue;
        if (playerId && playerId !== changes.playerId.previousValue) {
          if (this.player && _.isFunction(this.player.$destroy)) {
            this.player.$destroy();
          }
          if (this.playerGames && _.isFunction(this.playerGames.$destroy)) {
            this.playerGames.$destroy();
          }
          this.player = this.Players.getPlayer(playerId);
          this.playerGames = this.Players.getPlayerGames(playerId);
          this.player.$loaded()
            .then(() => {
              this.playerFields = ['email', 'displayName', 'phone'];
              this.inputs = this.playerFields
                .reduce((inputs, field) => {
                  return Object.assign({}, inputs, {
                    [field]: this.$element.find(`.player-${field}`)[0]
                  });
                }, {});
              Object.keys(this.inputs).forEach(field => {
                this.inputs[field].value = this.player[field];
                this.inputs[field].addEventListener('input', this.updatePlayer);
              });
              if (this.onChanges) {
                this.onChanges({player: this.player});
              }
            });
        } else {
          this.player = this.Players.createPlayer(this.communityId);
          this.playerGames = [];
          this.ready = this.$q.resolve();

          if (this.onChanges) {
            this.onChanges({player: this.player});
          }
        }
      }

      if (changes && changes.communityFilter && changes.communityFilter.currentValue) {
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
