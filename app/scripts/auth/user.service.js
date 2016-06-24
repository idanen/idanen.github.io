(function () {
  'use strict';

  angular
    .module('pokerManager.services')
    .service('userService', UserService);

  UserService.$inject = ['$q', '$window', '$firebaseAuth', 'Ref', '$firebaseObject', 'GOOGLE_AUTH_SCOPES'];
  function UserService($q, $window, $firebaseAuth, Ref, $firebaseObject, GOOGLE_AUTH_SCOPES) {
    var service = this,
        users = $firebaseObject(Ref.child('users'));

    service.login = login;
    service.logout = logout;
    service.waitForUser = waitForUser;
    service.getUser = getUser;
    service.setUserCommunities = setUserCommunities;
    service.addSubscriptionId = addSubscriptionId;
    service.removeSubscriptionId = removeSubscriptionId;
    service.authObj = $firebaseAuth();

    function login() {
      var provider = new $window.firebase.auth.GoogleAuthProvider();
      GOOGLE_AUTH_SCOPES.forEach(function (scope) {
        provider.addScope(scope);
      });
      return service.authObj.$signInWithPopup(provider)
        .then(service.waitForUser);
    }

    function logout() {
      service.authObj.$signOut();
      delete service.user;
    }

    function waitForUser() {
      return $q.when(service.authObj.$waitForSignIn())
        .then(function (user) {
          service.user = user;
          if (user) {
            users[user.uid] = user;
          }
          return service.user;
        });
    }

    function setUserCommunities(communitiesIds) {
      if (service.user) {
        service.user.communitiesIds = communitiesIds;
        return service.user;
      }
      return service.waitForUser()
        .then(function () {
          service.user.communitiesIds = communitiesIds;
          return service.user;
        });
    }

    function getUser() {
      return service.user;
    }

    function addSubscriptionId(subscriptionId) {
      var subscription = {
        subscriptionId: subscriptionId
      };
      service.waitForUser()
        .then(function () {
          Ref.child('users')
            .child(service.user.uid)
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
        });
    }

    function removeSubscriptionId(subscriptionId) {
      service.waitForUser()
        .then(function () {
          return Ref.child('users')
            .child(service.user.uid)
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
        });
    }
  }
}());
