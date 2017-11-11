(function () {
  'use strict';

  var DAY = 1000 * 60 * 60 * 24,
      // WEEK = DAY * 7,
      MONTH = DAY * 30,
      QUARTER = MONTH * 3,
      YEAR = DAY * 365;

  /**
   * Stats controller
   */
  angular.module('pokerManager')
    .controller('PokerStatsCtrl', PokerStatsController);

  PokerStatsController.$inject = ['$state', 'Utils', 'Games', 'playerModal'];

  function PokerStatsController($state, utils, Games, playerModal) {
    var vm = this,
        today = Date.now();

    this.$state = $state;
    this.utils = utils;
    this.Games = Games;
    this.playerModal = playerModal;

    vm.totalGames = 0;
    vm.filterOptions = {
      gamesCount: [0, 0.1, 0.25, 0.5, 0.75]
    };
    vm.filter = {
      name: '',
      gamesCount: vm.filterOptions.gamesCount[0]
    };

    vm.displayGames = {
      fromDate: $state.params.fromDate || today - MONTH,
      fromDateOpen: false,
      toDate: $state.params.toDate || today,
      toDateOpen: false,
      players: [],
      filtered: []
    };

    vm.playerPredicate = function (player) {
      return new RegExp(vm.filter.name, 'gi').test(player.displayName) && player.gamesCount > Math.floor(vm.filter.gamesCount * vm.totalGames);
    };

    // function formatDate(aDate) {
    //  return $filter('date')(aDate, 'y-MM-dd');
    // }
  }

  PokerStatsController.prototype = {
    getPlayers: function () {
      var fromDate = this.$state.params.fromDate || this.displayGames.fromDate,
          toDate = this.$state.params.toDate || this.displayGames.toDate;
      // console.time('calculating-stats');
      return this.Games.findBetweenDates(fromDate, toDate, this.$state.params.communityId)
        .then(this.gamesToPlayers.bind(this));
    },

    gamesToPlayers: function (games) {
      var players = {},
          gamesForCount = {};
      games.forEach(game => {
        gamesForCount[game.$id] = true;
        if (game.players) {
          _.forEach(game.players, (player, playerId) => {
            if (playerId in players) {
              players[playerId].buyin += player.buyin;
              players[playerId].buyout += player.buyout;
              players[playerId].gamesCount += 1;
            } else {
              players[playerId] = player;
              players[playerId].$id = playerId;
              players[playerId].gamesCount = 1;
            }
          });
        }
      });

      this.displayGames.players = _.values(players);
      this.displayGames.players = _.sortBy(this.displayGames.players, [player => {
        return player.gamesCount && (player.buyin - player.buyout) / player.gamesCount;
      }]);
      this.totalGames = Object.keys(gamesForCount).length;
      // console.timeEnd('calculating-stats');

      return this.displayGames.players;
    },

    init: function () {
      // Refresh view
      this.getPlayers();
    },

    loadGames: function () {
      this.$state.go('stats', {
        communityId: this.$state.params.communityId,
        fromDate: this.displayGames.fromDate,
        toDate: this.displayGames.toDate
      });
    },

    loadGamesBetweenDates: function (from, to, gamesCountOptionIdx) {
      this.displayGames.fromDate = from;
      this.displayGames.toDate = to;
      if (!isNaN(gamesCountOptionIdx)) {
        this.filter.gamesCount = this.filterOptions.gamesCount[gamesCountOptionIdx || 0];
      }
      this.loadGames();
    },

    loadLastGame: function () {
      var today = Date.now();
      this.loadGamesBetweenDates(today - (DAY * 3), today);
    },

    loadLastMonthGames: function () {
      var today = Date.now();
      this.loadGamesBetweenDates(today - MONTH, today);
    },

    loadLastQuarterGames: function () {
      var today = Date.now();
      this.loadGamesBetweenDates(today - QUARTER, today);
    },

    loadLastYearGames: function () {
      var today = Date.now();
      this.loadGamesBetweenDates(today - YEAR, today);
    },

    loadThisYearGames: function () {
      var yearStart = new Date();
      yearStart.setMonth(0);
      yearStart.setDate(1);
      this.loadGamesBetweenDates(yearStart.getTime(), Date.now());
    },

    loadAllTimeGames: function () {
      this.displayGames.fromDate = new Date(2000, 9, 1).getTime();
      this.displayGames.toDate = Date.now();
      this.filter.gamesCount = this.filterOptions.gamesCount[1];
      this.loadGames();
    },

    statsAvgBuyin: function () {
      return this.utils.avgsCalc(this.displayGames.players, 'buyin');
    },

    statsAvgBuyout: function () {
      return this.utils.avgsCalc(this.displayGames.players, 'buyout');
    },

    statsAvgGameCount: function () {
      return this.utils.avgsCalc(this.displayGames.players, 'gamesCount');
    },

    statsAvgWinnings: function () {
      var sum = 0;
      sum = this.displayGames.players.reduce(function (accumulated, player) {
        return accumulated + player.buyout - player.buyin;
      }, sum);
      return sum;
    },

    statsAvgWinningsPerGame: function statsAvgWinningsPerGame() {
      var avg = 0;
      avg = this.displayGames.players.reduce(function (accumulated, player) {
        return accumulated + ((player.buyout - player.buyin) / player.gamesCount);
      }, avg);
      return avg;
    },

    filterPlayers: function () {
      this.displayGames.filtered = this.displayGames.players.filter(function (player) {
        return player.gamesCount > Math.floor(this.filter.gamesCount * this.totalGames);
      }.bind(this));
    },

    openPlayerDetailsDialog: function (player) {
      this.playerModal.open(player)
        .then(function (savedPlayer) {
          /*
           * Update the local instance if the player with the changeable fields from the modal
           */
          player.displayName = savedPlayer.displayName;
          player.phone = savedPlayer.phone;
          player.email = savedPlayer.email;
        });
    }
  };
}());
