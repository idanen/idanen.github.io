(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('JoinCommunityCtrl', JoinCommunityController);

  JoinCommunityController.$inject = ['$stateParams', 'communitiesSvc', 'userService', 'polymerToaster'];
  function JoinCommunityController($stateParams, communitiesSvc, userService, polymerToaster) {
    this.communitiesSvc = communitiesSvc;
    this.community = this.communitiesSvc.getCommunity($stateParams.communityId);
    this.joinCode = $stateParams.joinCode;
    this.userService = userService;
    this.polymerToaster = polymerToaster;
    this.joined = false;

    this.userService.onUserChange(user => this.userChanged(user));
  }

  JoinCommunityController.prototype = {
    userChanged: function (user) {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.playerId) {
        this.community.$loaded()
          .then(() => {
            this.joined = !!this.community.joiners && !!this.community.joiners[this.currentUser.uid];
          });
      }
    },

    joinCommunity: function () {
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
            return this.polymerToaster.showToast({
              text: 'Thanks for joining :)'
            });
          });
      }
    }
  };
}());
