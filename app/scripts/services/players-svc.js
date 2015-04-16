/**
 * Players services
 */
angular.module( 'pokerManager.services' ).
	provider( 'Players', function playersProvider() {
		'use strict';

		var baseUrl = '';

		this.setBaseUrl = function ( aBaseUrl ) {
			baseUrl = aBaseUrl;
		};

		this.$get = [ '$resource', '$filter', 'BASE_URL', function ( $resource, $filter, BASE_URL ) {
			var Resource = $resource( baseUrl + 'players/:playerId', {playerId: '@id'}, {
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
		} ];
	} );