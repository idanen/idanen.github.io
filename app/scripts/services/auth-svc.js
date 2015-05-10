(function () {
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

		self.$get = authService;

		authService.$inject = [ '$resource', '$q', 'Utils' ];

		function authService( $resource, $q, utils ) {
			var service = $resource( baseUrl + 'api/:tokenId', {tokenId: '@id'}, {
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

			service.revokeToken = function () {
				var deferred = $q.defer();

				utils.clearToken();
				if ( self.token ) {
					service.update( self.token, function () {
						self.token = null;
						deferred.resolve();
					} );
				} else {
					deferred.resolve();
				}

				return deferred.promise;
			};

			service.getUser = function () {
				return self.token && self.token.player;
			};

			service.getToken = function () {
				return self.token;
			};

			return service;
		}
	} );
})();
