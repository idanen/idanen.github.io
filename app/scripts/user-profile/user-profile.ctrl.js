(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('UserProfileCtrl', UserProfileController);

  UserProfileController.$inject = ['$element', 'userService', 'playersUsers', 'communitiesSvc', 'Players'];
  function UserProfileController($element, userService, playersUsers, communitiesSvc, Players) {
    this.$element = $element;
    this.userService = userService;
    this.playersUsers = playersUsers;
    this.playersSvc = Players;
    this.communitiesSvc = communitiesSvc;

    this.cardElement = this.$element.find('paper-card');
    this.signingUp = false;
    this.userInputs = {
      name: '',
      email: '',
      pass: ''
    };

    this.userService.onUserChange(user => this.userChanged(user));
  }

  UserProfileController.prototype = {
    // $postLink: function () {
    //   this.cardElement = this.$element.find('paper-card');
    // },

    userChanged: function (currentUser) {
      this.currentUser = currentUser;
      if (this.cardElement) {
        if (this.currentUser) {
          this.cardElement.heading = this.currentUser.name;
          if (this.currentUser.playerId) {
            this.player = this.playersSvc.getPlayer(this.currentUser.playerId);
            this.player.$loaded()
              .then(() => {
                let communities = [];
                if (this.player.memberIn) {
                  communities = communities.concat(_.map(this.player.memberIn, (value, key) => {
                    return {
                      label: value,
                      value: key
                    };
                  }));
                }
                if (this.player.guestOf) {
                  communities = communities.concat(_.map(this.player.guestOf, (value, key) => {
                    return {
                      label: value,
                      value: key
                    };
                  }));
                }
                this.communities = communities;
              });
          }
        } else {
          this.cardElement.heading = 'Login / Signup';
        }
      }
    },

    communitySelectionChanged: function (community) {
      this.selectedCommunity = community;
      console.log('Change selected community', community);
    },

    // signup: function () {
    //   if (!this.userProfileForm.$valid) {
    //     this.markErrors();
    //     return;
    //   }
    //   return this.playersUsers.createUser(this.userInputs.name, this.userInputs.email, this.userInputs.pass)
    //     .then(saved => console.log('sign up success', saved))
    //     .catch(err => console.error(err));
    // },
    //
    // login: function (method) {
    //   this.userService.login(method, this.userInputs.email, this.userInputs.pass);
    // },
    //
    // markErrors: function () {
    //   console.log('marking errors');
    // },

    logout: function () {
      this.userService.logout();
    }
  };
}());
