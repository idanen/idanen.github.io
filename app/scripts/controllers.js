/* Controllers */
(function () {
	'use strict';
	angular.module( 'pokerManager.controllers', [ 'pokerManager.services' ] )
		.controller( 'MainCtrl', MainController );

	MainController.$inject = [ '$scope', '$location', 'userService' ];
	function MainController( $scope, $location, userService ) {
		var adminTab = {
			title: "Current Game",
			href: "#/game/0",
			icon: "icon-spades"
		};

		$scope.tabs = [];

		$scope.getLocation = function() {
			return $location.path();
		};
		$scope.setLocation = function( location ) {
			$location.path( location );
		};

		$scope.isTabSelected = function( tabHref ) {
            var pathRoot = $location.path().split('/')[1],
                tabHrefRoot = tabHref.split('/')[1];
			return ( pathRoot === tabHrefRoot );
		};

		$scope.isAdmin = function() {
			return ( !!userService.getUser() );
		};

		$scope.signOut = signOut;

		$scope.$watch( function () {
			return $scope.isAdmin();
		}, function ( newVal ) {
			if ( newVal && $scope.tabs.length < 2 ) {
				$scope.tabs.push( adminTab );
			} else {
				var adminTabIdx = $scope.tabs.indexOf( adminTab );
				if ( adminTabIdx > -1 ) {
					$scope.tabs.splice( adminTabIdx, 1 );
				}
			}
		} );

		$scope.init = function() {
			$scope.tabs.push( {
				title: "Stats",
				href: "#/stats",
				icon: "fa-bar-chart"
			} );
			if ( $scope.isAdmin() ) {
				$scope.tabs.push( adminTab );
			}
		};

		$scope.$on( '$locationChangeStart', function ( ev, from, to ) {
			if ( /login$/i.test( to ) ) {
				$scope.currentUser = userService.getUser();
			}
		} );

		function signOut() {
            userService.logout();
            delete $scope.currentUser;
		}
	}
}());
