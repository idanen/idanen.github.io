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
    getApprovalsForGame: function (gameId) {
      return this.$firebaseArray(
        this.gamesRef
          .child(gameId)
          .child('attending')
      );
    },
    changePlayerApproval: function ({gameId, playerId, player, attendance = 'maybe', guests = 0, message = ''}) {
      let toSave = _.pick(player, ['displayName', 'photoURL']);

      toSave.attendance = attendance;
      toSave.guests = guests;
      toSave.message = message;
      toSave.approveDate = Date.now();

      return this.$q.resolve(
        this.gamesRef
          .child(gameId)
          .child('attending')
          .child(playerId)
          .set(toSave)
      )
        .then(() => this.getApprovalsForGame(gameId));
    },
    removePlayerFromGame: function (playerId, gameId) {
      let promises = [];

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
      if (!player) {
        return this.$q.reject(new Error('No player to add'));
      }
      if (!game) {
        return this.$q.reject(new Error('No game to add to'));
      }
      return this.addPlayersToGame([player], game);
    },
    addPlayersToGame: function (players, game) {
      let gameUpdates = {},
          playersUpdates = {};

      if (!players) {
        return this.$q.reject(new Error('No players to add'));
      }
      if (!game) {
        return this.$q.reject(new Error('No game to add to'));
      }

      players.forEach(player => {
        let gameResult = {};
        gameResult.displayName = player.displayName;
        gameResult.isPlaying = true;
        gameResult.buyin = 0;
        gameResult.buyout = 0;
        gameResult.currentChipCount = 0;
        gameResult.communityId = game.communityId;
        gameResult.paidHosting = false;
        gameResult.date = game.date;
        gameResult.location = game.location;

        playersUpdates[`${player.$id}/games/${game.$id}`] = gameResult;
        gameUpdates[`${game.$id}/players/${player.$id}`] = gameResult;
      });

      return this.$q.all([
        this.playersRef.update(playersUpdates),
        this.gamesRef.update(gameUpdates)
      ])
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
