(function () {
  'use strict';

  angular
    .module('pokerManager')
    .service('playerModal', PlayerModal);

  PlayerModal.$inject = ['$uibModal', 'Players', '$rootScope'];
  function PlayerModal($modal, Players, $rootScope) {
    this.$modal = $modal;
    this.Players = Players;
    this.$rootScope = $rootScope;
  }

  PlayerModal.prototype = {
    open: function (player) {
      var isNew = !player,
          modalInstance, unwatch;

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
      unwatch = this.$rootScope.$on('$stateChangeSuccess', modalInstance.close);
      modalInstance.closed.then(unwatch);

      return modalInstance.result;
    }
  };
}());
