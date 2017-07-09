(function () {
  'use strict';

  /**
   * Games services
   */
  angular.module('pokerManager.services')
    .service('Games', GamesService);

  GamesService.$inject = ['$q', 'Ref', '$firebaseArray', '$firebaseObject'];
  function GamesService($q, Ref, $firebaseArray, $firebaseObject) {
    this.rootRef = Ref;
    this.gamesRef = Ref.child('games');
    this.$q = $q;
    this.$firebaseArray = $firebaseArray;
    this.$firebaseObject = $firebaseObject;
  }

  GamesService.prototype = {
    newGame: function (communityId, gameDefaults) {
      var gameToSave = _.extend({
        location: '',
        date: Date.now(),
        numberOfHands: 0,
        chipValue: 4,
        defaultBuyin: 50,
        communityId: communityId,
        allowedGuests: 0,
        hostingCosts: 10,
        limitPlayers: 100
      }, gameDefaults || {});

      return this.gamesRef
        .push(gameToSave);
    },
    getGame: function (gameId) {
      return this.$firebaseObject(this.gamesRef.child(gameId));
    },

    deleteGame: function (gameId) {
      return this.gamesRef
        .child(gameId)
        .remove();
    },

    findBy: function (field, value, limit) {
      return this.$firebaseArray(
        this.gamesRef
          .orderByChild(field)
          .equalTo(value)
          .limitToLast(limit || 100)
      );
    },

    gamesOfCommunity: function (communityId, limit) {
      return this.findBy('communityId', communityId, limit);
    },

    gamesOfPlayer: function (playerId, limit) {
      return this.$firebaseArray(
        this.gamesRef
          .orderByChild('players/' + playerId)
          .limitToLast(limit || 500)
      );
    },

    gamesByIds: function (gamesIds) {
      let promises = [];
      gamesIds.forEach(gameId => {
        promises.push(
          this.gamesRef.child(gameId).once('value')
            .then(snap => {
              var game = snap.val();
              game.$id = game.id = snap.key;
              return game;
            })
        );
      });
      return this.$q.all(promises);
    },

    chipsValueUpdated: function (game) {
      let updateRefs = {};

      updateRefs[`games/${game.$id}/chipValue`] = game.chipValue;

      if (game.players) {
        _.forEach(game.players, (player, playerId) => {
          var newChipCount = (player.buyout || 0) * game.chipValue;
          updateRefs[`games/${game.$id}/players/${playerId}/currentChipCount`] = newChipCount;
          updateRefs[`players/${playerId}/games/${game.$id}/currentChipCount`] = newChipCount;
        });
      }

      return this.$q.resolve(this.rootRef.update(updateRefs));
    },

    dateUpdated: function (game) {
      let updateRefs = {};

      updateRefs[`games/${game.$id}/date`] = game.date;

      if (game.players) {
        _.forEach(game.players, (player, playerId) => {
          updateRefs[`games/${game.$id}/players/${playerId}/date`] = game.date;
          updateRefs[`players/${playerId}/games/${game.$id}/date`] = game.date;
        });
      }

      return this.$q.resolve(this.rootRef.update(updateRefs));
    },

    findBetweenDates: function (from, to, communityId) {
      return this.$q.resolve(
        this.gamesRef
          .orderByChild('date')
          .startAt(from)
          .endAt(to)
          .once('value')
          .then(querySnapshot => {
            let resultGames = [];
            if (querySnapshot.hasChildren()) {
              querySnapshot.forEach(function (gameSnap) {
                let game = gameSnap.val();
                if (game.communityId === communityId) {
                  game.$id = gameSnap.key;
                  game.players = gameSnap.child('players').val();
                  resultGames.push(game);
                }
              });
            }

            return resultGames;
          })
      );
    }
  };
}());
