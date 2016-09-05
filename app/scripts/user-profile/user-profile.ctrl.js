(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('UserProfileCtrl', UserProfileController);

  UserProfileController.$inject = ['userService'];
  function UserProfileController(userService) {
    this.userService = userService;

    this.signup = {
      name: '',
      email: '',
      pass: ''
    };

    this.userService.onUserChange(user => this.userChanged(user));
  }

  UserProfileController.prototype = {
    userChanged: function (currentUser) {
      this.currentUser = currentUser;
    }
  };
}());
