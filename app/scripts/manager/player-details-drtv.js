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
        playerId: '<?',
        onChanges: '&'
      },
      controller: 'PlayerDetailsCtrl',
      controllerAs: 'pCtrl',
      bindToController: true,
      templateUrl: 'partials/tmpls/player-details-tmpl.html',
      link: postLinkFn
    };

    function postLinkFn($scope, $element, $attrs, $ctrl) {
      const chartHolder = angular.element('<div/>'),
          refreshBtn = $element.find('.refresh-data-btn');
      let chartObj;

      // Save changes on blur
      $element.find('form').on('blur', '.form-control', () => $ctrl.onUserChanges());

      // Create a placeholder for the chart
      refreshBtn.after(chartHolder);
      chartHolder.attr('id', 'player-chart');

      // Construct chart once the controller finished getting and processing the data
      $ctrl.ready.then(function () {
        chartObj = $ctrl.createChartObject();
        // Defer the chart build so that it could take the parent's width (the parent is hidden until $digest will be done to update the ng-show)
        $timeout(renderChart, 0, false);
      });

      refreshBtn.on('click', () => {
        chartObj = $ctrl.createChartObject();
      });

      $element.on('$destroy', function () {
        if (chartHolder) {
          chartHolder.highcharts().destroy();
          chartHolder.remove();
        }
        refreshBtn.off();
      });

      function renderChart() {
        const chart = chartHolder.highcharts();
        if (chart) {
          chart.destroy();
        }

        chartObj = $ctrl.createChartObject();
        if (chartObj) {
          chartHolder.highcharts(chartObj);
        }
      }
    }
  }
}());
