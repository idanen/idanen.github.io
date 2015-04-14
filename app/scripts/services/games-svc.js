/**
 * Games services
 */
angular.module( 'pokerManager.services' ).
	factory( 'Games', [ '$resource', 'BASE_URL', function ( $resource, BASE_URL ) {
		'use strict';

		var Resource = $resource( BASE_URL.PROD + 'games/:gameId', {gameId: '@id'}, {
			'update': {method: 'PUT'},
			'getPlayers': {
				method: 'GET',
				url: BASE_URL.PROD + 'games/:gameId/players',
				params: {gameId: '@id'},
				isArray: true
			},
			'players': {
				method: 'GET',
				url: BASE_URL.PROD + 'players/games',
				params: {fromDate: '2000-01-01', toDate: '2200-12-31'},
				isArray: true
			}
		} );

		Resource.create = function () {
			return angular.element.extend( new Resource(), {
				location: '',
				date: new Date(),
				numberOfHands: 0,
				players: [],
				settings: {
					chipValue: 4,
					maxBuyin: 250,
					defaultBuyin: 50
				}
			} );
		};

		return Resource;
	} ] );