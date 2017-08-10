(function () {
  'use strict';

  angular.module('pokerManager')
    .service('playersUsers', PlayersUsersService);

  PlayersUsersService.$inject = ['$q', 'Ref', 'Players', 'userService', '$firebaseAuth'];
  function PlayersUsersService($q, Ref, Players, userService, $firebaseAuth) {
    this.$q = $q;
    this.Ref = Ref;
    this.playersSvc = Players;
    this.userSvc = userService;
    this.authObj = $firebaseAuth();
  }

  PlayersUsersService.prototype = {
    createUser: function (name, email, pass) {
      return this.userSvc.createUser(name, email, pass)
        .then(savedUser => this.matchUserToPlayer(savedUser));
    },

    newProviderUser: function () {
      let authData = this.authObj.$getAuth(),
          profile = authData.providerData[0],
          newUser = {
            uid: authData.uid,
            displayName: profile.displayName || profile.email,
            email: profile.email,
            photoURL: profile.photoURL,
            provider: profile.providerId
          };
      return this.userSvc.saveUser(newUser, profile.displayName)
        .then(savedUser => this.matchUserToPlayer(savedUser));
    },

    matchUserToPlayer: function (user) {
      return this.$q.resolve(
        this.playersSvc.findBy('email', user.email)
          .then(player => this.playersSvc.addUser(user, player))
          .then(player => this.userSvc.linkUserToPlayer(player))
      );
    },

    updatePhotoURL: function (uid, photoURL) {
      return this.playersSvc.findBy('userUid', uid)
        .then(player => {
          const updates = {
            [`users/${uid}/photoURL`]: photoURL,
            [`players/${player.$id}/photoURL`]: photoURL
          };

          return this.Ref.update(updates);
        });
    }
  };
}());
