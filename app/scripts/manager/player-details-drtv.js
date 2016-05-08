(function () {
  'use strict';

  /**
   * The managed game's directive
   */
  angular.module('pokerManager')
    .directive('playerDetails', playerDetailsDirective);

  playerDetailsDirective.$inject = ['$timeout'];

  function playerDetailsDirective($timeout) {
    return {
      restrict: 'AE',
      scope: {
        player: '='
      },
      controller: 'PlayerDetailsCtrl',
      controllerAs: 'pCtrl',
      bindToController: true,
      templateUrl: 'partials/tmpls/player-details-tmpl.html',
      link: postLinkFn
    };

    function postLinkFn(scope, element, attrs, ctrl) {
      var chartData = ctrl.chartData,
          chartHolder = angular.element('<div/>'),
          chartObj,
          refreshBtn = element.find('.refresh-data-btn'),
          chart;

      function refreshData() {
        chartData = ctrl.chartData;

        chart = chartHolder.highcharts();
        if (chart) {
          chart.destroy();
        }

        updateChartData(chartObj, chartData);

        // Defer the chart build so that it could take the parent's width (the parent is hidden until $digest will be done to update the ng-show)
        $timeout(function () {
          chartHolder.highcharts(chartObj);
        }, 0, false);
      }

      // Create a placeholder for the chart
      refreshBtn.after(chartHolder);
      chartHolder.attr('id', 'player-chart');

      // Construct chart once the controller finished getting and processing the data
      ctrl.ready.then(function () {
        chartData = ctrl.chartData;
        chartObj = createChartObject(ctrl.player.name, chartData);
        chartHolder.highcharts(chartObj);
      });

      refreshBtn.on('click', refreshData);

      element.on('$destroy', function () {
        if (chartHolder) {
          chartHolder.highcharts().destroy();
          chartHolder.remove();
        }
        refreshBtn.off();
      });
    }

    function createChartObject(playerName, chartData) {
      return {
        chart: {},
        title: {
          text: playerName + '\'s performance'
        },
        xAxis: {
          categories: chartData.dates
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
            name: playerName,
            data: chartData.profits
          },
          {
            type: 'spline',
            name: 'Balance',
            data: chartData.balances,
            marker: {
              lineWidth: 2,
              lineColor: Highcharts.getOptions().colors[3],
              fillColor: 'white'
            }
          }
        ]
      };
    }

    function updateChartData(chartObj, newData) {
      chartObj.xAxis.categories = newData.dates;
      chartObj.series[0].data = newData.profits;
      chartObj.series[1].data = newData.balances;
    }
  }
}());
