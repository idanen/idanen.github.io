/**
 * Login controller
 */
angular.module( 'pokerManager' ).
	controller( 'LoginCtrl', [ '$analytics', '$auth',
		function ( $analytics, $auth ) {
			'use strict';

			var vm = this;

			vm.signIn = signIn;
			vm.user = {};

			function signIn() {
				$auth.authenticate( vm.user );
			}
	} ] );