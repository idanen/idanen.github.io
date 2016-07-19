(function () {
  'use strict';

  angular.module('pokerManager')
    .service('playersGames', PlayersGamesService);

  PlayersGamesService.$inject = ['Ref', '$q', '$firebaseArray'];
  function PlayersGamesService(Ref, $q, $firebaseArray) {
    this.playersRef = Ref.child('players');
    this.gamesRef = Ref.child('games');
    this.$q = $q;
    this.$firebaseArray = $firebaseArray;
  }

  PlayersGamesService.prototype = {
    getPlayersInGame: function (gameId) {
      return this.$firebaseArray(
        this.gamesRef
          .child(gameId)
          .child('players')
      );
    },
    removePlayerFromGame: function (playerId, gameId) {
      return this.gamesRef
        .child(gameId)
        .child('players')
        .child(playerId)
        .remove()
        .then(function () {
          return this.getPlayersInGame(gameId);
        }.bind(this));
    },
    removeAllPlayersFromGame: function (gameId) {
      return this.gamesRef
        .child(gameId)
        .child('players')
        .remove();
    },
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
      gameResult.location = game.location;

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

      return this.$q.all(promises)
        .then(function () {
          return this.getPlayersInGame(game.$id);
        }.bind(this));
    },
    updatePlayerResult: function (player, game, gameResult) {
      var promises = [];

      promises.push(
        this.playersRef
          .child(player.$id)
          .child('games')
          .child(game.$id)
          .update(gameResult)
      );
      promises.push(
        this.gamesRef
          .child(game.$id)
          .child('players')
          .child(player.$id)
          .update(gameResult)
      );

      return this.$q.all(promises)
        .then(function () {
          return this.getPlayersInGame(game.$id);
        }.bind(this));
    }
  };
}());
