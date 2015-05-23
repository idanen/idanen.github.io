(function () {
	'use strict';
/**
 * Players services
 */
angular.module( 'pokerManager.services' ).
	provider( 'Players',  PlayersProvider);

	function PlayersProvider() {

		var baseUrl = '',
			self = this;

		self.setBaseUrl = function ( aBaseUrl ) {
			baseUrl = aBaseUrl;
		};

		self.players = [];

		self.$get = PlayersService;

		PlayersService.$inject = [ '$resource', '$filter' ];

		function PlayersService( $resource, $filter ) {
			var Resource = $resource( baseUrl + 'players/:playerId', {playerId: '@id'}, {
					'update': {method: 'PUT'}
				}),
				_query = Resource.query;

			Resource.query = function ( successCallback, errorCallback ) {
				return _query( function ( players ) {
					self.players = players;
					if ( successCallback ) {
						successCallback( players );
					}
				}, errorCallback );
			};
			self.players = Resource.query();

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

			Resource.fetchedPlayers = function () {
				return self.players;
			};

			return Resource;
		}
	}
})();
