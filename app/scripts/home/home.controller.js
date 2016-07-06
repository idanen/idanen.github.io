(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('HomeCtrl', HomeController);

  HomeController.$inject = ['communitiesSvc'];
  function HomeController(communitiesSvc) {
    var vm = this;

    vm.communities = communitiesSvc.getCommunities();
    vm.communitiesSvc = communitiesSvc;
  }

  HomeController.prototype = {
    prepareJoinCommunity: function () {
      this.joinFormVisible = true;
    },
    joinCommunity: function (communityInvitationKey) {
      this.communitiesSvc.joinCommunity(communityInvitationKey);
    }
  };
}());
