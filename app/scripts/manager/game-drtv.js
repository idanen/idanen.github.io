(function () {
/**
 * The managed game's directive
 */
angular.module( 'pokerManager' ).
	directive( 'onGoingGame', gameDirective );

	function gameDirective() {
		'use strict';

		return {
			restrict: 'EA',
			scope: {
				game: '=',
				saveSuccessCallback: '=?',
				saveFailCallback: '=?'
			},
			controller: 'GameCtrl',
			controllerAs: 'vm',
			bindToController: true,
			templateUrl: 'partials/tmpls/on-going-game-tmpl.html',
			link: {
				pre: function ( scope, element, attrs ) {
					// scope.game = scope.$eval( attrs.onGoingGame );
				}
			}
		};
	}
})();
