(function () {
	'use strict';
/**
 * Games services
 */
angular.module( 'pokerManager.services' ).
	provider( 'Games', GamesProvider );

	function GamesProvider() {

		var baseUrl = '';

		this.setBaseUrl = function ( aBaseUrl ) {
			baseUrl = aBaseUrl;
		};

		this.$get = GamesService;

		GamesService.$inject = [ '$resource', '$filter', 'Ref', '$firebaseObject' ];

		function GamesService( $resource, $filter, Ref, $firebaseObject ) {
			var gamesRef = Ref.child('communities').child('games');
			var Resource = $resource( baseUrl + 'games/:gameId', {gameId: '@id'}, {
				'update': {method: 'PUT'},
				'getPlayers': {
					method: 'GET',
					url: baseUrl + 'games/:gameId/players',
					params: {gameId: '@id'},
					isArray: true
				},
				'players': {
					method: 'GET',
					url: baseUrl + 'players/games',
					params: {fromDate: '2000-01-01', toDate: '2200-12-31'},
					isArray: true
				}
			} );

			Resource.create = function () {
				return angular.element.extend( new Resource(), {
					location: '',
					date: $filter( 'date' )( new Date(), 'y-MM-dd' ),
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
		}
	}
})();
