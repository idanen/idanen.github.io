/**
 * Player Modal's controller
 */
angular.module( 'pokerManager' ).
	controller( 'ModalPlayerDetailsCtrl',
		[ '$scope', '$http', '$modalInstance', 'player',
		function ( $scope, $http, $modalInstance, player ) {
			'use strict';

			$scope.player = player;

			$scope.ok = function() {
				$modalInstance.close($scope.player);
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		} ]
	).
	controller( 'PlayerDetailsCtrl',
		[ '$scope', 'Utils',
		function ( $scope, utils ) {
			'use strict';

			$scope.loading = true;

			$scope.isAdmin = function() {
				//return ( window.location.pathname.indexOf( 'manage.html' ) > -1 );
				return true;
			};
			
			/*
			$scope.isAdmin = function() {
				return $scope.admin;
			};
			*/
		} ]
	);