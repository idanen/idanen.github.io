(function () {
  'use strict';

  /**
   * Players services
   */
  angular.module('pokerManager')
    .factory('Players', PlayersFactory);

  PlayersFactory.$inject = ['$q', 'Ref', '$firebaseArray', '$firebaseObject'];
  function PlayersFactory($q, Ref, $firebaseArray, $firebaseObject) {
    var service = {
      create: create,
      save: save,
      saveResult: saveResult,
      deleteResult: deleteResult,
      getPlayer: getPlayer,
      playersOfCommunity: playersOfCommunity,
      findBy: findBy,
      matchUserToPlayer: matchUserToPlayer,
      playersRef: Ref.child('players'),
      players: $firebaseArray(Ref.child('players'))
    };

    service.fetchedPlayers = function () {
      return $firebaseArray(service.playersRef);
    };

    function create() {
      return {
        name: '',
        balance: 0,
        isPlaying: false,
        buyin: 0,
        currentChipCount: 0,
        email: '',
        phone: '',
        createDate: Date.now(),
        isNew: true
      };
    }

    function save(player) {
      var existingPlayer = service.players.$getRecord(player.$id);

      delete player.isNew;
      if (!existingPlayer) {
        return service.players.$add(player);
      }

      angular.extend(existingPlayer, player);
      return service.players.$save(existingPlayer);
    }

    function saveResult(gameResult, game) {
      var playerToUpdate = service.players.$getRecord(gameResult.$id || gameResult.id);
      if (!playerToUpdate.games) {
        playerToUpdate.games = {};
      }
      gameResult.date = game.date;
      playerToUpdate.games[game.$id] = gameResult;

      service.players.$save(playerToUpdate);
    }

    function deleteResult(gameResult, game) {
      var playerToUpdate = service.players.$getRecord(gameResult.$id || gameResult.id);

      if (game.$id in playerToUpdate.games) {
        delete playerToUpdate.games[game.$id];
        service.players.$save(playerToUpdate);
      }
    }

    function getPlayer(playerId) {
      // return service.players.$getRecord(playerId);
      return $firebaseObject(service.playersRef.child(playerId));
    }

    function playersOfCommunity(community) {
      var playerIds = Object.keys(community.members),
          baseRef = Ref.child('players'),
          promises = [];

      playerIds.forEach(function (playerId) {
        promises.push($q(function (resolve, reject) {
          baseRef.child(playerId).once('value', function (snap) {
            var player = snap.val();
            player.$id = player.id = snap.key;
            resolve(player);
          }, reject);
        }));
      });

      return $q.all(promises);
    }

    function findBy(field, value, multi) {
      return $q(function (resolve, reject) {
        service.players.$ref().off('value');
        service.players.$ref()
          .orderByChild(field)
          .equalTo(value)
          .on('value', function (querySnapshot) {
            var result = multi ? [] : {};
            if (querySnapshot.hasChildren()) {
              querySnapshot.forEach(function (playerSnap) {
                if (multi) {
                  result.push(playerSnap);
                } else {
                  result = playerSnap;
                }
              });
            }
            resolve(result);
          }, reject);
      });
    }

    function matchUserToPlayer(user) {
      return findBy('email', user.email)
        .then(addUser)
        .then(matchPlayerToUser);

      function addUser(playerSnapshot) {
        var idx = -1,
            newPlayer, playerId;

        // Stop listening
        service.players.$ref().off('value');

        if (playerSnapshot) {
          playerId = playerSnapshot.key;
          idx = service.players.$indexFor(playerId);
          if (idx !== -1) {
            service.players[idx].userUid = user.uid;
            return service.players.$save(idx);
          }
        } else {
          newPlayer = create();
          newPlayer.userUid = user.uid;
          newPlayer.name = user.name;
          newPlayer.email = user.email;
          newPlayer.imageUrl = user.imageUrl;
          delete newPlayer.isNew;
          return service.players.$add(newPlayer)
            .catch(function (error) {
              console.log(error);
            });
        }
      }

      function matchPlayerToUser(playerRef) {
        var playerId = playerRef.key;
        Ref.child('users')
          .child(user.uid)
          .child('playerId').set(playerId);
        return service.players.$getRecord(playerId);
      }
    }

    return service;
  }
}());
