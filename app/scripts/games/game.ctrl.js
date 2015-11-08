(function (app) {
    app
        .controller('GameRouteCtrl', GameController);

    GameController.$inject = ['game'];
    function GameController(game) {
        vm.game = game;
    }
}(angular.module('pokerManager')));
