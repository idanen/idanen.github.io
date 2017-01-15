(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('JoinCommunityCtrl', JoinCommunityController);

  JoinCommunityController.$inject = ['$state', 'communitiesSvc', 'userService', 'polymerToaster', 'Players'];
  function JoinCommunityController($state, communitiesSvc, userService, polymerToaster, Players) {
    this.communitiesSvc = communitiesSvc;
    this.$state = $state;
    this.community = this.communitiesSvc.getCommunity($state.params.communityId);
    this.userService = userService;
    this.polymerToaster = polymerToaster;
    this.playersSvc = Players;
    this.joined = false;

    this.offUserChange = this.userService.onUserChange(user => this.userChanged(user));
  }

  JoinCommunityController.prototype = {
    $onDestroy: function () {
      this.offUserChange();
    },

    userChanged: function (user) {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.playerId) {
        if (this.community && _.isFunction(this.community.$destroy)) {
          this.community.$destroy();
        }
        this.community = this.communitiesSvc.getCommunity(this.$state.params.communityId);
        this.community.$loaded()
          .then(() => {
            this.joined = !!this.community.joiners && !!this.community.joiners[this.currentUser.uid];
            return this.playersSvc.findBy('userUid', this.currentUser.uid);
          })
          .then(player => {
            this.approved = player.memberIn && player.memberIn[this.community.$id];
          });
      }
    },

    joinCommunity: function () {
      this.joiningFailed = '';
      if (this.currentUser && this.community && !this.joined) {
        const joinRequest = Object.assign({}, this.currentUser, {
          communityId: this.community.$id,
          joinCode: this.joinCode
        });
        return this.communitiesSvc.askToJoin(joinRequest)
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
