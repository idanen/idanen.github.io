(function () {
  'use strict';

  angular
    .module('pokerManager')
    .service('playerModal', PlayerModal);

  PlayerModal.$inject = ['$uibModal', 'Players', '$rootScope', '$state'];
  function PlayerModal($modal, Players, $rootScope, $state) {
    this.$modal = $modal;
    this.Players = Players;
    this.$rootScope = $rootScope;
    this.$state = $state;
  }

  PlayerModal.prototype = {
    open: function (player) {
      var isNew = !player,
          modalInstance;

      if (isNew) {
        player = this.Players.createPlayer(this.$state.params.communityId);
      }
      modalInstance = this.$modal.open({
        templateUrl: 'partials/modals/addNewPlayer.html',
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
