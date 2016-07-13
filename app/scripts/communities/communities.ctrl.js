(function () {
  'use strict';

  angular
    .module('pokerManager')
    .controller('CommunitiesCtrl', CommunitiesController);

  CommunitiesController.$inject = ['communitiesSvc', 'userService', 'playerModal', 'Games', '$state', 'community', 'Players', 'playersMembership'];
  function CommunitiesController(communitiesSvc, userService, playerModal, Games, $state, community, Players, playersMembership) {
    var vm = this,
        collapseState = {};

    vm.prefs = {
      playersOpen: false
    };

    vm.fromDate = Date.now() - 1000 * 60 * 60 * 24 * 30;
    vm.toDate = Date.now();
    vm.openPlayersControl = openPlayersControl;
    vm.playerModal = playerModal;
    vm.community = community;
    vm.players = Players.playersOfCommunity(community.$id);
    vm.playersMembership = playersMembership;
    vm.newCommunity = '';
    vm.inputDisabled = false;
    vm.communityDropdownOpen = false;
    vm.communities = communitiesSvc.communities;
    vm.add = add;
    vm.isCollapsed = isCollapsed;
    vm.toggleCollapsed = toggleCollapsed;
    vm.communitiesDropdownToggle = communitiesDropdownToggle;
    vm.createGame = createGame;
    vm.getCommunityGames = getCommunityGames;
    vm.loadStats = loadStats;

    vm.getCommunityGames(vm.community);

    function openPlayersControl() {
      vm.prefs.playersOpen = !vm.prefs.playersOpen;
    }

    function loadStats() {
      $state.go('stats', {
        communityId: community.$id,
        fromDate: vm.fromDate,
        toDate: vm.toDate
      });
    }

    function add() {
      var communityToAdd = {};
      vm.inputDisabled = true;
      if (vm.newCommunity) {
        communityToAdd.name = vm.newCommunity;
        vm.communities.$add(communityToAdd)
          .then(function (ref) {
            collapseState[ref.key] = false;
            communityToAdd.$id = ref.key;
            return userService.waitForUser();
          })
          .then(function (user) {
            return vm.playersMembership.setAdminOfCommunity(communityToAdd, user.uid);
          })
          .finally(function () {
            vm.inputDisabled = false;
          });
      }
    }

    function createGame(communityToAddTo) {
      return Games.newGame(communityToAddTo.$id)
        .then(function (game) {
          $state.go('game', {communityId: communityToAddTo.$id, gameId: game.$id}, {reload: true});
        });
    }

    function getCommunityGames(aCommunity) {
      // aCommunity.games = Games.gamesOfCommunity(aCommunity.$id);
      vm.games = Games.gamesOfCommunity(aCommunity.$id);
    }

    function isCollapsed(communityId) {
      return collapseState[communityId];
    }

    function toggleCollapsed(communityId) {
      collapseState[communityId] = !collapseState[communityId];
    }

    function communitiesDropdownToggle() {
      vm.communityDropdownOpen = !vm.communityDropdownOpen;
    }
  }

  CommunitiesController.prototype = {
    addMember: function (toCommunity) {
      this.playerModal.open()
        .then(function (player) {
          this.playersMembership.addPlayer(player, toCommunity)
        }.bind(this));
    }
  };
}());
