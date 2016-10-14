(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('JoinCommunityCtrl', JoinCommunityController);

  JoinCommunityController.$inject = ['$stateParams', 'communitiesSvc', 'userService'];
  function JoinCommunityController($stateParams, communitiesSvc, userService) {
    this.community = communitiesSvc.getCommunity($stateParams.communityId);
    this.joinCode = $stateParams.joinCode;
    this.userService = userService;

    this.userService.onUserChange(user => this.userChanged(user));
  }

  JoinCommunityController.prototype = {
    userChanged: function (user) {
      this.currentUser = user;
    },

    signUp: function (email, password, name) {},

    login: function (method) {}
  };
}());
