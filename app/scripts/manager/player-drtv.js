/**
 * A playing player's directive
 */
angular.module( 'pokerManager' ).
	directive( 'playerCard', [ function () {
		'use strict';

		return {
			restrict: 'E',
			scope: {
				player: '='
			},
			templateUrl: 'partials/tmpls/player-card-tmpl.html',
			replace: 'true',
			require: '^onGoingGame',
			link: {
				pre: function ( scope, element, attrs, gameCtrl ) {
					scope.gameCtrl = gameCtrl;
				}
			}
		};
	} ] );