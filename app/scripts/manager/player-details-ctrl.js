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

  PlayerDetailsController.$inject = ['$stateParams', '$filter', 'Players', 'Games'];
  function PlayerDetailsController($stateParams, $filter, Players, Games) {
    this.loading = false;
    this.Games = Games;
    this.communityId = $stateParams.communityId;
    this.playerId = $stateParams.playerId;
    this.$filter = $filter;

    this.chartData = {
      dates: [],
      profits: [],
      balances: []
    };

    this.isAdmin = function () {
      // return ( window.location.pathname.indexOf( 'manage.html' ) > -1 );
      return true;
    };

    // Re-fetch player from server
    this.player = Players.getPlayer(this.playerId);

    // Get games and calculate stats
    this.ready = this.player.$loaded()
      .then(this.getStats.bind(this));

    /*
     $scope.isAdmin = function() {
     return $scope.admin;
     };
     */
  }

  PlayerDetailsController.prototype = {
    getStats: function () {
      this.loading = true;
      return this.Games.gamesOfCommunity(this.communityId)
        .then(this.filterByPlayer.bind(this))
        .then(this.dataForChart.bind(this))
        .finally(function () {
          this.loading = false;
        }.bind(this));
    },
    filterByPlayer: function (allCommunityGames) {
      var games = _.chain(allCommunityGames)
        .filter(function (game) {
          return game.players && this.player.$id in game.players;
        }.bind(this))
        .map(function (game) {
          var gameResult = game.players[this.player.$id];
          gameResult.$id = game.$id || game.id;
          return gameResult;
        }.bind(this))
        .orderBy(['date'], ['asc'])
        .value();
      _.reduce(games, function (sum, gameResult) {
        gameResult.balance = gameResult.buyout - gameResult.buyin + sum;
        return gameResult.balance;
      }, 0);
      _.orderBy(games, ['date'], ['desc']);
      this.player.games = games;
      this.player.gamesCount = games.length;
    },
    dataForChart: function () {
      var iterations = 0;
      _.reduce(this.player.games, function (sum, gameResult) {
        var profit;
        iterations += 1;
        if (!isNaN(gameResult.date)) {
          this.chartData.dates.push(this.$filter('date')(gameResult.date, 'y-MM-dd'));
        } else {
          this.chartData.dates.push(gameResult.date);
        }
        profit = gameResult.buyout - gameResult.buyin;
        sum += profit;
        this.chartData.profits.push(profit);
        this.chartData.balances.push(sum);

        if (iterations > 20) {
          return false;
        }
        return sum;
      }.bind(this), 0);
    },
    winningSessions: function () {
      if (this.player.games) {
        return _.reduce(this.player.games, function (count, game) {
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
    refreshData: function () {
      // Calculate extra data
      this.player.winningSessions = this.winningSessions(this.player);
      this.player.avgWinning = this.avgWinning(this.player, true);
    }
  };
}());
