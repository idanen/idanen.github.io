(function () {
  'use strict';

  /**
   * Games services
   */
  angular.module('pokerManager.services').
    factory('Games', GamesFactory);

  GamesFactory.$inject = ['$q', 'Ref', '$firebaseArray', '$firebaseObject'];
  function GamesFactory($q, Ref, $firebaseArray, $firebaseObject) {
    var service = {
          newGame: newGame,
          findBy: findBy,
          findBetweenDates: findBetweenDates,
          getGame: getGame
        },
        games = $firebaseArray(Ref.child('games'));

    function newGame(communityId) {
      var gameToSave = {
        location: '',
        date: Date.now(),
        numberOfHands: 0,
        chipValue: 4,
        defaultBuyin: 50,
        communityId: communityId,
        players: {}
      };

      return games.$add(gameToSave)
        .then(function (gameRef) {
          var gameId = gameRef.key();
          return games.$getRecord(gameId);
        });
    }

    function getGame(gameId) {
      return $firebaseObject(Ref.child('games').child(gameId));
    }

    function findBy(field, value, limit) {
      return $q(function (resolve) {
        games.$ref()
          .orderByChild(field)
          .equalTo(value)
          .limitToLast(limit || 100)
          .once('value', function (querySnapshot) {
            var resultGames = {};
            if (querySnapshot.hasChildren()) {
              querySnapshot.forEach(function (gameSnap) {
                var game = gameSnap.val();
                game.$id = gameSnap.key();
                resultGames[game.$id] = game;
              });
            }
            // resolve(_.sortByOrder(resultGames, 'date', 'desc'));
            resolve(resultGames);
          });
      });
    }

    function findBetweenDates(from, to, communityId) {
      return $q(function (resolve) {
        games.$ref()
          .orderByChild('date')
          .startAt(from)
          .endAt(to)
          .once('value', function (querySnapshot) {
            var resultGames = [];
            if (querySnapshot.hasChildren()) {
              querySnapshot.forEach(function (gameSnap) {
                var game = gameSnap.val();
                if (game.communityId === communityId) {
                  game.$id = gameSnap.key();
                  game.players = gameSnap.child('players').val();
                  resultGames.push(game);
                }
              });
              resolve(resultGames);
            } else {
              resolve([]);
            }
          });
      });
    }

    return service;
  }
}());
