(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('HomeCtrl', HomeController);

  HomeController.$inject = ['communitiesSvc', 'userService', 'playersMembership'];
  function HomeController(communitiesSvc, userService, playersMembership) {
    this.communities = communitiesSvc.getCommunities();
    this.communitiesSvc = communitiesSvc;
    this.userService = userService;
    this.playersMembership = playersMembership;

    this.addingComunity = true;
    this.editingCommunity = false;
  }

  HomeController.prototype = {
    prepareJoinCommunity: function () {
      this.joinFormVisible = true;
    },
    joinCommunity: function (communityInvitationKey) {
      this.communitiesSvc.joinCommunity(communityInvitationKey);
    },

    communitiesDropdownToggle() {
      this.communityDropdownOpen = !this.communityDropdownOpen;
    },

    startAddingCommunity() {
      this.addingCommunity = true;
      this.openCommunityEdit();
    },

    startJoiningCommunity(community) {
      this.addingCommunity = false;
      this.joiningTo = community.$id;
      this.openCommunityEdit();
    },

    saveCommunity() {
      if (this.addingCommunity) {
        this.saveAddingCommunity();
      } else {
        this.saveJoiningCommunity();
      }
    },

    saveAddingCommunity() {
      let communityToAdd = {};
      if (this.newCommunity) {
        this.communityInputDisabled = true;
        communityToAdd.name = this.newCommunity;
        this.communities.$add(communityToAdd)
            .then(ref => {
              communityToAdd.$id = ref.key;
              return this.userService.waitForUser();
            })
            .then(user => {
              return this.playersMembership.setAdminOfCommunity(communityToAdd, user.uid);
            })
            .catch(err => {
              console.error('Couldn\'t add community: ', err);
            })
            .finally(() => {
              this.communityInputDisabled = false;
              this.newCommunity = '';
              this.closeCommunityEdit();
            });
      }
    },

    saveJoiningCommunity() {
      console.warn('Joining community not implemented yet');
    },

    openCommunityEdit() {
      this.editingCommunity = true;
    },

    closeCommunityEdit() {
      this.editingCommunity = false;
    },

    toggleCommunityEdit() {
      this.editingCommunity = !this.editingCommunity;
    }
  };
}());
