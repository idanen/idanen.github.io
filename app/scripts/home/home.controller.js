(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('HomeCtrl', HomeController);

  HomeController.$inject = ['communitiesSvc', 'userService', 'playersMembership', 'polymerToaster'];
  function HomeController(communitiesSvc, userService, playersMembership, polymerToaster) {
    this.communities = communitiesSvc.getCommunities();
    this.communitiesSvc = communitiesSvc;
    this.userService = userService;
    this.playersMembership = playersMembership;
    this.polymerToaster = polymerToaster;

    this.newCommunity = '';
    this.defaultSettings = {
      chipValue: 1,
      defaultBuyin: 50,
      hostingCosts: 10
    };
    this.addingComunity = true;
    this.editingCommunity = false;

    this.userService.onUserChange(user => this.userChanged(user));
  }

  HomeController.prototype = {
    prepareJoinCommunity: function () {
      this.joinFormVisible = true;
    },

    userChanged: function (user) {
      this.currentUser = user;
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

    settingsUpdated(newSettings) {
      _.extend(this.defaultSettings, newSettings);
    },

    saveAddingCommunity() {
      let communityToAdd = {};
      if (this.newCommunity) {
        this.communityInputDisabled = true;
        communityToAdd.name = this.newCommunity;
        communityToAdd.defaultSettings = this.defaultSettings;
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
              this.defaultSettings = {
                chipValue: 1,
                defaultBuyin: 50,
                hostingCosts: 10
              };
              this.closeCommunityEdit();
            });
      }
    },

    saveJoiningCommunity() {
      console.warn('Joining community not implemented yet');
      if (this.currentUser) {
        this.communityInputDisabled = true;
        this.communitiesSvc.askToJoin({
          communityId: this.joiningTo,
          uid: this.currentUser.uid,
          email: this.currentUser.email,
          joinCode: this.newCommunity
        })
          .then(() => {
            this.newCommunity = '';
            this.closeCommunityEdit();
            this.polymerToaster.showToast({
              duration: 5000,
              text: 'Join request send.'
            });
          })
          .finally(() => {
            this.communityInputDisabled = false;
          });
      }
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
