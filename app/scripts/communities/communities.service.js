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
  }

  CommunitiesService.prototype = {
    getCommunities: function () {
      return this.$firebaseArray(this.communitiesRef);
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
      var service = this,
          baseRef = service.Ref.child('communities'),
          communities = [];

      return service.$q(function (resolve) {
        communityIds.forEach(function (communityId) {
          baseRef.child(communityId).once('value', function (snap) {
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
