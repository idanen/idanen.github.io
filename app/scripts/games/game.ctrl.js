(function () {
  angular.module('pokerManager')
    .controller('GameRouteCtrl', GameController);

  GameController.$inject = ['game'];
  function GameController(game) {
    this.game = game;
  }
}());
