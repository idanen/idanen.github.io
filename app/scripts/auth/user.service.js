(function () {
  'use strict';

  angular
    .module('pokerManager.services')
    .service('userService', UserService);

  UserService.$inject = ['$q', 'Auth', 'Ref', '$firebaseObject', 'GOOGLE_AUTH_SCOPES'];
  function UserService($q, Auth, Ref, $firebaseObject, GOOGLE_AUTH_SCOPES) {
    var service = this,
        users = $firebaseObject(Ref.child('users'));

    service.login = login;
    service.logout = logout;
    service.waitForUser = waitForUser;
    service.getUser = getUser;
    service.setUserCommunities = setUserCommunities;
    service.addSubscriptionId = addSubscriptionId;

    function login(provider) {
      return Auth.$authWithOAuthPopup(provider || 'google', {
        remember: 'default',
        scope: GOOGLE_AUTH_SCOPES
      })
        .then(service.waitForUser);
    }

    function logout() {
      Auth.$unauth();
      delete service.user;
    }

    function waitForUser() {
      return $q.when(Auth.$waitForAuth())
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
          return Ref.child('users')
            .child(service.user.uid)
            .child('devices')
            .push().set(subscription);
        });
    }
  }
}());
