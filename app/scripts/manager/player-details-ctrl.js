(function () {
  'use strict';

  /**
   * Player Modal's controller
   */
  angular.module('pokerManager')
    .controller('ModalPlayerDetailsCtrl', ModalPlayerDetailsController)
    .controller('PlayerDetailsCtrl', PlayerDetailsController);

  ModalPlayerDetailsController.$inject = ['$uibModalInstance', 'player'];

  function ModalPlayerDetailsController($uibModalInstance, player) {
    var vm = this;
    vm.player = player;

    vm.ok = function () {
      $uibModalInstance.close(vm.player);
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }

  PlayerDetailsController.$inject = ['$q', '$stateParams', '$filter', 'Players', 'Games'];
  function PlayerDetailsController($q, $stateParams, $filter, Players, Games) {
    this.loading = false;
    this.$q = $q;
    this.Games = Games;
    this.Players = Players;
    this.communityId = $stateParams.communityId;
    this.$filter = $filter;

    this.chartData = {
      dates: [],
      profits: [],
      balances: []
    };

    this.isAdmin = function () {
      return true;
    };

    // Re-fetch player from server
    if (this.playerId) {
      this.player = this.Players.getPlayer(this.playerId);
      this.playerGames = this.Players.getPlayerGames(this.playerId);

      // Get games and calculate stats
      this.ready = this.$q.all([this.player.$loaded(), this.playerGames.$loaded()])
          .then(this.dataForChart.bind(this))
          .finally(this.stopLoadingIndication.bind(this));
    } else {
      this.player = this.Players.createPlayer();
      this.ready = this.$q.resolve();
    }
  }

  PlayerDetailsController.prototype = {
    dataForChart: function () {
      this.playerGamesCount = this.playerGames.length;
      _.reduce(this.playerGames, function (sum, gameResult) {
        var profit;
        if (!isNaN(gameResult.date)) {
          this.chartData.dates.push(this.$filter('date')(gameResult.date, 'y-MM-dd'));
        } else {
          this.chartData.dates.push(gameResult.date);
        }
        profit = gameResult.buyout - gameResult.buyin;
        sum += profit;
        gameResult.balance = sum;
        this.chartData.profits.push(profit);
        this.chartData.balances.push(sum);

        return sum;
      }.bind(this), 0);
    },
    winningSessions: function () {
      if (this.playerGames) {
        return _.reduce(this.playerGames, function (count, game) {
          if (game.buyout >= game.buyin) {
            return count + 1;
          }
          return count;
        }, 0);
      }
      return 0;
    },
    avgWinning: function (player, bb) {
      var sum = 0,
          gamesCount = 0;
      if (player.games) {
        _.forEach(player.games, function (game) {
          sum += (game.buyout - game.buyin) / (bb ? 50 : 1);
          gamesCount += 1;
        });
      }
      return sum / (gamesCount || 1);
    },
    stopLoadingIndication: function () {
      this.loading = false;
    },
    refreshData: function () {
      // Calculate extra data
      this.playerWinningSessions = this.winningSessions(this.player);
      this.playerAvgWinning = this.avgWinning(this.player, true);
    }
  };
}());
