(function () {
  'use strict';

  /**
   * Games services
   */
  angular.module('pokerManager.services')
    .service('Games', GamesService);

  GamesService.$inject = ['$q', 'Ref', '$firebaseArray', '$firebaseObject'];
  function GamesService($q, Ref, $firebaseArray, $firebaseObject) {
    this.gamesRef = Ref.child('games');
    this.$q = $q;
    this.$firebaseArray = $firebaseArray;
    this.$firebaseObject = $firebaseObject;
  }

  GamesService.prototype = {
    newGame: function (communityId) {
      var gameToSave = {
        location: '',
        date: Date.now(),
        numberOfHands: 0,
        chipValue: 4,
        defaultBuyin: 50,
        communityId: communityId,
        hostingCosts: 20
      };

      return this.gamesRef
        .push(gameToSave);
    },
    getGame: function (gameId) {
      return this.$firebaseObject(this.gamesRef.child(gameId));
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
      // return service.findBy('communityId', communityId);
      return this.$firebaseArray(
        this.gamesRef
          .orderByChild('communityId')
          .equalTo(communityId)
          .limitToLast(limit || 100)
      );
    },

    findBetweenDates: function (from, to, communityId) {
      return this.$q(function (resolve) {
        this.gamesRef
          .orderByChild('date')
          .startAt(from)
          .endAt(to)
          .once('value', function (querySnapshot) {
            var resultGames = [];
            if (querySnapshot.hasChildren()) {
              querySnapshot.forEach(function (gameSnap) {
                var game = gameSnap.val();
                if (game.communityId === communityId) {
                  game.$id = gameSnap.key;
                  game.players = gameSnap.child('players').val();
                  resultGames.push(game);
                }
              });
              resolve(resultGames);
            } else {
              resolve([]);
            }
          });
      }.bind(this));
    }
  };
}());
