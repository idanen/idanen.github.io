(function () {
  'use strict';

  class CommunityPlayersController {
    static get $inject() {
      return ['community', 'communitiesSvc', 'Players', 'playersMembership'];
    }

    constructor(community, communitiesSvc, Players, playersMembership) {
      this.community = community;
      this.communitiesSvc = communitiesSvc;
      this.playersSvc = Players;
      this.playersMembership = playersMembership;

      this.community.$loaded()
        .then(() => {
          this.joiners = this.communitiesSvc.getJoiners(this.community.$id);
          this.members = this.playersSvc.playersOfCommunity(this.community.$id, this.community.name);
          return this.members.$loaded();
        })
        .then(() => {
          this.guests = this.playersSvc.guestsOfCommunity(this.community.$id);
        });
    }

    confirmPlayer(joiner) {
      return this.playersMembership.confirmJoiningPlayer(joiner.uid, this.community);
    }
  }

  angular.module('pokerManager')
    .controller('CommunityPlayersCtrl', CommunityPlayersController);
}());
