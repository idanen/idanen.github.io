(function () {
  'use strict';

  angular.module('pokerManager')
    .component('signupLoginForm', {
      controller: SignupFormController,
      templateUrl: 'scripts/user-profile/signup-form.view.html'
    });

  SignupFormController.$inject = ['$element', 'userService', 'playersUsers', 'communitiesSvc', 'Players'];
  function SignupFormController($element, userService, playersUsers, communitiesSvc, Players) {
    this.$element = $element;
    this.userService = userService;
    this.playersUsers = playersUsers;
    this.playersSvc = Players;
    this.communitiesSvc = communitiesSvc;
    this.userInputs = {
      name: '',
      email: '',
      pass: ''
    };

    this.userService.onUserChange(user => this.userChanged(user));
  }

  SignupFormController.prototype = {
    userChanged: function (currentUser) {
      this.currentUser = currentUser;
      if (this.player && _.isFunction(this.player.$destroy)) {
        this.player.$destroy();
        this.player = null;
      }
      if (this.currentUser) {
        this.player = this.playersSvc.getPlayer(this.currentUser.playerId);
      }
    },

    signup: function () {
      if (!this.userProfileForm.$valid) {
        this.markErrors();
        return;
      }
      return this.playersUsers.createUser(this.userInputs.name, this.userInputs.email, this.userInputs.pass)
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
