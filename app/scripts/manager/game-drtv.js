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
        onGameUpdate: '&',
        onGameStart: '&'
      },
      controller: 'GameCtrl',
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'partials/tmpls/on-going-game-tmpl.html'
    };
  }
}());
