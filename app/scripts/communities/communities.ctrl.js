(function () {
  'use strict';

  angular
    .module('pokerManager')
    .controller('CommunitiesCtrl', CommunitiesController);

  CommunitiesController.$inject = ['communitiesSvc', 'userService', 'playerModal', 'Games', '$state', 'community', 'playersMembership', 'playersUsers'];
  function CommunitiesController(communitiesSvc, userService, playerModal, Games, $state, community, playersMembership, playersUsers) {
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
    this.playersUsers = playersUsers;

    this.collapseState = {};
    this.newCommunity = '';
    this.defaultGameSettings = {};
    this.inputDisabled = false;
    this.communitiesSvc = communitiesSvc;
    this.communities = this.communitiesSvc.getCommunities();

    this.getCommunityGames(this.community);
    this.getCommunityJoiners(this.community);

    this.userService.onUserChange(currentUser => this.userChanged(currentUser));
  }

  CommunitiesController.prototype = {
    addMember: function (toCommunity) {
      this.playerModal.open()
        .then(player => this.playersMembership.addPlayer(player, toCommunity));
    },
    prevPage: function () {
      if (this.currentPage - this.pageSize <= 0) {
        this.currentPage = 0;
        return;
      }
      this.currentPage -= this.pageSize;
    },
    nextPage: function () {
      if (this.currentPage + this.pageSize >= this.games.length) {
        // this.currentPage = this.games.length - this.pageSize;
        return;
      }
      this.currentPage += this.pageSize;
    },

    userChanged: function (currentUser) {
      this.currentUser = currentUser;
      this.updateIsMember();
    },

    updateIsMember: function () {
      if (this.currentUser) {
        this.communitiesSvc.isMember(this.currentUser.playerId, this.community.$id)
          .then(isMember => {
            this.isMember = isMember;
          });
        this.communitiesSvc.isAdmin(this.currentUser.playerId, this.community.$id)
          .then(isAdmin => {
            this.isAdmin = isAdmin;
          });
      } else {
        this.isMember = false;
        this.isAdmin = false;
      }
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

    confirmPlayer: function (joiner) {
      return this.playersMembership.confirmJoiningPlayer(joiner.uid, this.community);
    },

    getCommunityJoiners: function (aCommunity) {
      this.joiners = this.communitiesSvc.getJoiners(aCommunity.$id);
    },

    isCollapsed: function (communityId) {
      return this.collapseState[communityId];
    },

    toggleCollapsed: function (communityId) {
      this.collapseState[communityId] = !this.collapseState[communityId];
    }
  };
}());
