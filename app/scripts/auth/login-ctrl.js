/**
 * Login controller
 */
angular.module( 'pokerManager' ).
	controller( 'LoginCtrl', [ '$analytics', 'Auth', '$scope', 'jrgGoogleAuth', 'Utils',
		function ( $analytics, Auth, $scope, jrgGoogleAuth, utils ) {
			'use strict';

			var vm = this;

			vm.signIn = signIn;
			vm.getUserInfo = getUserInfo;
			vm.authReponse = {};
			vm.user = {};

			function signIn() {
				//$auth.authenticate( 'google' )
				//	.then( function authSuccess( data ) {
				//		console.log( 'Successful login: ', data );
				//	} )
				//	.catch( function authFailed( error ) {
				//		console.error( 'Authentication failure', error );
				//	} );
			}

			function getUserInfo() {
				jrgGoogleAuth.getProfile().then( function ( userInfo ) {
					console.log( 'Successfully fetched user data: ', userInfo );
				} );
			}

			$scope.$on( 'event:google-plus-signin-success', function googleLoginSuccess( event, data ) {
				console.log( 'Successful login: ', data );
				jrgGoogleAuth.loggedIn( data ).then( function ( userInfo ) {
					console.log( 'Successfully fetched user data: ', userInfo );
					var tokenToSave = {
						authToken: data.access_token,
						tokenSourceId: 1,
						player: {
							name: userInfo.displayName,
							email: userInfo.emails[0].value,
							id: 0
						}
					};
					Auth.save(tokenToSave, function ( savedToken ) {
						utils.saveToken( savedToken.authToken );
					} );
				} );
			} );

			$scope.$on( 'event:google-plus-signin-failure', function googleLoginFailure( event, data ) {
				console.error( 'Authentication failure', data );
			} );
	} ] );