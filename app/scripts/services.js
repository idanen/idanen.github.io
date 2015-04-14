/* Services */

angular.module( 'pokerManager.services', [ 'ngResource' ] ).
	value( 'version', '0.1' ).
	constant( 'BASE_URL', {
		"DEV": "http://localhost:9880/services/",
		"PROD": "http://awesome-sphere-397.appspot.com/services/"
	} ).
	factory( 'Players', [ '$resource', '$filter', 'BASE_URL', function ( $resource, $filter, BASE_URL ) {
		'use strict';

		var Resource = $resource( BASE_URL.PROD + 'players/:playerId', {playerId: '@id'}, {
			'update': {method: 'PUT'}
		} );

		Resource.create = function () {
			return angular.element.extend( new Resource(), {
				name: '',
				balance: 0,
				isPlaying: false,
				buyin: 0,
				currentChipCount: 0,
				email: '',
				phone:'',
				id: 0,
				createDate: $filter( 'date' )( new Date(), 'y-MM-dd' ),
				isNew: true
			} );
		};

		return Resource;
	} ] ).
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
	} ] ).
	service( 'Model', [ '$http', '$rootScope', '$filter', function ( $http, $rootScope, $filter ) {
		'use strict';

		var service = {
				url: 'http://awesome-sphere-397.appspot.com/services/',
				// url: 'http://localhost:9880/services/',
				players: [],
				fetch: function () {
					$http( {
						method: 'GET',
						url: service.url + 'players'
					} ).
						success( function ( data, status, headers, config ) {
							if (data && jQuery.trim(data) !== '') {
								service.players = data;
							} else {
								service.players = [];
							}
							$rootScope.$broadcast( 'players.update', data );
						} ).
						error( function ( data, status, headers, config ) {
						} );
				},
				fetchPlayer: function ( playerId ) {
					$http( {
						method: 'GET',
						url: service.url + 'players/' + playerId
					} ).
						success( function ( data, status, headers, config ) {
							$rootScope.$broadcast( 'player.fetched', data );
						}).
						error( function ( data, status, headers, config ) {
						} );
				},
				savePlayer: function ( playerToSave ) {
					$http( {
						method: 'POST',
						url: service.url + 'players/add',
						data: playerToSave
					} ).
						success( function ( data, status, headers, config ) {
							$rootScope.$broadcast( 'player.saved', data );
						} ).
						error( function ( data, status, headers, config ) {
						} );
				},
				saveGame: function ( gameToSave ) {
					$http( {
						method: 'PUT',
						url: service.url + 'players/game/add',
						data: gameToSave
					} ).
						success( function ( data, status, headers, config ) {
							$rootScope.$broadcast( 'game.saved', data );
						} ).
						error( function ( data, status, headers, config ) {
							$rootScope.$broadcast( 'game.save.error' );
						} );
				},
				loadGames: function ( fromDate, toDate ) {
					var dateFormat = $filter( 'date' );
					$http( {
						method: 'GET',
						url: service.url + 'players/game/get?fromDate=' + encodeURI( dateFormat( fromDate, 'y-MM-dd' ) ) + '&toDate=' + encodeURI( dateFormat( toDate, 'y-MM-dd' ) )
					} ).
						success( function ( data, status, headers, config ) {
							//console.log('returned from server', data);
							$rootScope.$broadcast( 'games.stats.loaded', data );
						} ).
						error( function ( data, status, headers, config ) {
						} );
				},
				heartbeat: function () {
					$http( {
						method: 'OPTIONS',
						url: service.url + 'players'
					} ).
						success( function ( data, status, headers, config ) {
							$rootScope.$broadcast( 'heartbeat.success', {
									"content": data,
									"status": status
								} );
						} ).
						error( function ( data, status, headers, config ) {
							$rootScope.$broadcast( 'heartbeat.error', data );
						} );
				}
			};
		
		return service;
	} ] ).
	service( 'Utils', [ function () {
		'use strict';

		var utils = {
				totalsCalc: function ( anArray, fieldNameToSum ) {
					var sum = 0;
					for( var i = 0; i < anArray.length; ++i ) {
						sum += parseInt( anArray[ i ][ fieldNameToSum ] );
					}
					return sum;
				},
				avgsCalc: function ( anArray, fieldNameToSum ) {
					var sum = 0;
					for( var i = 0; i < anArray.length; ++i ) {
						sum += parseInt( anArray[ i ][ fieldNameToSum ] );
					}
					return ( sum / anArray.length );
				},
				maxCalc: function ( anArray, fieldNameToSum ) {
					var max = 0;
					for( var i = 0; i < anArray.length; ++i ) {
						max = Math.max( anArray[ i ][ fieldNameToSum ], max );
					}
					return max;
				},
				saveLocal: function ( key, content ) {
					if ( angular.isObject( content ) ) {
						localStorage.setItem( key, JSON.stringify( content ) );
					}
				},
				loadLocal: function ( key ) {
					return JSON.parse( localStorage.getItem( key ) );
				}
			};
		
		return utils;
	} ] );
