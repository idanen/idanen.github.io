(function () {
	'use strict';
/**
 * Player Modal's controller
 */
angular.module( 'pokerManager' )
	.controller( 'ModalPlayerDetailsCtrl', ModalPlayerDetailsController )
	.controller( 'PlayerDetailsCtrl', PlayerDetailsController );

	ModalPlayerDetailsController.$inject = [ '$scope', '$http', '$uibModalInstance', 'player' ];

	function ModalPlayerDetailsController( $scope, $http, $modalInstance, player ) {
		var vm = this;

		vm.player = player;
		vm.ok = okFn;
		vm.cancel = cancelFn;

		function okFn() {
			$modalInstance.close(vm.player);
		}

		function cancelFn() {
			$modalInstance.dismiss('cancel');
		}
	}

	PlayerDetailsController.$inject = [ 'Utils' ];

	function PlayerDetailsController( utils ) {
		this.loading = true;

		this.isAdmin = function() {
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
