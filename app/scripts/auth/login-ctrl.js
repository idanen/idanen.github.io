/**
 * Login controller
 */
angular.module( 'pokerManager' ).
	controller( 'LoginCtrl', [ '$analytics', '$auth', '$scope', 'jrgGoogleAuth',
		function ( $analytics, $auth, $scope, jrgGoogleAuth ) {
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
				} );
			} );

			$scope.$on( 'event:google-plus-signin-failure', function googleLoginFailure( event, data ) {
				console.error( 'Authentication failure', data );
			} );
	} ] );