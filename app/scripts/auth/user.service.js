(function () {
  'use strict';

  angular
    .module('pokerManager.services')
    .service('userService', UserService);

  UserService.$inject = ['$q', '$window', '$firebaseAuth', 'Ref', 'GOOGLE_AUTH_SCOPES'];
  function UserService($q, $window, $firebaseAuth, Ref, GOOGLE_AUTH_SCOPES) {
    this.$q = $q;
    this.$window = $window;
    this.authObj = $firebaseAuth();
    this.usersRef = Ref.child('users');
    this.GOOGLE_AUTH_SCOPES = GOOGLE_AUTH_SCOPES;
  }

  UserService.prototype = {
    getUser: function (uid) {
      return this.$q.resolve(
        this.usersRef
          .child(uid)
          .once('value')
          .then(function (snap) {
            this.user = snap.val();
            return snap.val();
          }.bind(this))
      );
    },
    waitForUser: function () {
      return this.$q.resolve(this.authObj.$waitForSignIn())
        .then(function (user) {
          if (user) {
            return this.getUser(user.uid);
          }

          return null;
        }.bind(this));
    },

    login: function () {
      var provider = new this.$window.firebase.auth.GoogleAuthProvider();
      this.GOOGLE_AUTH_SCOPES.forEach(function (scope) {
        provider.addScope(scope);
      });
      return this.authObj.$signInWithPopup(provider)
        .then(this.waitForUser.bind(this));
    },

    logout: function () {
      this.authObj.$signOut();
      delete this.user;
    },

    linkUserToPlayer: function (player) {
      return this.usersRef
        .child(this.user.uid)
        .child('playerId')
        .set(player.$id)
        .then(function () {
          return player;
        });
    },

    addSubscriptionId: function (subscriptionId) {
      var subscription = {
        subscriptionId: subscriptionId
      };
      this.waitForUser()
        .then(function () {
          if (!this.user) {
            return;
          }
          return this.usersRef
            .child(this.user.uid)
            .child('devices')
            .orderByChild('subscriptionId')
            .equalTo(subscriptionId)
            .once('value', function (snapshot) {
              if (!snapshot.exists()) {
                snapshot.ref.push().set(subscription);
              } else {
                console.log('this endpoint is already subscribed');
              }
            });
        }.bind(this));
    },

    removeSubscriptionId: function (subscriptionId) {
      this.waitForUser()
        .then(function () {
          if (!this.user) {
            return;
          }
          return this.usersRef
            .child(this.user.uid)
            .child('devices')
            .orderByChild('subscriptionId')
            .equalTo(subscriptionId)
            .once('value', function (snapArr) {
              if (snapArr.hasChildren()) {
                snapArr.forEach(function (deviceSnap) {
                  deviceSnap.ref.remove();
                });
              }
            });
        }.bind(this));
    }
  };
}());
