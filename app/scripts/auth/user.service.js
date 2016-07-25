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
          .then(snap => {
            this.user = snap.val();
            return snap.val();
          })
      );
    },
    waitForUser: function () {
      return this.$q.resolve(this.authObj.$waitForSignIn())
        .then(user => {
          if (user) {
            return this.getUser(user.uid);
          }

          return null;
        });
    },

    login: function () {
      var provider = new this.$window.firebase.auth.GoogleAuthProvider();
      this.GOOGLE_AUTH_SCOPES.forEach(scope => provider.addScope(scope));
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
        .then(() => player);
    },

    addSubscriptionId: function (subscriptionId) {
      var subscription = {
        subscriptionId: subscriptionId
      };
      this.waitForUser()
        .then(() => {
          if (!this.user) {
            return;
          }
          return this.usersRef
            .child(this.user.uid)
            .child('devices')
            .orderByChild('subscriptionId')
            .equalTo(subscriptionId)
            .once('value')
            .then(snapshot => {
              if (!snapshot.exists()) {
                snapshot.ref.push().set(subscription);
              } else {
                console.log('this endpoint is already subscribed');
              }
            });
        });
    },

    removeSubscriptionId: function (subscriptionId) {
      this.waitForUser()
        .then(() => {
          if (!this.user) {
            return;
          }
          return this.usersRef
            .child(this.user.uid)
            .child('devices')
            .orderByChild('subscriptionId')
            .equalTo(subscriptionId)
            .once('value')
            .then(snapArr => {
              if (snapArr.hasChildren()) {
                snapArr.forEach(deviceSnap => deviceSnap.ref.remove());
              }
            });
        });
    }
  };
}());
