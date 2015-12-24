(function () {
  'use strict';

  angular
    .module('pokerManager')
    .service('playerModal', PlayerModal);

  PlayerModal.$inject = ['$uibModal', 'Players'];
  function PlayerModal($modal, Players) {
    this.$modal = $modal;
    this.Players = Players;
  }

  PlayerModal.prototype = {
    open: function (player) {
      var isNew = typeof player === 'undefined' || player === null,
          modalInstance;

      if (isNew) {
        player = this.Players.create();
      }
      modalInstance = this.$modal.open({
        templateUrl: './partials/modals/addNewPlayer.html',
        controller: 'ModalPlayerDetailsCtrl',
        controllerAs: 'modalCtrl',
        bindToController: true,
        resolve: {
          player: function () {
            return player;
          }
        }
      });

      return modalInstance.result;
    }
  };
}());
