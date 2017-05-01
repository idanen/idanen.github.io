(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('UserProfileCtrl', UserProfileController);

  UserProfileController.$inject = ['$element', 'userService', 'playersUsers', 'communitiesSvc', 'Players', '$state'];
  function UserProfileController($element, userService, playersUsers, communitiesSvc, Players, $state) {
    this.$element = $element;
    this.userService = userService;
    this.playersUsers = playersUsers;
    this.playersSvc = Players;
    this.communitiesSvc = communitiesSvc;
    this.$state = $state;

    this.cardElement = this.$element.find('paper-card');
    this.userInputs = {
      name: '',
      email: '',
      pass: ''
    };

    this.offUserChange = this.userService.onUserChange(user => this.userChanged(user));
  }

  UserProfileController.prototype = {
    // $postLink: function () {
    //   this.cardElement = this.$element.find('paper-card');
    // },

    $onDestroy: function () {
      this.offUserChange();
    },

    userChanged: function (currentUser) {
      this.currentUser = currentUser;
      if (this.player && _.isFunction(this.player.$destroy)) {
        this.player.$destroy();
        this.player = null;
      }
      if (this.cardElement) {
        if (this.currentUser) {
          this.cardElement.heading = this.currentUser.name;
          if (this.currentUser.playerId) {
            this.player = this.playersSvc.getPlayer(this.currentUser.playerId);
            this.player.$loaded()
              .then(this._playerCommunitiesForPicker.bind(this));
          }
        } else {
          this.cardElement.heading = 'Login / Signup';
        }
      }
    },

    _playerCommunitiesForPicker: function () {
      const memberIn = this.communitiesSvc.mapCommunityForPicker(this.player.memberIn);
      const guestOf = this.communitiesSvc.mapCommunityForPicker(this.player.guestOf);
      const communities = memberIn.concat(guestOf);
      this.communities = communities;
      return communities;
    },

    loggedIn: function (uid) {
      this.$state.go(this.$state.current, {uid}, {reload: true});
    },

    loggedOut: function () {
      this.$state.go('userprofile', {});
    },

    communitySelectionChanged: function (community) {
      this.selectedCommunity = community;
      // console.log('Change selected community', community);
    },

    logout: function () {
      this.userService.logout();
    }
  };
}());
