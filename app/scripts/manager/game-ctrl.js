(function () {
  'use strict';

  /**
   * Game controller
   */
  angular.module('pokerManager')
    .controller('GameCtrl', GameController);

  GameController.$inject = ['$analytics', 'Games', 'playersGames', '$state'];
  function GameController($analytics, gamesSvc, playersGames, $state) {
    this.$analytics = $analytics;
    this.playersGames = playersGames;
    this.gamesSvc = gamesSvc;
    this.game = this.gamesSvc.getGame(this.gameId);
    this.playersInGame = playersGames.getPlayersInGame(this.gameId);
    this.$state = $state;
  }

  GameController.prototype = {
    initGame: function () {
      this.playersGames.removeAllPlayersFromGame(this.gameId);
      this.game.location = '';
      this.game.date = Date.now();
      this.game.numberOfHands = 0;
      this.game.chipValue = 4;
      this.game.defaultBuyin = 50;
      this.game.maxBuyin = 400;
      this.game.hostingCosts = 10;
    },
    clearGame: function () {
      this.initGame();
    },
    deleteGame: function () {
      this.gamesSvc.deleteGame(this.gameId)
        .then(() => this.$state.go('^', {}, {location: 'replace'}));
    },
    buyin: function (player, rationalBuyin) {
      var calculatedBuyin = rationalBuyin * this.game.defaultBuyin;
      player.buyin += calculatedBuyin;
      // player.balance -= player.buyin;
      player.currentChipCount = parseInt(player.currentChipCount, 10) + calculatedBuyin * this.game.chipValue;
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playersInGame.$save(player);

      try {
        this.$analytics.eventTrack('Buyin', {category: 'Actions', label: player.name});
      } catch (err) {}
    },
    startGame: function () {
      _.forEach(this.playersInGame, player => this.buyin(player, 1));
    },
    cancelBuyin: function (player, rationalBuyin) {
      var actualBuyin = rationalBuyin * this.game.defaultBuyin;
      player.buyin -= actualBuyin;
      // player.balance += player.buyin;
      player.currentChipCount = parseInt(player.currentChipCount, 10) - actualBuyin * this.game.chipValue;
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playersInGame.$save(player);
    },

    updatePlayersInGame: function (updated) {
      if (this.playersInGame && _.isFunction(this.playersInGame.$destroy)) {
        this.playersInGame.$destroy();
      }
      this.playersInGame = updated;
    },

    gameSettingsChanged: function (newSettings) {
      _.extend(this.game, newSettings);
      this.game.$save();
    },

    gameDetailsChanged: function (newDetails) {
      _.extend(this.game, newDetails);
      this.game.$save();
    },

    cancelAddPlayer: function (player) {
      this.playersGames.removePlayerFromGame(player.$id, this.gameId);
    },

    buyout: function (player) {
      if (player.isPlaying) {
        player.isPlaying = false;
      }

      // Add payout to player's balance
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playerResultUpdated(player);
    },

    bust: function (player) {
      player.currentChipCount = 0;
      this.buyout(player);
    },

    comeBack: function (player) {
      if (!player.isPlaying) {
        player.isPlaying = true;
        this.playerResultUpdated(player);
      }
    },

    addOrSubtractChips: function (player, howMany, toAdd) {
      if (toAdd) {
        player.currentChipCount += howMany * this.game.defaultBuyin * this.game.chipValue;
      } else {
        player.currentChipCount -= howMany * this.game.defaultBuyin * this.game.chipValue;
      }
      this.chipCountUpdate(player);
    },

    chipCountUpdate: function (player) {
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playerResultUpdated(player);
    },

    totalBuyin: function () {
      return _.sumBy(this.playersInGame, 'buyin');
    },

    totalChips: function () {
      return _.sumBy(this.playersInGame, 'currentChipCount');
    },

    totalHosting: function () {
      var sum = 0;
      if (!this.playersInGame) {
        return 0;
      }

      _.forEach(this.playersInGame, player => {
        sum += player.paidHosting ? this.game.hostingCosts : 0;
      });
      return sum;
    },

    toggleGameDate: function ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      this.game.dateOpen = !this.game.dateOpen;
    },

    isGameInProgress: function () {
      return this.playersInGame && _.some(this.playersInGame, 'isPlaying');
    },

    chipsValueUpdated: function (val) {
      var prev;
      if (val === this.game.chipValue) {
        return;
      }
      prev = this.game.chipValue || 1;
      this.game.chipValue = val || 1;
      this.game.$save();
      this.onChipValueUpdate({prev: prev, curr: this.game.chipValue});
    },

    numberOfHandsUpdated: function (counter) {
      this.game.numberOfHands = counter;
      this.game.$save();
    },

    playerResultUpdated: function (player) {
      // this.playersInGame.$save(player);
      this.playersGames.updatePlayerResult(player, this.game, player);
    }
  };
}());
