/**
 * Player Modal's controller
 */
angular.module( 'pokerManager' ).
	controller( 'ModalPlayerDetailsCtrl',
		[ '$scope', '$http', '$modalInstance', 'player', 'Model',
		function ( $scope, $http, $modalInstance, player, Model ) {
		'use strict';

		$scope.player = player;

		$scope.ok = function() {
			$modalInstance.close($scope.player);
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	} ] );