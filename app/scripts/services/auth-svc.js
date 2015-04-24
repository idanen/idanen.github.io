/**
 * Players services
 */
angular.module( 'pokerManager.services' ).
	provider( 'Auth', function authProvider() {
		'use strict';

		var baseUrl = '',
			self = this;

		self.token = null;
		self.setBaseUrl = function ( aBaseUrl ) {
			baseUrl = aBaseUrl;
		};

		self.$get = [ '$resource', 'Utils', function ( $resource, utils ) {
			var service = $resource( baseUrl + 'api', {}, {
					'update': {method: 'PUT'}
				}),
				_save = service.save;

			service.save = function ( toSave, successCallback, failureCallback ) {
				return _save( toSave, function ( savedToken ) {
					utils.saveToken( savedToken.authToken );
					savedToken.player.authToken = savedToken.authToken;
					self.token = savedToken;

					if ( successCallback ) {
						successCallback( self.token.player );
					}
				}, failureCallback );
			};

			service.getUser = function () {
				return self.token.player;
			};

			service.getToken = function () {
				return self.token;
			};

			return service;
		} ];
	} );