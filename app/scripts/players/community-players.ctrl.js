(function () {
  'use strict';

  class CommunityPlayersController {
    static get $inject() {
      return ['community', '$q', 'communitiesSvc', 'Players', 'playersMembership'];
    }

    constructor(community, $q, communitiesSvc, Players, playersMembership) {
      this.community = community;
      this.$q = $q;
      this.communitiesSvc = communitiesSvc;
      this.playersSvc = Players;
      this.playersMembership = playersMembership;

      this.community.$loaded()
        .then(() => {
          this.joiners = this.communitiesSvc.getJoiners(this.community.$id);
          this.members = this.playersSvc.playersOfCommunity(this.community.$id, this.community.name);
          return this.members.$loaded();
        });
    }

    confirmPlayer(joiner) {
      return this.playersMembership.confirmJoiningPlayer(joiner.uid, this.community);
    }
  }

  angular.module('pokerManager')
    .controller('CommunityPlayersCtrl', CommunityPlayersController);
}());
