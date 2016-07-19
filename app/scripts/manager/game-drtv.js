(function () {
  'use strict';

  /**
   * The managed game's directive
   */
  angular.module('pokerManager')
    .directive('onGoingGame', gameDirective);

  function gameDirective() {
    return {
      restrict: 'EA',
      scope: {
        gameId: '<',
        saveSuccessCallback: '=?',
        saveFailCallback: '=?'
      },
      controller: 'GameCtrl',
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'partials/tmpls/on-going-game-tmpl.html'
    };
  }
}());
