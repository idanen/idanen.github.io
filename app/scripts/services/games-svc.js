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

		GamesService.$inject = [ '$resource', '$filter', '$q', 'Ref', '$firebaseObject', '$firebaseArray' ];

		function GamesService( $resource, $filter, $q, Ref, $firebaseObject, $firebaseArray ) {
			var service = {
					newGame: newGame,
					findBy: findBy,
					findBetweenDates: findBetweenDates
				},
				games = $firebaseArray(Ref.child('games'));

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

			function newGame(communityId) {
				var gameToSave = {
					location: '',
					date: Date.now(),
					numberOfHands: 0,
					chipValue: 4,
					defaultBuyin: 50,
					communityId: communityId,
					players: {}
				};

				return games.$add(gameToSave)
					.then(function (gameRef) {
						var gameId = gameRef.key();
						return games[games.$indexFor(gameId)];
					});
			}

			function findBy( field, value ) {
				return $q( function ( resolve ) {
					games.$ref()
						.orderByChild( field )
						.equalTo( value )
						.once( 'value', function ( querySnapshot ) {
							var games = [];
							if ( querySnapshot.hasChildren() ) {
								querySnapshot.forEach( function ( gameSnap ) {
									var game = gameSnap.val();
									game.$id = gameSnap.key();
									games.push( game );
								} );
								resolve( games );
							} else {
								resolve( [] );
							}
						} );
				} );
			}

			function findBetweenDates( from, to, communityId ) {
				return $q( function ( resolve ) {
					games.$ref()
						.orderByChild('date')
						.startAt(parseInt(from, 10))
						.endAt(parseInt(to, 10))
						.once( 'value', function ( querySnapshot ) {
							var games = [];
							if ( querySnapshot.hasChildren() ) {
								querySnapshot.forEach( function ( gameSnap ) {
									var game = gameSnap.val();
									if (game.communityId === communityId) {
										game.$id = gameSnap.key();
										game.players = gameSnap.child('players').val();
										games.push(game);
									}
								} );
								resolve( games );
							} else {
								resolve( [] );
							}
						} );
				} );
			}

			return service;
		}
	}
})();
