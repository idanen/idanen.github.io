(function () {
  'use strict';

  /**
   * Game controller
   */
  angular.module('pokerManager')
    .controller('GameCtrl', GameController);

  GameController.$inject = ['$scope', '$analytics', 'Games', 'playersGames'];
  function GameController($scope, $analytics, gamesSvc, playersGames) {
    this.$scope = $scope;
    this.$analytics = $analytics;
    this.playersGames = playersGames;
    this.game = gamesSvc.getGame(this.gameId);
    this.game.$bindTo($scope, 'vm.game');
    this.playersInGame = playersGames.getPlayersInGame(this.gameId);
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
      _.forEach(this.playersInGame, function (player) {
        this.buyin(player, 1);
      }.bind(this));
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

    cancelAddPlayer: function (player) {
      this.playersGames.removePlayerFromGame(player.$id, this.gameId);
    },

    buyout: function (player) {
      if (player.isPlaying) {
        player.isPlaying = false;
      }

      // Add payout to player's balance
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playersInGame.$save(player);
    },

    bust: function (player) {
      player.currentChipCount = 0;
      this.buyout(player);
    },

    comeBack: function (player) {
      if (!player.isPlaying) {
        player.isPlaying = true;
        this.playersInGame.$save(player);
      }
    },

    addOrSubtractChips: function (player, howMany, toAdd) {
      if (toAdd) {
        player.currentChipCount += howMany * this.game.defaultBuyin;
      } else {
        player.currentChipCount -= howMany * this.game.defaultBuyin;
      }
      this.chipCountUpdate(player);
    },

    chipCountUpdate: function (player) {
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playersInGame.$save(player);
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

      _.forEach(this.playersInGame, function (player) {
        sum += player.paidHosting ? this.game.hostingCosts : 0;
      }.bind(this));
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
      this.$scope.$applyAsync(function () {
        this.game.chipValue = val;
      }.bind(this));
    },

    playerUpdated: function (player) {
      this.playersInGame.$save(player);
    }
  };
}());
