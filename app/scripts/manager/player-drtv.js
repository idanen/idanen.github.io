(function () {
  'use strict';

  /**
   * A playing player's directive
   */
  angular.module('pokerManager')
    .directive('playerCard', playerCardDirective);

  function playerCardDirective() {
    return {
      restrict: 'E',
      scope: {
        player: '<',
        onUpdate: '&'
      },
      templateUrl: 'partials/tmpls/player-card-tmpl.html',
      require: '^onGoingGame',
      link: {
        pre: function (scope, element, attrs, gameCtrl) {
          scope.gameCtrl = gameCtrl;
        }
      }
    };
  }
}());
