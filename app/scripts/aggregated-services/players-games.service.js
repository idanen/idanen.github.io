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
      var promises = [];

      promises.push(
        this.gamesRef
          .child(gameId)
          .child('players')
          .child(playerId)
          .remove()
      );
      promises.push(
        this.playersRef
          .child(playerId)
          .child('games')
          .child(gameId)
          .remove()
      );

      return this.$q.all(promises)
        .then(() => this.getPlayersInGame(gameId));
    },
    removeAllPlayersFromGame: function (gameId) {
      return this.gamesRef
          .child(gameId)
          .child('players')
          .once('value')
            .then(snap => {
              return Object.keys(snap.val());
            })
            .then(playersIds => {
              let promises = [];
              playersIds.forEach(playerId => {
                promises.push(
                  this.removePlayerFromGame(playerId, gameId)
                );
              });
              return this.$q.all(promises);
            });
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
        .then(() => this.getPlayersInGame(game.$id));
    },
    updatePlayerResult: function (player, game, gameResult) {
      let promises = [],
          dollarStripped = _.omitBy(gameResult, (val, key) => (/^\$/).test(key));

      promises.push(
        this.playersRef
          .child(player.$id)
          .child('games')
          .child(game.$id)
          .update(dollarStripped)
      );
      promises.push(
        this.gamesRef
          .child(game.$id)
          .child('players')
          .child(player.$id)
          .update(dollarStripped)
      );

      return this.$q.all(promises)
        .then(() => this.getPlayersInGame(game.$id));
    },
    moveResultsToAnotherPlayer: function (sourcePlayerId, targetPlayer) {
      return this.playersRef
        .child(sourcePlayerId)
        .child('games')
        .once('value')
        .then(snap => {
          let promises = [];
          snap.forEach(gameSnap => {
            let gameResult = gameSnap.val();
            if (targetPlayer.name) {
              gameResult.name = targetPlayer.name;
            }
            if (targetPlayer.displayName) {
              gameResult.displayName = targetPlayer.displayName;
            }
            // Delete source player from game
            promises.push(
              this.gamesRef.child(`${gameSnap.key}/players/${sourcePlayerId}`).remove()
            );
            // Delete game from source player
            promises.push(
              this.playersRef.child(`${sourcePlayerId}/games/${gameSnap.key}`).remove()
            );
            // Add target player to game
            promises.push(
              this.gamesRef.child(`${gameSnap.key}/players/${targetPlayer.$id}`).set(gameResult)
            );
            // and add the game to the target player
            promises.push(
              this.playersRef.child(`${targetPlayer.$id}/games/${gameSnap.key}`).set(gameResult)
            );
          });

          return this.$q.all(promises);
        });
    }
  };
}());
