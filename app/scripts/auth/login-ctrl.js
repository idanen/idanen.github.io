/**
 * Login controller
 */
angular.module( 'pokerManager' ).
	controller( 'LoginCtrl', [ '$analytics', '$scope', '$location', 'Auth', 'Players', 'jrgGoogleAuth',
		function ( $analytics, $scope, $location, Auth, Players, jrgGoogleAuth ) {
			'use strict';

			var vm = this;

			vm.signIn = signIn;
			vm.signOut = signOut;
			vm.user = {};

			function signIn() {
				jrgGoogleAuth.login().then( successfulLogin );
				//$auth.authenticate( 'google' )
				//	.then( function authSuccess( data ) {
				//		console.log( 'Successful login: ', data );
				//	} )
				//	.catch( function authFailed( error ) {
				//		console.error( 'Authentication failure', error );
				//	} );
			}

			function signOut() {
				jrgGoogleAuth.logout().then( function () {
					Auth.revokeToken().then( function () {
						vm.user = {};
					} );
				} );
			}

			$scope.$on( 'event:google-plus-signin-success', function googleLoginSuccess( event, data ) {
				console.log( 'Successful login: ', data );
				jrgGoogleAuth.loggedIn( data ).then( successfulLogin).catch( failedLogin );
			} );

			$scope.$on( 'event:google-plus-signin-failure', function googleLoginFailure( event, data ) {
				console.error( 'Authentication failure', data );
				Auth.revokeToken().then( function () {
					vm.user = {};
				} );
			} );

			function successfulLogin( userInfo ) {
				console.log( 'Successfully fetched user data: ', userInfo );
				var players = Players.fetchedPlayers(),
					tokenToSave = {
						authToken: userInfo.authToken,
						tokenSourceId: 1
					},
					playerId = 0;

				// Find player's id
				if ( players ) {
					players.some( function ( player ) {
						if ( player.email === userInfo.email ) {
							playerId = player.id;
							return true;
						}
						return false;
					} );
				}

				userInfo.id = playerId;
				tokenToSave.playerId = playerId;
				tokenToSave.player = userInfo;

				Auth.save( tokenToSave, function ( theUser ) {
					vm.user = theUser;
					$location.path( 'view1/0' );
				} );
			}

			function failedLogin( authError ) {
				console.log( authError );
				Auth.revokeToken().then( function () {
					vm.user = {};
				} );
			}
	} ] );