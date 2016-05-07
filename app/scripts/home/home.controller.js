(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('HomeCtrl', HomeController);

  HomeController.$inject = ['communities', 'communitiesSvc'];
  function HomeController(communities, communitiesSvc) {
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
