(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('JoinCommunityCtrl', JoinCommunityController);

  JoinCommunityController.$inject = ['$stateParams', 'communitiesSvc', 'userService', 'polymerToaster', 'Players'];
  function JoinCommunityController($stateParams, communitiesSvc, userService, polymerToaster, Players) {
    this.communitiesSvc = communitiesSvc;
    this.community = this.communitiesSvc.getCommunity($stateParams.communityId);
    this.userService = userService;
    this.polymerToaster = polymerToaster;
    this.playersSvc = Players;
    this.joined = false;

    this.userService.onUserChange(user => this.userChanged(user));
  }

  JoinCommunityController.prototype = {
    userChanged: function (user) {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.playerId) {
        this.community.$loaded()
          .then(() => {
            this.joined = !!this.community.members[this.currentUser.playerId] || !!this.community.joiners && !!this.community.joiners[this.currentUser.uid];
          });
      }
    },

    joinCommunity: function () {
      this.joiningFailed = '';
      if (this.currentUser && this.community && !this.joined) {
        return this.communitiesSvc.askToJoin({
          communityId: this.community.$id,
          uid: this.currentUser.uid,
          email: this.currentUser.email,
          joinCode: this.joinCode,
          photoURL: this.currentUser.photoURL,
          displayName: this.currentUser.displayName
        })
          .then(() => {
            return this.playersSvc.findBy('userUid', this.currentUser.uid);
          })
          .then(player => {
            return this.playersSvc.joinCommunity(player, this.community, true);
          })
          .then(() => {
            return this.polymerToaster.showToast({
              text: 'Thanks for joining :)'
            });
          })
          .then(() => {
            this.joined = !!this.community.joiners && !!this.community.joiners[this.currentUser.uid];
          })
          .catch(() => {
            this.joiningFailed = 'Join request failed. Verify you have the right link and the right joining code';
          });
      }
    }
  };
}());
