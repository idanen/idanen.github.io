(function () {
  'use strict';

  /**
   * Game Manager controller
   */
  angular.module('pokerManager')
    .controller('PokerManagerCtrl', PokerManagerController);

  PokerManagerController.$inject = ['$analytics', 'Players', 'playerModal', 'communitiesSvc', 'playersMembership', 'community', 'game', 'playersGames'];

  function PokerManagerController($analytics, Players, playerModal, communitiesSvc, playersMembership, community, game, playersGames) {
    var vm = this;

    this.$analytics = $analytics;
    this.Players = Players;
    this.playerModal = playerModal;
    this.communitiesSvc = communitiesSvc;
    this.playersMembership = playersMembership;
    this.community = community;
    this.playersGames = playersGames;

    this.prefs = {
      playersOpen: false
    };
    this.players = [];
    // init game so not all methods fail before the game is loaded
    this.game = game;
    this.playersInGame = playersGames.getPlayersInGame(game.$id);

    vm.init();
  }

  PokerManagerController.prototype = {
    updatePlayersInGame: function (updated) {
      if (this.playersInGame && _.isFunction(this.playersInGame.$destroy)) {
        this.playersInGame.$destroy();
      }
      this.playersInGame = updated;

      return this.playersInGame;
    },
    addPlayerToGame: function (player) {
      if (player.$id in this.playersInGame) {
        return;
      }
      this.playersGames.addPlayerToGame(player, this.game)
        .then(playersInGame => this.updatePlayersInGame(playersInGame));

      try {
        this.$analytics.eventTrack('Join Game', {category: 'Actions', label: player.name});
      } catch (err) {}
    },
    openPlayersControl: function () {
      this.prefs.playersOpen = !this.prefs.playersOpen;
    },
    closePlayersControl: function () {
      this.prefs.playersOpen = false;
    },

    init: function () {
      // Refresh view
      this.community.$loaded()
        .then(() => {
          this.players = this.Players.playersOfCommunity(this.community.$id, this.community.name);
          this.guests = this.Players.guestsOfCommunity(this.community.$id);

          this.players.$watch(() => this.combineMembersAndGuests());
          this.guests.$watch(() => this.combineMembersAndGuests());
        });
    },

    combineMembersAndGuests: function () {
      this.playersAndGuests = this.players.concat(this.guests);
    },

    refreshPlayersList: function () {
      this.init();
    },

    clearCurrentGame: function () {
      // Reset is-playing state
      // _.forEach(vm.players, function (player) {
      //   player.isPlaying = false;
      // });

      // Reset game
      this.game.location = '';
      this.game.date = Date.now();
      this.game.numberOfHands = 0;
      this.playersInGame = [];
    },

    playersOrder: function (player) {
      return player.games ? -Object.keys(player.games).length : 0;
    },

    openPlayerDetailsDialog: function () {
      this.closePlayersControl();

      this.playerModal.open()
        .then(savedPlayer => {
          // If new -> update default values
          if (savedPlayer.isNew) {
            savedPlayer.buyin = 0;
            savedPlayer.isPlaying = false;
          }

          return savedPlayer;
        })
        .then(player => this.playersMembership.addPlayer(player, this.community))
        .then(this.init.bind(this));
    },
    updateMembership: function (player) {
      return this.communitiesSvc.addMember(player, this.community);
    },
    chipsValueChanged: function (current) {
      if (!current) {
        current = this.game.chipValue = 1;
      }
      if (this.playersInGame) {
        _.forEach(this.playersInGame, player => {
          if (player.buyout) {
            player.currentChipCount = player.buyout * current;
          } else {
            player.currentChipCount = 0;
          }
          this.playersInGame.$save(player);
        });
      }
    }
  };
}());
