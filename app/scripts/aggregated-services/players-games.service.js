(function () {
  'use strict';

  angular.module('pokerManager')
    .service('playersGames', PlayersGamesService);

  PlayersGamesService.$inject = ['Ref', '$q', '$firebaseArray', '$firebaseUtils'];
  function PlayersGamesService(Ref, $q, $firebaseArray, $firebaseUtils) {
    this.rootRef = Ref;
    this.playersRef = Ref.child('players');
    this.gamesRef = Ref.child('games');
    this.$q = $q;
    this.$firebaseArray = $firebaseArray;
    this.$firebaseUtils = $firebaseUtils;
  }

  PlayersGamesService.prototype = {
    getPlayersInGame: function (gameId) {
      return this.$firebaseArray(
        this.gamesRef
          .child(gameId)
          .child('players')
      );
    },
    getGamesOfPlayer: function (playerId) {
      return this.$firebaseArray(
        this.playersRef
          .child(playerId)
          .child('games')
      );
    },
    removePlayerFromGame: function (playerId, gameId) {
      var updateRefs = {};

      updateRefs[`players/${playerId}/games/${gameId}`] = null;
      updateRefs[`games/${gameId}/players/${playerId}`] = null;

      return this.$q.resolve(this.rootRef.update(updateRefs))
        .then(() => this.getPlayersInGame(gameId));
    },
    removeAllPlayersFromGame: function (gameId) {
      let updateRefs = {};

      updateRefs[`games/${gameId}/players`] = null;
      return this.gamesRef
          .child(gameId)
          .child('players')
          .once('value')
            .then(snap => {
              snap.forEach(playerSnap => {
                updateRefs[`players/${playerSnap.key}/games/${gameId}`] = null;
              });
            })
            .then(() => {
              return this.$q.resolve(this.rootRef.update(updateRefs));
            });
    },
    addPlayerToGame: function (player, game) {
      var gameResult = {},
          updateRefs = {};

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

      updateRefs[`players/${player.$id}/games/${game.$id}`] = gameResult;
      updateRefs[`games/${game.$id}/players/${player.$id}`] = gameResult;

      return this.$q.resolve(this.rootRef.update(updateRefs))
        .then(() => this.getPlayersInGame(game.$id));
    },
    updatePlayerResult: function (player, game, gameResult) {
      let updateRefs = {},
          dollarStripped = _.omit(gameResult, (val, key) => (/^\$/).test(key));

      updateRefs[`players/${player.$id}/games/${game.$id}`] = dollarStripped;
      updateRefs[`games/${game.$id}/players/${player.$id}`] = dollarStripped;

      return this.$q.resolve(this.rootRef.update(updateRefs))
        .then(() => this.getPlayersInGame(game.$id));
    },
    moveResultsToAnotherPlayer: function (fromPlayerId, toPlayer) {
      let updateRefs = {};

      return this.playersRef
        .child(fromPlayerId)
        .child('games')
        .once('value')
        .then(snap => {
          snap.forEach(gameSnap => {
            let gameResult = gameSnap.val();
            gameResult.name = toPlayer.name;
            // Delete previous player from game
            updateRefs[`games/${gameSnap.key}/players/${fromPlayerId}`] = null;
            // Add new player to game
            updateRefs[`games/${gameSnap.key}/players/${toPlayer.$id}`] = gameResult;
            // and add the game to the player
            updateRefs[`players/${toPlayer.$id}/games/${gameSnap.key}`] = gameResult;
          });
        })
        .then(() => this.$q.resolve(this.rootRef.update(updateRefs)));
    }
  };
}());
