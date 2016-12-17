(function () {
  'use strict';

  angular.module('pokerManager')
    .component('signupLoginForm', {
      controller: SignupFormController,
      templateUrl: 'scripts/user-profile/signup-form.view.html',
      bindings: {
        onLogin: '&',
        onLogout: '&'
      }
    });

  SignupFormController.$inject = ['$element', 'userService', 'playersUsers', 'communitiesSvc', 'Players', 'USER_DOESNT_EXIST_ERROR'];
  function SignupFormController($element, userService, playersUsers, communitiesSvc, Players, USER_DOESNT_EXIST_ERROR) {
    this.$element = $element;
    this.userService = userService;
    this.playersUsers = playersUsers;
    this.playersSvc = Players;
    this.communitiesSvc = communitiesSvc;
    this.USER_DOESNT_EXIST_ERROR = USER_DOESNT_EXIST_ERROR;
    this.FIREBASE_AUTH_ERRORS = {
      'auth/user-not-found': 'Wrong email and/or password',
      'auth/wrong-password': 'Wrong email and/or password',
      'auth/user-disabled': 'User is disabled. Contact help@ourhomegame.com for help',
      'auth/invalid-email': 'The provided email is invalid',
      'auth/email-already-in-use': 'This email is already in use',
      'auth/operation-not-allowed': 'This email is blocked. Contact help@ourhomegame.com for help',
      'auth/weak-password': 'The provided password is too weak'
    };
    this.userInputs = {
      name: '',
      email: '',
      pass: ''
    };

    this.userService.onUserChange(user => this.userChanged(user));

    this.listeners = [];
  }

  SignupFormController.prototype = {
    $onInit: function () {
      this.listeners = [
        {
          element: this.$element.find('.google-login-btn')[0],
          event: 'tap',
          listener: () => this.login('google')
        }
      ];
    },

    $postLink: function () {
      this.listeners.forEach(toAttach => {
        toAttach.element.addEventListener(toAttach.event, toAttach.listener);
      });
    },

    $onDestroy: function () {
      this.listeners.forEach(toDetach => {
        toDetach.element.removeEventListener(toDetach.event, toDetach.listener);
      });
    },

    userChanged: function (currentUser) {
      this.currentUser = currentUser;
      if (this.player && _.isFunction(this.player.$destroy)) {
        this.player.$destroy();
        this.player = null;
      }
      if (this.currentUser && this.currentUser.playerId) {
        this.player = this.playersSvc.getPlayer(this.currentUser.playerId);
      }
    },

    signup: function () {
      if (!this.userProfileForm.$valid) {
        this.markErrors();
        return;
      }
      return this.playersUsers.createUser(this.userInputs.name, this.userInputs.email, this.userInputs.pass)
        .then(saved => {
          console.log('sign up success', saved);
          this.onLogin({$event: saved.uid || saved.userUid});
        })
        .catch(err => {
          this.loginErrorMessage = this.FIREBASE_AUTH_ERRORS[err.code] || err.message;
          throw err;
        });
    },

    login: function (method) {
      this.loginErrorMessage = '';
      this.userService.login(method, this.userInputs.email, this.userInputs.pass)
        .then(user => this.onLogin({$event: user.uid}))
        .catch(err => {
          if (err.message === this.USER_DOESNT_EXIST_ERROR) {
            return this.playersUsers.newProviderUser();
          }
          this.loginErrorMessage = this.FIREBASE_AUTH_ERRORS[err.code] || err.message;
          throw err;
        });
    },

    markErrors: function () {
      console.log('marking errors');
    },

    logout: function () {
      this.userService.logout();
      this.onLogout();
    }
  };
}());
