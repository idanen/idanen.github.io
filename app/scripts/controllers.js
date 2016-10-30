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
      icon: 'icon-users',
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
      icon: 'icon-bar-chart'
    };
    this.gamesTab = {
      title: 'Select Game',
      icon: 'icon-spades',
      actions: [{
        title: 'New game'
      }]
    };

    this.userService.onUserChange(this.userChanged.bind(this));

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      if (toParams.communityId) {
        this.statsTab.href = $state.href('stats', {
          communityId: toParams.communityId,
          fromDate: Date.now() - DAY * 30,
          toDate: Date.now()
        });
      }
    }.bind(this));
  }

  MainController.prototype = {
    init: function () {
      this.tabs.push(this.communitiesTab);
      this.tabs.push(this.statsTab);
      this.tabs.push(this.gamesTab);
    },
    userChanged: function (currentUser) {
      this.currentUser = currentUser;
      if (!currentUser) {
        return;
      }

      this.obtainUserData();
      return this.currentUser;
    },
    obtainUserData: function () {
      if (!this.currentUser) {
        return;
      }
      this.communitiesForHrefs();
      this.gamesForHrefs();
    },
    communitiesForHrefs: function () {
      if (!this.currentUser || !this.currentUser.playerId) {
        return;
      }
      this.playersSvc.playersCommunities(this.currentUser.playerId)
        .then(communities => {
          this.communitiesTab.children = _.map(communities, (communityName, communityId) => {
            return {
              title: communityName,
              href: this.$state.href('community', {communityId: communityId})
            };
          });
        });
    },
    gamesForHrefs: function () {
      if (!this.currentUser || !this.currentUser.playerId) {
        return;
      }
      if (this.gamesOfPlayer && _.isFunction(this.gamesOfPlayer.$destroy)) {
        this.gamesOfPlayer.$destroy();
      }
      this.gamesOfPlayer = this.playersSvc.getPlayerGames(this.currentUser.playerId, 50);
      this.gamesOfPlayer.$loaded()
        .then(() => {
          this.gamesTab.children = this.gamesOfPlayer.map(game => {
            return {
              title: this.$filter('date')(game.date, 'yyyy-MM-dd') + ' @ ' + game.location,
              href: this.$state.href('game', {communityId: game.communityId, gameId: game.$id})
            };
          });
        });
    },
    signOut: function () {
      this.userService.logout();
      this.currentUser = null;
    },

    hasChildren: function (tab) {
      return tab.children && tab.children.length;
    },

    hasActions: function (tab) {
      return tab.actions && tab.actions.length;
    }
  };
}());
