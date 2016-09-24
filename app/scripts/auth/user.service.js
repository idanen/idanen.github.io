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
            this.currentUser = snap.val();
            return this.currentUser;
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

    createUser: function (name, email, pass) {
      return this.authObj.$createUserWithEmailAndPassword(email, pass)
        .then(newUser => this.saveUser(newUser, name));
    },

    generateImageUrl: function (identifier) {
      return `https://robohash.org/${identifier}?gravatar=yes&set=set2&bgset=bg1`;
    },

    saveUser: function (toSave, displayName) {
      let newUser;
      if (!toSave || !toSave.uid) {
        return this.$q.reject(new Error('Did not receive valid user'));
      }
      newUser = {
        uid: toSave.uid,
        displayName: displayName,
        email: toSave.email,
        photoURL: this.generateImageUrl(toSave.email),
        provider: 'email'
      };
      return this.$q.resolve(
        this.usersRef
          .child(toSave.uid)
          .set(newUser)
          .then(() => newUser)
      );
    },

    login: function (method, email, pass) {
      let provider, loginPromise;

      switch (method) {
        case 'google':
          provider = new this.$window.firebase.auth.GoogleAuthProvider();
          this.GOOGLE_AUTH_SCOPES.forEach(scope => provider.addScope(scope));
          loginPromise = this.authObj.$signInWithPopup(provider);
          break;
        case 'email':
          loginPromise = this.authObj.$signInWithEmailAndPassword(email, pass);
          break;
        default:
          loginPromise = this.$q.reject('No login method was provided');
          break;
      }

      return loginPromise
        .then(() => this.waitForUser());
    },

    logout: function () {
      this.authObj.$signOut();
      delete this.currentUser;
    },

    linkUserToPlayer: function (player) {
      return this.usersRef
        .child(this.currentUser.uid)
        .child('playerId')
        .set(player.$id)
        .then(() => this.getUser(this.currentUser.uid))
        .then(() => player);
    },

    addSubscriptionId: function (subscriptionId) {
      var subscription = {
        subscriptionId: subscriptionId
      };
      this.waitForUser()
        .then(() => {
          if (!this.currentUser) {
            return;
          }
          return this.usersRef
            .child(this.currentUser.uid)
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
          if (!this.currentUser) {
            return;
          }
          return this.usersRef
            .child(this.currentUser.uid)
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
