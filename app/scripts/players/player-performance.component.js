(function () {
  'use strict';

  angular.module('pokerManager')
    .component('playerPerformance', {
      controller: PlayerPerformanceController,
      bindings: {
        player: '<',
        games: '<'
      },
      templateUrl: 'scripts/players/player-performance.view.html'
    });

  PlayerPerformanceController.$inject = ['$element', '$filter', '$timeout', '$q'];
  function PlayerPerformanceController($element, $filter, $timeout, $q) {
    this.$element = $element;
    this.$filter = $filter;
    this.$timeout = $timeout;
    this.$q = $q;

    this.loading = false;
    this.playerGamesCount = 0;
    this.chartData = {
      dates: [],
      profits: [],
      balances: []
    };
  }

  PlayerPerformanceController.prototype = {
    $onInit() {
      this.chartHolder = this.$element.find('.chart-holder');
    },

    $onChanges: function (changes) {
      if (changes && changes.games && changes.games.currentValue !== changes.games.previousValue) {
        let gamesPromise = this.$q.resolve();
        if (this.games && _.isFunction(this.games.$loaded)) {
          gamesPromise = this.games.$loaded();
        }
        gamesPromise
          .then(() => {
            this.filteredGames = this.games;
            this.chartData = {
              dates: [],
              profits: [],
              balances: []
            };
            this.dataForChart();
            this.refreshData();
            this.$timeout(this.renderChart.bind(this), 0, false);
          });
      }
    },

    $destroy: function () {
      if (this.chartHolder) {
        this.chartHolder.highcharts().destroy();
      }
    },

    _filterGames(communityId) {
      this.filteredGames = this.games.filter(game => game.communityId === communityId);
    },

    renderChart: function () {
      const chart = this.chartHolder.highcharts();
      if (chart) {
        chart.destroy();
      }

      let chartObj = this.createChartObject();
      if (chartObj) {
        this.chartHolder.highcharts(chartObj);
      }
    },

    dataForChart: function () {
      if (this.filteredGames) {
        this.playerGamesCount = this.filteredGames.length;
        this.chartData = this.filteredGames.reduce((chartData, gameResult) => {
          let profit,
              sum = chartData.balances[chartData.balances.length - 1] || 0;
          if (!isNaN(gameResult.date)) {
            chartData.dates.push(this.$filter('date')(gameResult.date, 'y-MM-dd'));
          } else {
            chartData.dates.push(gameResult.date);
          }
          profit = gameResult.buyout - gameResult.buyin;
          sum += profit;
          gameResult.balance = sum;
          chartData.profits.push(profit);
          chartData.balances.push(sum);

          return chartData;
        }, {
          dates: [],
          profits: [],
          balances: []
        });
      }
    },

    winningSessions: function () {
      if (this.filteredGames) {
        return _.reduce(this.filteredGames, function (count, game) {
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

    createChartObject: function () {
      if (!this.chartData) {
        return;
      }
      return {
        chart: {},
        title: {
          text: this.player.displayName + '\'s performance'
        },
        xAxis: {
          categories: this.chartData.dates
        },
        tooltip: {
          formatter: function () {
            var s;
            // the pie chart
            if (this.point.name) {
              s = String(this.point.name) + ': ' + this.y + ' fruits';
            } else {
              s = String(this.x) + ': ' + this.y;
            }
            return s;
          }
        },
        series: [
          {
            type: 'column',
            name: this.player.displayName,
            data: this.chartData.profits
          },
          {
            type: 'spline',
            name: 'Balance',
            data: this.chartData.balances,
            marker: {
              lineWidth: 2,
              lineColor: '#90ed7d',
              fillColor: 'white'
            }
          }
        ]
      };
    },

    refreshData: function () {
      // Calculate extra data
      this.playerWinningSessions = this.winningSessions(this.player);
      this.playerAvgWinning = this.avgWinning(this.player, true);
    }
  };
}());

