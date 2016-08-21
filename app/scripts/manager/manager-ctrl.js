(function () {
  'use strict';

  /**
   * Game Manager controller
   */
  angular.module('pokerManager')
    .controller('PokerManagerCtrl', PokerManagerController);

  PokerManagerController.$inject = ['$scope', '$analytics', 'toaster', 'Players', 'playerModal', 'communitiesSvc', 'community', 'game', 'Games', 'playersGames'];

  function PokerManagerController($scope, $analytics, toaster, Players, playerModal, communitiesSvc, community, game, Games, playersGames) {
    var vm = this;

    this.$analytics = $analytics;
    this.Players = Players;
    this.playerModal = playerModal;
    this.communitiesSvc = communitiesSvc;
    this.community = community;
    this.playersGames = playersGames;

    this.prefs = {
      playersOpen: false
    };
    this.players = [];
    // init game so not all methods fail before the game is loaded
    this.game = game;
    this.playersInGame = playersGames.getPlayersInGame(game.$id);
    // Binding the firebase instance to the scope. This assumes that the controller's name is `vm`
    // Games.getGame(game.$id).$bindTo($scope, 'vm.game');

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
        });
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

    openPlayerDetailsDialog: function (player) {
      this.closePlayersControl();

      this.playerModal.open(player)
        .then(savedPlayer => {
          // If new -> update default values
          if (savedPlayer.isNew) {
            savedPlayer.buyin = 0;
            savedPlayer.isPlaying = false;
          }

          player = savedPlayer;
        })
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
