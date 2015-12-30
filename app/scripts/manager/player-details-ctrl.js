(function () {
  'use strict';

  /**
   * Player Modal's controller
   */
  angular.module('pokerManager').
    controller('ModalPlayerDetailsCtrl', modalPlayerDetailsController).
    controller('PlayerDetailsCtrl', playerDetailsController);

  modalPlayerDetailsController.$inject = ['$uibModalInstance', 'player'];

  function modalPlayerDetailsController($uibModalInstance, player) {
    var vm = this;
    vm.player = player;

    vm.ok = function () {
      $uibModalInstance.close(vm.player);
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }

  playerDetailsController.$inject = [];
  function playerDetailsController() {
    this.loading = true;

    this.isAdmin = function () {
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
