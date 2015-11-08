/* Controllers */
(function () {
	'use strict';
	angular.module( 'pokerManager.controllers', [ 'pokerManager.services' ] )
		.controller( 'MainCtrl', MainController );

	MainController.$inject = [ '$scope', '$location', 'userService' ];
	function MainController( $scope, $location, userService ) {

		var vm = this,
		adminTab = {
			title: "Current Game",
			href: "#/game/0",
			icon: "icon-spades"
		};

		this.tabs = [];

		this.getLocation = function() {
			return $location.path();
		};
		this.setLocation = function( location ) {
			$location.path( location );
		};

		this.isTabSelected = function( tabHref ) {
			var pathRoot = $location.path().split('/')[1],
			tabHrefRoot = tabHref.split('/')[1];
			return ( pathRoot === tabHrefRoot );
		};

		this.isAdmin = function() {
			return ( !!userService.getUser() );
		};

		this.signOut = signOut;

		$scope.$watch( function () {
			return vm.isAdmin();
		}, function ( newVal ) {
			if ( newVal && vm.tabs.indexOf(adminTab) === -1 ) {
				vm.tabs.push( adminTab );
			} else {
				var adminTabIdx = vm.tabs.indexOf( adminTab );
				if ( adminTabIdx > -1 ) {
					vm.tabs.splice( adminTabIdx, 1 );
				}
			}
		} );

		vm.init = function() {
			vm.tabs.push( {
				title: "Stats",
				href: "#/stats",
				icon: "fa-bar-chart"
			} );
			vm.tabs.push( {
				title: 'communities',
				href: '#/communities',
				icon: 'fa-users'
			} );
			if ( vm.isAdmin() ) {
				vm.tabs.push( adminTab );
			}
		};

		function signOut() {
			userService.logout();
			delete vm.currentUser;
		}
	}
}());
