(function () {
  'use strict';

  /**
   * Players services
   */
  angular.module('pokerManager')
    .service('Players', PlayersService);

  PlayersService.$inject = ['$q', 'Ref', '$firebaseArray', '$firebaseObject'];
  function PlayersService($q, Ref, $firebaseArray, $firebaseObject) {
    this.$q = $q;
    this.playersRef = Ref.child('players');
    this.$firebaseArray = $firebaseArray;
    this.$firebaseObject = $firebaseObject;
  }

  PlayersService.prototype = {
    createPlayer: function () {
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
    },

    allPlayers: function () {
      return this.$firebaseArray(this.playersRef);
    },

    save: function (player) {
      let newPlayerRef;
      if (!player.$id) {
        delete player.isNew;
        newPlayerRef = this.playersRef.push();
        return newPlayerRef.set(player)
          .then(() => {
            player.$id = newPlayerRef.key;
            return player;
          });
      }
      return player.$save()
        .then(function () {
          return player;
        });
    },

    saveResult: function (gameResult, game) {
      gameResult.date = game.date;
      return this.playersRef
        .child(gameResult.$id || gameResult.id)
        .child('games')
        .child(game.$id)
        .set(gameResult);
    },

    deleteResult: function (gameResult, game) {
      return this.playersRef
        .child(gameResult.$id || gameResult.id)
        .child('games')
        .child(game.$id)
        .remove();
    },

    getPlayer: function (playerId) {
      return this.$firebaseObject(this.playersRef.child(playerId));
    },

    playersOfCommunity: function (communityId, communityName) {
      return this.$firebaseArray(
        this.playersRef
          .orderByChild('memberIn/' + communityId)
          .equalTo(communityName)
      );
    },

    playersCommunities: function (playerId) {
      return this.$q.resolve(
        this.playersRef
          .child(playerId)
          .child('memberIn')
          .once('value')
          .then(function (snapshot) {
            return snapshot.val();
          })
      );
    },

    joinCommunity: function (player, community) {
      return this.playersRef
        .child(player.$id)
        .child('memberIn')
        .child(community.$id)
        .set(community.name);
    },

    findBy: function (field, value, multi) {
      return this.$q(function (resolve, reject) {
        this.playersRef
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
      }.bind(this));
    },

    addUser: function (user, player) {
      var newPlayer, newPlayerRef;

      if (player && player.$id) {
        return this.playersRef
          .child(player.$id)
          .child('userUid')
          .set(user.uid)
          .then(function () {
            return this.getPlayer(player.$id);
          }.bind(this));
      }

      newPlayer = this.createPlayer();
      newPlayer.userUid = user.uid;
      newPlayer.name = user.name || user.displayName;
      newPlayer.email = user.email;
      newPlayer.imageUrl = user.imageUrl || user.photoURL;
      delete newPlayer.isNew;
      newPlayerRef = this.playersRef.push(player);
      newPlayer.$id = newPlayerRef.key;
      return newPlayerRef
        .then(function () {
          return newPlayer;
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    getPlayerGames: function (playerId, limit) {
      return this.$firebaseArray(
        this.playersRef
          .child(playerId)
          .child('games')
          .orderByChild('date')
          .limitToLast(limit || 500)
      );
    }
  };
}());
