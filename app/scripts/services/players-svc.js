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
      joinCommunity: joinCommunity,
      findBy: findBy,
      addUser: addUser,
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
      if (!player.$id) {
        var newPlayerRef = service.playersRef.push(player);
        player.$id = newPlayerRef.key;
        return newPlayerRef.then(function () {
          return player;
        });
      }
      return service.playersRef.child(player.$id).update(player)
        .then(function () {
          return player;
        });
    }

    function saveResult(gameResult, game) {
      gameResult.date = game.date;
      return service.playersRef
        .child(gameResult.$id || gameResult.id)
        .child('games')
        .child(game.$id)
        .set(gameResult);
    }

    function deleteResult(gameResult, game) {
      return service.playersRef
        .child(gameResult.$id || gameResult.id)
        .child('games')
        .child(game.$id)
        .remove();
    }

    function getPlayer(playerId) {
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
      // return $firebaseArray(
      //   service.playersRef
      //     .orderByChild('memberIn')
      //     .equalTo(community.$id)
      // );
    }

    function joinCommunity(player, community) {
      return service.playersRef
        .child(player.$id)
        .child('memberIn')
        .child(community.$id)
        .set(community.name);
    }

    function findBy(field, value, multi) {
      return $q(function (resolve, reject) {
        service.playersRef
          .orderByChild(field)
          .equalTo(value)
          .once('value', function (querySnapshot) {
            var result = multi ? [] : {};
            if (querySnapshot.hasChildren()) {
              querySnapshot.forEach(function (playerSnap) {
                var player = playerSnap.val();
                player.$id = playerSnap.key;
                if (multi) {
                  result.push(player);
                } else {
                  result = player;
                }
              });
            }
            resolve(result);
          }, reject);
      });
    }

    function addUser(player, user) {
      var newPlayer;

      if (player) {
        return service.playersRef
          .child(player.$id)
          .child('userUid')
          .set(user.uid)
          .then(function () {
            return player;
          });
      } else {
        newPlayer = create();
        newPlayer.userUid = user.uid;
        newPlayer.name = user.name;
        newPlayer.email = user.email;
        newPlayer.imageUrl = user.imageUrl;
        delete newPlayer.isNew;
        var newPlayerRef = service.playersRef.push(player);
        newPlayer.$id = newPlayerRef.key;
        return newPlayerRef
          .then(function () {
            return newPlayer;
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }

    return service;
  }
}());
