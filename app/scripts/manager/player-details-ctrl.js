(function () {
  'use strict';

  /**
   * Player Modal's controller
   */
  angular.module('pokerManager')
    .controller('ModalPlayerDetailsCtrl', ModalPlayerDetailsController);

  ModalPlayerDetailsController.$inject = ['$uibModalInstance', '$stateParams', 'player', 'Players', 'communitiesSvc'];

  function ModalPlayerDetailsController($uibModalInstance, $stateParams, player, playersSvc, communitiesSvc) {
    var vm = this;
    vm.player = player;

    this.$uibModalInstance = $uibModalInstance;
    this.community = communitiesSvc.getCommunity($stateParams.communityId);
    this.playersSvc = playersSvc;
  }

  ModalPlayerDetailsController.prototype = {
    ok: function () {
      return this.playersSvc.save(this.player)
        .then(() => this.closeDialog());
    },

    closeDialog: function () {
      this.$uibModalInstance.close(this.player);
    },

    cancel: function () {
      this.$uibModalInstance.dismiss('cancel');
    },

    playerChanged: function (changedPlayer) {
      this.player = changedPlayer;
    }
  };
}());
