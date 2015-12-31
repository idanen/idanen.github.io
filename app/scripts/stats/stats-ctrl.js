(function () {
  'use strict';

  /**
   * Stats controller
   */
  angular.module('pokerManager').
    controller('PokerStatsCtrl', PokerStatsController);

  PokerStatsController.$inject = ['$state', '$stateParams', 'communityId', 'Utils', 'Games', 'Players', 'playerModal'];

  function PokerStatsController($state, $stateParams, communityId, utils, Games, Players, playerModal) {
    var vm = this,
        DAY = 1000 * 60 * 60 * 24,
        // WEEK = DAY * 7,
        MONTH = DAY * 30,
        QUARTER = MONTH * 3,
        YEAR = DAY * 365;

    vm.today = new Date();
    vm.totalGames = 0;
    vm.dateOptions = {
      'year-format': '\'yyyy\'',
      'month-format': '\'MM\'',
      'day-format': '\'dd\''
    };
    vm.filterOptions = {
      gamesCount: [0, 0.1, 0.25, 0.5, 0.75]
    };
    vm.filter = {
      name: '',
      gamesCount: vm.filterOptions.gamesCount[0]
    };

    vm.displayGames = {
      fromDate: $stateParams.fromDate || vm.today.setMonth(vm.today.getMonth() - 1),
      fromDateOpen: false,
      toDate: $stateParams.toDate || vm.today.setMonth(vm.today.getMonth() + 1),
      toDateOpen: false,
      players: [],
      filtered: []
    };

    vm.init = init;
    vm.toggleDateRange = toggleDateRange;
    vm.loadGames = loadGames;
    vm.loadLastGame = loadLastGame;
    vm.loadLastMonthGames = loadLastMonthGames;
    vm.loadLastQuarterGames = loadLastQuarterGames;
    vm.loadLastYearGames = loadLastYearGames;
    vm.loadAllTimeGames = loadAllTimeGames;
    vm.statsAvgBuyin = statsAvgBuyin;
    vm.statsAvgBuyout = statsAvgBuyout;
    vm.statsAvgGameCount = statsAvgGameCount;
    vm.statsAvgWinnings = statsAvgWinnings;
    vm.statsAvgWinningsPerGame = statsAvgWinningsPerGame;
    vm.gamesCount = gamesCount;
    vm.openPlayerDetailsDialog = openPlayerDetailsDialog;
    vm.filterPlayers = filterPlayers;
    vm.playerPredicate = playerPredicate;

    // function formatDate(aDate) {
    //  return $filter('date')(aDate, 'y-MM-dd');
    // }

    function getPlayers() {
      var fromDate = $stateParams.fromDate || vm.displayGames.fromDate,
          toDate = $stateParams.toDate || vm.displayGames.toDate;
      // return Games.players( { fromDate: formatDate( vm.displayGames.fromDate ), toDate: formatDate ( vm.displayGames.toDate ) } );
      return Games.findBetweenDates(fromDate, toDate, communityId)
        .then(function (games) {
          var players = {};
          games.forEach(function (game) {
            if (game.players) {
              _.forEach(game.players, function (player, playerId) {
                if (playerId in players) {
                  players[playerId].buyin += player.buyin;
                  players[playerId].buyout += player.buyout;
                  players[playerId].gamesCount += 1;
                } else {
                  players[playerId] = player;
                  players[playerId].gamesCount = 1;
                }
              });
            }
          });
          return players;
        })
        .then(function (players) {
          vm.displayGames.players = players;
        });
    }

    function init() {
      // Refresh view
      getPlayers();
    }

    function toggleDateRange(which, $event) {
      $event.preventDefault();
      $event.stopPropagation();

      vm.displayGames[which + 'DateOpen'] = !vm.displayGames[which + 'DateOpen'];
    }

    function loadGames() {
      $state.go('stats', {
        communityId: communityId,
        fromDate: vm.displayGames.fromDate,
        toDate: vm.displayGames.toDate
      });
    }

    function loadGamesBetweenDates(from, to, gamesCountOptionIdx) {
      vm.displayGames.fromDate = from;
      vm.displayGames.toDate = to;
      if (!isNaN(gamesCountOptionIdx)) {
        vm.filter.gamesCount = vm.filterOptions.gamesCount[gamesCountOptionIdx || 0];
      }
      vm.loadGames();
    }

    function loadLastGame() {
      var today = Date.now();
      loadGamesBetweenDates(today - DAY * 3, today);
    }

    function loadLastMonthGames() {
      var today = Date.now();
      loadGamesBetweenDates(today - MONTH, today);
    }

    function loadLastQuarterGames() {
      var today = Date.now();
      loadGamesBetweenDates(today - QUARTER, today);
    }

    function loadLastYearGames() {
      var today = Date.now();
      loadGamesBetweenDates(today - YEAR, today);
    }

    function loadAllTimeGames() {
      vm.displayGames.fromDate = new Date(2000, 9, 1).getDate();
      vm.displayGames.toDate = Date.now();
      vm.filter.gamesCount = vm.filterOptions.gamesCount[1];
      vm.loadGames();
    }

    function statsAvgBuyin() {
      return utils.avgsCalc(vm.displayGames.players, 'buyin');
    }

    function statsAvgBuyout() {
      return utils.avgsCalc(vm.displayGames.players, 'buyout');
    }

    function statsAvgGameCount() {
      return utils.avgsCalc(vm.displayGames.players, 'gamesCount');
    }

    function statsAvgWinnings() {
      var i, sum = 0;
      for (i = 0; i < vm.displayGames.players.length; ++i) {
        sum += vm.displayGames.players[i].buyout - vm.displayGames.players[i].buyin;
      }
      return sum;
    }

    function statsAvgWinningsPerGame() {
      var i, sum = 0;
      for (i = 0; i < vm.displayGames.players.length; ++i) {
        sum += (vm.displayGames.players[i].buyout - vm.displayGames.players[i].buyin) / vm.displayGames.players[i].gamesCount;
      }
      return sum / vm.displayGames.players.length;
    }

    function gamesCount() {
      vm.totalGames = utils.maxCalc(vm.displayGames.players, 'gamesCount');
      return vm.totalGames;
    }

    function filterPlayers() {
      vm.displayGames.filtered = vm.displayGames.players.filter(function (player) {
        return player.gamesCount > Math.floor(vm.filter.gamesCount * vm.totalGames);
      });
    }

    function playerPredicate(player) {
      return new RegExp(vm.filter.name, 'gi').test(player.name) && player.gamesCount > Math.floor(vm.filter.gamesCount * vm.totalGames);
    }

    function openPlayerDetailsDialog(player) {
      playerModal.open(player)
        .then(function (savedPlayer) {
          /*
           * Update the local instance if the player with the changeable fields from the modal
           */
          player.name = savedPlayer.name;
          player.phone = savedPlayer.phone;
          player.email = savedPlayer.email;

          return Players.update(savedPlayer).$promise;
        });
    }
  }
}());
