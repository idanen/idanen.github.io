(function () {
  'use strict';

  angular
    .module('pokerManager')
    .controller('CommunitiesCtrl', CommunitiesController);

  CommunitiesController.$inject = ['communitiesSvc', 'userService', 'playerModal', 'Games', '$state', 'community', 'playersMembership'];
  function CommunitiesController(communitiesSvc, userService, playerModal, Games, $state, community, playersMembership) {
    this.pageSize = 3;
    this.currentPage = 0;
    this.fromDate = Date.now() - 1000 * 60 * 60 * 24 * 30;
    this.toDate = Date.now();
    this.userService = userService;
    this.playerModal = playerModal;
    this.Games = Games;
    this.$state = $state;
    this.community = community;
    this.playersMembership = playersMembership;

    this.collapseState = {};
    this.newCommunity = '';
    this.inputDisabled = false;
    this.communityDropdownOpen = false;
    this.communities = communitiesSvc.getCommunities();

    this.getCommunityGames(this.community);
  }

  CommunitiesController.prototype = {
    addMember: function (toCommunity) {
      this.playerModal.open()
        .then(player => this.playersMembership.addPlayer(player, toCommunity));
    },
    prevPage: function () {
      if (this.currentPage <= 0) {
        this.currentPage = 0;
        return;
      }
      this.currentPage -= this.pageSize;
    },
    nextPage: function () {
      if (this.currentPage + this.pageSize >= this.games.length) {
        this.currentPage = this.games.length - this.pageSize;
        return;
      }
      this.currentPage += this.pageSize;
    },

    loadStats: function () {
      this.$state.go('stats', {
        communityId: this.community.$id,
        fromDate: this.fromDate,
        toDate: this.toDate
      });
    },

    createGame: function (communityToAddTo) {
      return this.Games.newGame(communityToAddTo.$id, this.community.defaultGameSettings)
        .then(gameRef => this.$state.go('game', {communityId: communityToAddTo.$id, gameId: gameRef.key}, {reload: true}));
    },

    getCommunityGames: function (aCommunity) {
      this.games = this.Games.gamesOfCommunity(aCommunity.$id);
      this.games.$loaded()
        .then(() => {
          this.currentPage = this.games.length - this.pageSize;
        });
    },

    isCollapsed: function (communityId) {
      return this.collapseState[communityId];
    },

    toggleCollapsed: function (communityId) {
      this.collapseState[communityId] = !this.collapseState[communityId];
    },

    communitiesDropdownToggle: function () {
      this.communityDropdownOpen = !this.communityDropdownOpen;
    }
  };
}());
