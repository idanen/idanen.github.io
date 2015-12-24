(function () {
  angular
    .module('pokerManager')
    .service('communitiesSvc', CommunitiesService);

  CommunitiesService.$inject = ['Ref', '$firebaseArray', 'Players'];
  function CommunitiesService(Ref, $firebaseArray, Players) {
    var service = this,
        selectedCommunityIdx = 0;

    service.communities = $firebaseArray(Ref.child('communities'));

    service.communities.$loaded().then(function () {
      service.setSelectedCommunity(selectedCommunityIdx);
    });

    service.setSelectedCommunity = function (idx) {
      selectedCommunityIdx = idx;
    };

    service.getSelectedCommunity = function () {
      return service.communities.$loaded().then(function () {
        return service.communities[selectedCommunityIdx];
      });
    };

    service.addMember = function (player, community) {
      return Players.save(player)
        .then(function (savedPlayer) {
          var idx = service.communities.$indexFor(community.$id),
              membership = {};

          membership[community.$id] = community.name;
          if (idx !== -1) {
            savedPlayer.once('value', function (snap) {
              service.communities[idx].members[snap.key()] = snap.child('name').val();
              service.communities.$save(idx);
            });
            Ref.child('players/' + savedPlayer.key()).child('memberIn').set(membership);
          }
        });
    };
  }
}());
