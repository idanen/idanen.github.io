/* Controllers */
(function () {
  'use strict';
  angular.module('pokerManager.controllers', ['pokerManager.services'])
    .controller('MainCtrl', MainController);

  MainController.$inject = ['$scope', '$state', '$filter', 'userService', 'Players', 'communitiesSvc'];
  function MainController($scope, $state, $filter, userService, playersSvc, communitiesSvc) {
    var DAY = 1000 * 60 * 60 * 24;

    this.$state = $state;
    this.$filter = $filter;
    this.userService = userService;
    this.playersSvc = playersSvc;
    this.communitiesSvc = communitiesSvc;

    this.tabs = [];
    this.communitiesTab = {
      title: 'communities',
      icon: 'fa-users',
      children: [],
      actions: [{
        title: 'Add or join'
        // ,
        // action: $state.go('addCommunity')
      }]
    };
    this.statsTab = {
      title: 'Stats',
      href: $state.href('stats', {fromDate: Date.now() - DAY * 30, toDate: Date.now()}),
      icon: 'fa-bar-chart'
    };
    this.gamesTab = {
      title: 'Select Game',
      icon: 'icon-spades',
      actions: [{
        title: 'New game'
      }]
    };

    this.userService.waitForUser()
      .then(this.userFeched.bind(this))
      .then(this.obtainUserData.bind(this));

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      if (toParams.communityId) {
        this.statsTab.href = $state.href('stats', {
          communityId: toParams.communityId,
          fromDate: Date.now() - DAY * 30,
          toDate: Date.now()
        });
      }

      // TODO (idan): When entering a new game's state set the game's id to the current game state
      // adminTab.href = $state.href('game', {
      //   communityId: toParams.communityId,
      //   gameId: toParams.gameId,
      //   fromDate: Date.now() - DAY * 30,
      //   toDate: Date.now()
      // });
    }.bind(this));
  }

  MainController.prototype = {
    init: function () {
      this.tabs.push(this.communitiesTab);
      this.tabs.push(this.statsTab);
      this.tabs.push(this.gamesTab);
      this.fetchPublicCommunities();
    },
    userFeched: function (currentUser) {
      if (!currentUser) {
        return;
      }

      this.currentUser = currentUser;
      return this.currentUser;
    },
    obtainUserData: function () {
      if (!this.currentUser) {
        return;
      }
      this.playersSvc.playersCommunities(this.currentUser.playerId)
        .then(communities => {
          this.communitiesTab.children = this.communitiesTab.children.concat(_.map(communities, (communityName, communityId) => {
            return {
              title: communityName,
              href: this.$state.href('community', {communityId: communityId})
            };
          }));
        });
      this.gamesOfPlayer = this.playersSvc.getPlayerGames(this.currentUser.playerId, 50);
      this.gamesOfPlayer.$loaded()
        .then(() => {
          this.gamesTab.children = this.gamesOfPlayer.map(game => {
            return {
              title: this.$filter('date')(game.date, 'yyyy-MM-dd') + ' @ ' + game.location,
              href: this.$state.href('game', {communityId: this.$state.params.communityId, gameId: game.$id})
            };
          });
        });
    },
    signOut: function () {
      this.userService.logout();
      this.currentUser = null;
    },

    addPublicCommunities: function (publicCommunities) {
      if (!this.communitiesTab.children) {
        this.communitiesTab.children = [];
      }
      this.communitiesTab.children = this.communitiesTab.children.concat(_.map(publicCommunities, (communityName, communityId) => {
        return {
          title: communityName,
          href: this.$state.href('community', {communityId: communityId})
        };
      }));
    },

    fetchPublicCommunities: function () {
      return this.communitiesSvc.getPublicCommunities()
        .then(this.addPublicCommunities.bind(this));
    },

    hasChildren: function (tab) {
      return tab.children && tab.children.length;
    },

    hasActions: function (tab) {
      return tab.actions && tab.actions.length;
    }
  };
}());
