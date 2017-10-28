(function () {
  'use strict';

  /**
   * Players services
   */
  angular.module('pokerManager')
    .service('Players', PlayersService);

  PlayersService.$inject = ['$q', 'Ref', '$firebaseArray', '$firebaseObject', 'firebaseCommon'];
  function PlayersService($q, Ref, $firebaseArray, $firebaseObject, firebaseCommon) {
    this.$q = $q;
    this.playersRef = Ref.child('players');
    this.$firebaseArray = $firebaseArray;
    this.$firebaseObject = $firebaseObject;
    this.firebaseCommon = firebaseCommon;
  }

  PlayersService.prototype = {
    createPlayer: function (communityId) {
      let newPlayer = {
        displayName: '',
        balance: 0,
        isPlaying: false,
        buyin: 0,
        currentChipCount: 0,
        email: '',
        phone: '',
        createDate: Date.now(),
        isNew: true
      };

      if (communityId) {
        newPlayer.guestOf = communityId;
        newPlayer.membership = {
          [communityId]: {
            type: 'guest'
          }
        };
      }

      return newPlayer;
    },

    allPlayers: function () {
      return this.$firebaseArray(this.playersRef);
    },

    save: function (player) {
      let newPlayerRef,
          playerId;
      if (!player.$id) {
        delete player.isNew;
        newPlayerRef = this.playersRef.push();
        return this.$q.resolve(
          newPlayerRef.set(player)
            .then(() => {
              player.$id = newPlayerRef.key;
              return player;
            })
        );
      }
      if (_.isFunction(player.$save)) {
        return player.$save()
          .then(function () {
            return player;
          });
      }

      playerId = player.$id;
      delete player.$id;
      return this.$q.resolve(
        this.playersRef.child(playerId)
          .update(player)
          .then(() => {
            player.$id = playerId;
            return player;
          })
      );
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

    getPlayer: function (playerId, withoutFirebaseObject) {
      if (withoutFirebaseObject) {
        return this.firebaseCommon.getValue(`players/${playerId}`);
      }
      return this.$firebaseObject(this.playersRef.child(playerId));
    },

    playersOfCommunity: function (communityId, communityName) {
      return this.$firebaseArray(
        this.playersRef
          .orderByChild(`membership/${communityId}/name`)
          .equalTo(communityName)
      );
    },

    playersCommunities: function (playerId) {
      return this.firebaseCommon.getValue(`players/${playerId}/membership`);
    },

    joinCommunity: function (player, community, isGuest) {
      const membership = {
        name: community.name,
        type: isGuest ? 'guest' : 'member'
      };
      return this.playersRef
        .child(player.$id)
        .child('membership')
        .child(community.$id)
        .set(membership)
        .then(() => {
          return Object.assign({}, player, {
            membership: Object.assign({}, player.membership, {[community.$id]: membership})
          });
        });
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
      var newPlayer, newPlayerId;

      if (player && player.$id) {
        return this.playersRef
          .child(player.$id)
          .update({
            userUid: user.uid,
            photoURL: user.photoURL,
            displayName: user.displayName || player.displayName,
            guestOf: null
          })
          .then(() => this.getPlayer(player.$id));
      }

      newPlayer = this.createPlayer();
      newPlayer.userUid = user.uid;
      newPlayer.displayName = user.name || user.displayName;
      newPlayer.email = user.email;
      newPlayer.photoURL = user.imageUrl || user.photoURL;
      delete newPlayer.isNew;
      newPlayerId = this.playersRef.push().key;
      return this.playersRef
        .child(newPlayerId)
        .set(newPlayer)
        .then(() => {
          newPlayer.$id = newPlayerId;
          return newPlayer;
        })
        .catch(error => {
          console.log(error);
          return this.$q.reject(error);
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
