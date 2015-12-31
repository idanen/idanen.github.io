(function () {
  'use strict';

  angular
    .module('pokerManager')
    .service('communitiesSvc', CommunitiesService);

  CommunitiesService.$inject = ['Ref', '$firebaseArray', 'Players'];
  function CommunitiesService(Ref, $firebaseArray, Players) {
    var service = this;

    service.selectedCommunityIdx = 0;
    service.Ref = Ref;
    service.Players = Players;
    service.communities = $firebaseArray(Ref.child('communities'));

    service.communities.$loaded()
      .then(function () {
        service.setSelectedCommunity(service.selectedCommunityIdx);
      });
  }

  CommunitiesService.prototype = {
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
              service.communities[idx].members[snap.key()] = snap.child('name').val();
              service.communities.$save(idx);
            });
            service.Ref.child('players/' + savedPlayer.key()).child('memberIn').set(membership);
          }
        });
    }
  };
}());
