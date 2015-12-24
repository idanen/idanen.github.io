(function () {
  'use strict';

  /**
   * Player Modal's controller
   */
  angular.module('pokerManager').
    controller('ModalPlayerDetailsCtrl', modalPlayerDetailsController).
    controller('PlayerDetailsCtrl', playerDetailsController);

  modalPlayerDetailsController.$inject = ['$scope', '$uibModalInstance', 'player'];

  function modalPlayerDetailsController($scope, $uibModalInstance, player) {
    $scope.player = player;

    $scope.ok = function () {
      $uibModalInstance.close($scope.player);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }

  playerDetailsController.$inject = ['$scope'];
  function playerDetailsController($scope) {
    $scope.loading = true;

    $scope.isAdmin = function () {
      // return ( window.location.pathname.indexOf( 'manage.html' ) > -1 );
      return true;
    };

    /*
     $scope.isAdmin = function() {
     return $scope.admin;
     };
     */
  }
}());
