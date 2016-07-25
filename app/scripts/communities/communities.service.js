(function () {
  'use strict';

  angular
    .module('pokerManager')
    .service('communitiesSvc', CommunitiesService);

  CommunitiesService.$inject = ['$q', 'Ref', '$firebaseArray', '$firebaseObject', 'Players'];
  function CommunitiesService($q, Ref, $firebaseArray, $firebaseObject, Players) {
    this.$q = $q;
    this.$firebaseArray = $firebaseArray;
    this.$firebaseObject = $firebaseObject;
    this.Ref = Ref;
    this.Players = Players;
    this.communitiesRef = Ref.child('communities');
    this.publicCommunitiesRef = Ref.child('public_communities');
  }

  CommunitiesService.prototype = {
    getCommunities: function () {
      return this.$firebaseArray(this.communitiesRef);
    },
    getPublicCommunities: function () {
      return this.$q.when(
        this.publicCommunitiesRef
          .once('value')
          .then(snap => snap.val())
      );
    },
    addAdmin: function (admin, community) {
      return this._addMember(admin, community, 'admins');
    },
    addMember: function (player, community) {
      return this._addMember(player, community, 'members');
    },
    _addMember: function (player, community, membership) {
      return this.communitiesRef
        .child(community.$id)
        .child(membership)
        .child(player.$id)
        .set(player.name);
    },
    getCommunity: function (communityId) {
      return this.$firebaseObject(this.communitiesRef.child(communityId));
    },
    getCommunitiesByIds: function (communityIds) {
      return this.$q(resolve => {
        let communities = [];
        communityIds.forEach(communityId => {
          this.communitiesRef.child(communityId).once('value')
            .then(snap => {
              var community = snap.val();
              community.$id = community.id = snap.key;
              communities.push(community);

              if (communities.length === communityIds.length) {
                resolve(communities);
              }
            });
        });
      });
    },
    getPlayerCommunities: function (player) {
      return this.getCommunitiesByIds(player.memberIn);
    }
  };
}());
