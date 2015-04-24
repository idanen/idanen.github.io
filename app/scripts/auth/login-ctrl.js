/**
 * Login controller
 */
angular.module( 'pokerManager' ).
	controller( 'LoginCtrl', [ '$analytics', '$scope', 'Auth', 'Players', 'jrgGoogleAuth',
		function ( $analytics, $scope, Auth, Players, jrgGoogleAuth ) {
			'use strict';

			var vm = this;

			vm.signIn = signIn;
			vm.signOut = signOut;
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

			function signOut() {
				jrgGoogleAuth.logout().then( function () {
					// Sending token to server to inform it is no longer in use
					Auth.update( Auth.getToken() );
					// And delete it from local storage
					utils.cleanToken();
				} );
			}

			$scope.$on( 'event:google-plus-signin-success', function googleLoginSuccess( event, data ) {
				console.log( 'Successful login: ', data );
				jrgGoogleAuth.loggedIn( data ).then( successfulLogin );
			} );

			$scope.$on( 'event:google-plus-signin-failure', function googleLoginFailure( event, data ) {
				console.error( 'Authentication failure', data );
			} );

			function successfulLogin( userInfo ) {
				console.log( 'Successfully fetched user data: ', userInfo );
				var players = Players.fetchedPlayers(),
					tokenToSave = {
						authToken: data.access_token,
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
				} );
			}
	} ] );