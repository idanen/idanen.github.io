(function () {
	'use strict';

/**
 * Login controller
 */
angular.module( 'pokerManager' ).
	controller( 'LoginCtrl', LoginController );

LoginController.$inject = [ '$scope', 'userService', 'Players', 'Ref', '$firebaseObject', 'jrgGoogleAuth' ];

function LoginController( $scope, userService, Players, Ref, jrgGoogleAuth ) {
	var vm = this,
        userPlayer;

	vm.signIn = signIn;
	vm.signOut = signOut;
	vm.user = null;

	function signIn(provider) {
        userService.login(provider)
            .then(obtainedUserInfo)
            .catch(failedToLogin);
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

	function loggedIn( userInfo ) {
        console.log(userInfo);
		Auth.save().then(obtainedUserInfo);
	}

	function failedToLogin( authError ) {
        console.log(authError);
	}

	function obtainedUserInfo( user ) {
		var player = {
                name: user[user.provider].displayName,
                email: user[user.provider].email,
                imageUrl: user[user.provider].profileImageURL
            },
            extendedUser = angular.extend({}, user, player);
		console.log(user);
		// Save user as a player
		Ref.child('player').child(user.uid).set(player, function () {
            $scope.$apply(function () {
                vm.user = extendedUser;
            });
		});
	}

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
