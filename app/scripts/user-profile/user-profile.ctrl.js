(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('UserProfileCtrl', UserProfileController);

  UserProfileController.$inject = ['$element', 'userService', 'playersUsers', 'communitiesSvc'];
  function UserProfileController($element, userService, playersUsers, communitiesSvc) {
    this.$element = $element;
    this.userService = userService;
    this.playersUsers = playersUsers;
    this.communitiesSvc = communitiesSvc;

    this.userInputs = {
      name: '',
      email: '',
      pass: ''
    };

    this.userService.onUserChange(user => this.userChanged(user));
  }

  UserProfileController.prototype = {
    $postLink: function () {
      this.cardElement = this.$element.find('paper-card');
    },

    userChanged: function (currentUser) {
      this.currentUser = currentUser;
      if (this.cardElement) {
        if (this.currentUser) {
          this.cardElement.heading = this.currentUser.name;
        } else {
          this.cardElement.heading = 'Login / Signup';
        }
      }
    },

    signup: function () {
      if (!this.userProfileForm.$valid) {
        this.markErrors();
        return;
      }
      return this.userService.createUser(this.userInputs.name, this.userInputs.email, this.userInputs.pass)
        .then(saved => console.log('sign up success', saved))
        .catch(err => console.error(err));
    },

    login: function (method) {
      this.userService.login(method, this.userInputs.email, this.userInputs.pass);
    },

    markErrors: function () {
      console.log('marking errors');
    },

    logout: function () {
      this.userService.logout();
    }
  };
}());
