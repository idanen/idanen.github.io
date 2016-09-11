(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('UserProfileCtrl', UserProfileController);

  UserProfileController.$inject = ['userService', 'playersUsers'];
  function UserProfileController(userService, playersUsers) {
    this.userService = userService;
    this.playersUsers = playersUsers;

    this.userInputs = {
      name: '',
      email: '',
      pass: ''
    };

    this.userService.onUserChange(user => this.userChanged(user));
  }

  UserProfileController.prototype = {
    userChanged: function (currentUser) {
      this.currentUser = currentUser;
    },

    signup: function () {
      return this.playersUsers.createUser(this.userInputs.name, this.userInputs.email, this.userInputs.pass)
        .then(saved => console.log('sign up success', saved))
        .catch(err => console.error(err));
    },

    login: function (method) {
      this.userService.login(method);
    },

    logout: function () {
      this.userService.logout();
    }
  };
}());
