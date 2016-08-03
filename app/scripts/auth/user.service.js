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

    this.authObj.$onAuthStateChanged(this.authStateChanged.bind(this));

    this._userChangedListeners = [];
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

    authStateChanged: function (authState) {
      let promise;

      if (!authState) {
        this.currentUser = null;
        promise = this.$q.resolve(null);
      } else {
        promise = this.getUser(authState.uid)
          .then(user => {
            this.currentUser = user;
            return this.currentUser;
          });
      }

      return promise
        .then(() => this.notifyUserListeners());
    },

    getCurrentUser: function () {
      return this.currentUser;
    },

    onUserChange: function (listener) {
      this._userChangedListeners.push(listener);
      listener(this.currentUser);

      return () => {
        let idx = this._userChangedListeners.indexOf(listener);
        if (idx > -1) {
          this._userChangedListeners.splice(idx, 1);
          return true;
        }
        return false;
      };
    },

    notifyUserListeners: function () {
      this._userChangedListeners.forEach(listener => listener(this.currentUser));
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
                console.log(`the endpoint "${subscriptionId}" is already subscribed`);
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
