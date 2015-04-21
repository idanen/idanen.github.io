/**
 * Players services
 */
angular.module( 'pokerManager.services' ).
	provider( 'Auth', function authProvider() {
		'use strict';

		var baseUrl = '';

		this.setBaseUrl = function ( aBaseUrl ) {
			baseUrl = aBaseUrl;
		};

		this.$get = [ '$resource', '$filter', function ( $resource, $filter ) {
			return $resource( baseUrl + 'api', {}, {
				'update': {method: 'PUT'}
			} );
		} ];
	} );