(function () {
/**
 * Player Modal's controller
 */
angular.module( 'pokerManager' ).
	controller( 'ModalPlayerDetailsCtrl', modalPlayerDetailsController ).
	controller( 'PlayerDetailsCtrl', playerDetailsController );

	modalPlayerDetailsController.$inject = [ '$scope', '$http', '$modalInstance', 'player' ];

	function modalPlayerDetailsController( $scope, $http, $modalInstance, player ) {
		'use strict';

		$scope.player = player;

		$scope.ok = function() {
			$modalInstance.close($scope.player);
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	}

	playerDetailsController.$inject = [ '$scope', 'Utils' ];

	function playerDetailsController( $scope, utils ) {
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
	}
})();
