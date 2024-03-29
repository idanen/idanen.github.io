(function () {
  'use strict';

  angular
    .module('pokerManager')
    .service('communitiesSvc', CommunitiesService)
    .constant('Memberships', Object.freeze({
      ADMINS: 'admins',
      MEMBERS: 'members'
    }));

  CommunitiesService.$inject = ['$q', 'Ref', '$firebaseArray', '$firebaseObject', 'userService', 'Memberships'];
  function CommunitiesService($q, Ref, $firebaseArray, $firebaseObject, userService, Memberships) {
    this.$q = $q;
    this.$firebaseArray = $firebaseArray;
    this.$firebaseObject = $firebaseObject;
    this.userService = userService;
    this.Memberships = Memberships;
    this.communitiesRef = Ref.child('communities');
    this.publicCommunitiesRef = Ref.child('public_communities');
  }

  CommunitiesService.prototype = {
    createCommunity: function (toAdd) {
      let user = this.userService.getCurrentUser(),
          communityId;
      if (!user) {
        throw new Error('Only a logged in user can create a new community');
      }
      communityId = this.communitiesRef.push().key;
      toAdd.admins = {};
      toAdd.admins[user.playerId] = user.displayName || user.name;
      toAdd.members = _.extend({}, toAdd.admins);
      return this.$q.resolve(
        this.communitiesRef
          .child(communityId)
          .set(toAdd)
          .then(() => {
            toAdd.$id = communityId;
            return toAdd;
          })
      );
    },
    getCommunities: function () {
      return this.$firebaseArray(this.communitiesRef);
    },
    getPublicCommunities: function () {
      return this.$q.resolve(
        this.publicCommunitiesRef
          .once('value')
          .then(snap => snap.val())
      );
    },
    addNewCommunity: function (communityName) {
      return this.$q.resolve(
        this.communitiesRef.push({name: communityName})
      );
    },
    addAdmin: function (admin, community) {
      return this._addMember(admin, community, this.Memberships.ADMINS);
    },
    addMember: function (player, community) {
      return this._addMember(player, community, this.Memberships.MEMBERS);
    },
    _addMember: function (player, community, membership) {
      return this.$q.resolve(
        this.communitiesRef
          .child(community.$id)
          .child(membership)
          .child(player.$id)
          .set(player.displayName)
          .then(() => player)
      );
    },
    isAdmin: function (playerId, communityId) {
      return this._isMemberOrAdmin(playerId, communityId, this.Memberships.ADMINS);
    },
    isMember: function (playerId, communityId) {
      return this._isMemberOrAdmin(playerId, communityId, this.Memberships.MEMBERS);
    },
    _isMemberOrAdmin: function (playerId, communityId, membership) {
      return this.$q.resolve(
        this.communitiesRef
          .child(communityId)
          .child(membership)
          .child(playerId)
          .once('value')
          .then(snap => snap.exists())
      );
    },
    getCommunity: function (communityId) {
      return this.$firebaseObject(this.communitiesRef.child(communityId));
    },

    setJoinPass: function (communityId, joinPass) {
      return this.$q.resolve(
        this.communitiesRef
          .child(communityId)
          .set(joinPass)
      );
    },

    getUnboundCommunity: function (communityId) {
      return this.$q.resolve(
        this.communitiesRef
          .child(communityId)
          .once('value')
          .then(snap => {
            var community = snap.val();
            community.$id = snap.key;
            return community;
          })
      );
    },

    askToJoin: function (joiner) {
      return this.$q.resolve(
        this.communitiesRef
          .child(joiner.communityId)
          .child('joiners')
          .child(joiner.uid)
          .set(joiner)
      );
    },

    getJoiners: function (communityId) {
      return this.$firebaseArray(
        this.communitiesRef
          .child(communityId)
          .child('joiners')
      );
    },

    removeJoiner: function (communityId, uid) {
      return this.$q.resolve(
        this.communitiesRef
          .child(communityId)
          .child('joiners')
          .child(uid)
          .remove()
      );
    },

    setDefaultGameSettings: function (communityId, newSettings) {
      return this.$q.resolve(
        this.communitiesRef.child(communityId)
          .child('defaultGameSettings')
          .set(newSettings)
      );
    },

    getCommunitiesByIds: function (communityIds) {
      let promises = [];
      communityIds.forEach(communityId => {
        promises.push(
          this.communitiesRef.child(communityId).once('value')
            .then(snap => {
              var community = snap.val();
              community.$id = community.id = snap.key;
              return community;
            })
        );
      });
      return this.$q.all(promises);
      // return this.$q(resolve => {
      //   let communities = [];
      //   communityIds.forEach(communityId => {
      //     this.communitiesRef.child(communityId).once('value')
      //       .then(snap => {
      //         var community = snap.val();
      //         community.$id = community.id = snap.key;
      //         communities.push(community);
      //
      //         if (communities.length === communityIds.length) {
      //           resolve(communities);
      //         }
      //       });
      //   });
      // });
    },

    mapCommunityForPicker: function (communitiesObj) {
      return _.map(communitiesObj, (community, communityId) => ({label: community.name, value: communityId}));
    },

    getPlayerCommunities: function (player) {
      if (player && player.membership) {
        return this.getCommunitiesByIds(Object.keys(player.membership));
      }
      return [];
    }
  };
}());
