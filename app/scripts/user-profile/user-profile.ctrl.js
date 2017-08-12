(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('UserProfileCtrl', UserProfileController);

  UserProfileController.$inject = ['$element', 'userService', 'playersUsers', 'communitiesSvc', 'Players', '$state', 'filesUploadSvc', '$q'];
  function UserProfileController($element, userService, playersUsers, communitiesSvc, Players, $state, filesUploadSvc, $q) {
    this.$element = $element;
    this.userService = userService;
    this.playersUsers = playersUsers;
    this.playersSvc = Players;
    this.communitiesSvc = communitiesSvc;
    this.$state = $state;
    this.filesUploadSvc = filesUploadSvc;
    this.$q = $q;

    this.cardElement = this.$element.find('paper-card')[0];
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
      this.communities = this.communitiesSvc.mapCommunityForPicker(this.player.membership);
      return this.communities;
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

    saveProfileImage($event) {
      const uid = this.currentUser.uid;
      return this.$q.resolve(this.filesUploadSvc.uploadImg({uid, imgFile: $event.file}))
        .then(url => {
          console.log(`uploaded: ${url}`);
          this.cardElement.image = '';
          this.cardElement.image = url;
          return this.playersUsers.updatePhotoURL(uid, url);
        })
        .then(() => {
          this.uploadMsg = 'Uploaded successful';
        })
        .catch(err => {
          console.error('Failed to upload image:', err);
          this.uploadMsg = 'Uploading failed';
        });
    },

    logout: function () {
      this.userService.logout();
    }
  };
}());
