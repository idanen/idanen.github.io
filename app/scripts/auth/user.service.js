(function () {
  'use strict';

  angular
    .module('pokerManager.services')
    .service('userService', UserService)
    .constant('USER_DOESNT_EXIST_ERROR', 'USER_LOGGED_IN_DOESNT_EXIST');

  UserService.$inject = ['$q', '$window', '$firebaseAuth', 'Ref', 'GOOGLE_AUTH_SCOPES', 'USER_DOESNT_EXIST_ERROR'];
  function UserService($q, $window, $firebaseAuth, Ref, GOOGLE_AUTH_SCOPES, USER_DOESNT_EXIST_ERROR) {
    this.$q = $q;
    this.$window = $window;
    this.authObj = $firebaseAuth();
    this.rootRef = Ref;
    this.usersRef = Ref.child('users');
    this.GOOGLE_AUTH_SCOPES = GOOGLE_AUTH_SCOPES;
    this.USER_DOESNT_EXIST_ERROR = USER_DOESNT_EXIST_ERROR;

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
            if (!snap.exists()) {
              return this.$q.reject(new Error(this.USER_DOESNT_EXIST_ERROR));
            }
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
        promise = this.$q.reject(new Error('Not logged in yet'));
      } else {
        promise = this.getUser(authState.uid)
          .then(user => {
            this.currentUser = user;
            return this.currentUser;
          });
      }

      return promise
        .then(() => this.notifyUserListeners())
        .catch(() => this.notifyUserListeners());
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
      return this.currentUser;
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
        photoURL: toSave.photoURL || this.generateImageUrl(toSave.email),
        provider: toSave.provider || 'email'
      };
      return this.$q.resolve(
        this.usersRef
          .child(toSave.uid)
          .set(newUser)
          .then(() => {
            this.currentUser = newUser;
            return this.currentUser;
          })
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
        .then(authData => this.getUser(authData.user.uid));
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
        .then(() => this.getUser(this.currentUser.uid));
    },

    checkSubscriptionId: function (subscriptionId) {
      if (!this.currentUser) {
        throw new Error('This should be called after current user login has finished. Try using `waitForUser()`');
      }
      return this.usersRef
        .child(this.currentUser.uid)
        .child('devices')
        .orderByChild('subscriptionId')
        .equalTo(subscriptionId)
        .once('value')
        .then(snap => snap.exists());
    },

    addSubscriptionId: function (subscriptionId) {
      let subscription = {
        subscriptionId: subscriptionId
      };
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
            return snapshot.ref.push().set(subscription);
          }

          console.log(`the endpoint "${subscriptionId}" is already subscribed`);
          return subscription;
        });
    },

    removeSubscriptionId: function (subscriptionId) {
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
    }
  };
}());
