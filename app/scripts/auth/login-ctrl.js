(function () {
/**
 * Login controller
 */
angular.module( 'pokerManager' ).
	controller( 'LoginCtrl', LoginController );

LoginController.$inject = [ '$analytics', '$scope', 'Auth', 'Players', 'jrgGoogleAuth' ];

function LoginController( $analytics, $scope, Auth, Players, jrgGoogleAuth ) {
	'use strict';

	var vm = this;

	vm.signIn = signIn;
	vm.signOut = signOut;
	vm.user = null;

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
		// TODO(idan): Add analytics event
		jrgGoogleAuth.logout().then( function () {
			Auth.revokeToken().then( function () {
				delete vm.user;
			} );
		} );
	}

	$scope.$on( 'event:google-plus-signin-success', function googleLoginSuccess( event, data ) {
		console.log( 'Successful login: ', data );
		jrgGoogleAuth.loggedIn( data ).then( successfulLogin ).catch( failedLogin );
	} );

	$scope.$on( 'event:google-plus-signin-failure', function googleLoginFailure( event, data ) {
		// TODO(idan): Add analytics event
		console.error( 'Authentication failure', data );
		Auth.revokeToken().then( function () {
			delete vm.user;
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
		} );
	}

	function failedLogin( authError ) {
		console.log( authError );
		Auth.revokeToken().then( function () {
			delete vm.user;
		} );
	}
}
})();
