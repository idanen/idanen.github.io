(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('HomeCtrl', HomeController);

  HomeController.$inject = ['$state', 'communitiesSvc', 'userService', 'playersMembership', 'Players', 'polymerToaster'];
  function HomeController($state, communitiesSvc, userService, playersMembership, playersSvc, polymerToaster) {
    this.$state = $state;
    this.communitiesSvc = communitiesSvc;
    this.userService = userService;
    this.playersMembership = playersMembership;
    this.playersSvc = playersSvc;
    this.polymerToaster = polymerToaster;

    this.communities = [];
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
      this.fetchPlayersCommunities();
    },

    gotoCommunity: function (communityId) {
      if (communityId) {
        this.$state.go('community', {communityId});
      }
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
        return this.playersMembership.createCommunityWithAdmin(communityToAdd, this.currentUser.uid)
          .then(this.fetchPlayersCommunities.bind(this))
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

    fetchPlayersCommunities: function () {
      if (this.currentUser && this.currentUser.playerId) {
        this.playersSvc.playersCommunities(this.currentUser.playerId)
          .then(communities => {
            this.communities = _.map(communities, (communityName, communityId) => {
              return {
                label: communityName,
                value: communityId
              };
            });
          });
      }
    },

    inHomeRoute: function () {
      return this.$state.is('home');
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
