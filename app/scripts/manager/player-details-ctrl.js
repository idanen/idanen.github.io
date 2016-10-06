(function () {
  'use strict';

  /**
   * Player Modal's controller
   */
  angular.module('pokerManager')
    .controller('ModalPlayerDetailsCtrl', ModalPlayerDetailsController);

  ModalPlayerDetailsController.$inject = ['$uibModalInstance', '$stateParams', 'player', 'playersMembership', 'communitiesSvc'];

  function ModalPlayerDetailsController($uibModalInstance, $stateParams, player, playersMembership, communitiesSvc) {
    var vm = this;
    vm.player = player;

    this.$uibModalInstance = $uibModalInstance;
    this.community = communitiesSvc.getCommunity($stateParams.communityId);
    this.playersMembership = playersMembership;
  }

  ModalPlayerDetailsController.prototype = {
    ok: function () {
      return this.playersMembership.addPlayer(this.player, this.community)
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
