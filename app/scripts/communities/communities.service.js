(function () {
  'use strict';

  angular
    .module('pokerManager')
    .service('communitiesSvc', CommunitiesService);

  CommunitiesService.$inject = ['$q', 'Ref', '$firebaseArray', 'Players'];
  function CommunitiesService($q, Ref, $firebaseArray, Players) {
    var service = this;

    service.selectedCommunityIdx = 0;
    service.$q = $q;
    service.$firebaseArray = $firebaseArray;
    service.Ref = Ref;
    service.Players = Players;
    service.communitiesRef = Ref.child('communities');
    service.communities = $firebaseArray(service.communitiesRef);

    service.communities.$loaded()
      .then(function () {
        service.setSelectedCommunity(service.selectedCommunityIdx);
      });
  }

  CommunitiesService.prototype = {
    getCommunities: function () {
      return this.$firebaseArray(this.communitiesRef);
    },
    setSelectedCommunity: function (idx) {
      this.selectedCommunityIdx = idx;
    },
    getSelectedCommunity: function () {
      return this.communities.$loaded()
        .then(function () {
          return this.communities[this.selectedCommunityIdx];
        }.bind(this));
    },
    addMember: function (player, community) {
      var service = this;
      return this.Players.save(player)
        .then(function (savedPlayer) {
          var idx = service.communities.$indexFor(community.$id),
              membership = {};

          membership[community.$id] = community.name;
          if (idx !== -1) {
            savedPlayer.once('value', function (snap) {
              service.communities[idx].members[snap.key] = snap.child('name').val();
              service.communities.$save(idx);
            });
            service.Ref.child('players/' + savedPlayer.key).child('memberIn').set(membership);
          }
        });
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
