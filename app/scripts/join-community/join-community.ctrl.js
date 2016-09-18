(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('JoinCommunityCtrl', JoinCommunityController);

  JoinCommunityController.$inject = ['$stateParams', 'communitiesSvc'];
  function JoinCommunityController($stateParams, communitiesSvc) {
    this.community = communitiesSvc.getCommunity($stateParams.communityId);
    this.joinCode = $stateParams.joinCode;
  }
}());
