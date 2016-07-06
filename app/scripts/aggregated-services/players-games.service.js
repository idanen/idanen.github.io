(function () {
  'use strict';

  angular.module('pokerManager')
    .service('playersGames', PlayersGamesService);

  PlayersGamesService.$inject = ['Ref', '$q'];
  function PlayersGamesService(Ref) {
    this.playersRef = Ref.child('players');
    this.gamesRef = Ref.child('games');
    this.$q = $q;
  }

  PlayersGamesService.prototype = {
    addPlayerToGame: function (player, game) {
      var gameResult = {},
          promises = [];

      player.isPlaying = true;
      gameResult.name = player.name;
      gameResult.isPlaying = true;
      gameResult.buyin = 0;
      gameResult.buyout = 0;
      gameResult.currentChipCount = 0;
      gameResult.communityId = game.communityId;
      gameResult.paidHosting = false;
      gameResult.date = game.date;

      promises.push(
        this.playersRef
          .child(player.$id)
          .child('games')
          .child(game.$id)
          .set(gameResult)
      );
      promises.push(
        this.gamesRef
          .child(game.$id)
          .child('players')
          .child(player.$id)
          .set(gameResult)
      );

      return this.$q.all(promises);
    },
    updatePlayerResult: function (player, game, gameResult) {
      // TODO: implement
    }
  };
}());
