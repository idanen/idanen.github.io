(function () {
  'use strict';

  angular
    .module('pokerManager')
    .controller('CommunitiesCtrl', CommunitiesController);

  CommunitiesController.$inject = ['communitiesSvc', 'userService', 'Players', 'playerModal', 'Games', 'Ref', '$state', '$location', 'community', 'players'];
  function CommunitiesController(communitiesSvc, userService, Players, playerModal, Games, Ref, $state, $location, community, players) {
    var vm = this,
        collapseState = {};

    vm.prefs = {
      playersOpen: false
    };

    vm.pageSize = 3;
    vm.currentPage = 0;
    vm.fromDate = Date.now() - 1000 * 60 * 60 * 24 * 30;
    vm.toDate = Date.now();
    vm.openPlayersControl = openPlayersControl;
    vm.community = community;
    vm.players = players;
    vm.newCommunity = '';
    vm.inputDisabled = false;
    vm.communityDropdownOpen = false;
    vm.communities = communitiesSvc.communities;
    vm.add = add;
    vm.isCollapsed = isCollapsed;
    vm.toggleCollapsed = toggleCollapsed;
    vm.communitiesDropdownToggle = communitiesDropdownToggle;
    vm.userUid = userService.getUser() && userService.getUser().uid;
    vm.addMember = addMember;
    vm.createGame = createGame;
    vm.getCommunityGames = getCommunityGames;
    vm.loadStats = loadStats;

    vm.communities.$loaded().then(function () {
      vm.communities.forEach(function (aCommunity) {
        collapseState[aCommunity.$id] = true;
        vm.getCommunityGames(aCommunity);
      });
    });

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
      var communityToAdd = {},
          user = userService.getUser();
      if (vm.newCommunity) {
        communityToAdd.name = vm.newCommunity;
        vm.communities.$add(communityToAdd)
          .then(function (ref) {
            collapseState[ref.key()] = false;
            Players.findBy('userUid', user.uid).then(function (playerSnapshot) {
              var membership = {},
                  playerUid = playerSnapshot.key(),
                  player = playerSnapshot.val(),
                  admins = {};

              membership[ref.key()] = vm.newCommunity;
              playerSnapshot.ref().child('memberIn').set(membership);

              admins[playerUid] = player.name;
              ref.child('admins').set(admins);
              ref.child('members').set(admins);

              vm.newCommunity = '';
            });
          })
          .finally(function () {
            vm.inputDisabled = false;
          });
      }
    }

    function addMember(toCommunity) {
      playerModal.open()
        .then(function (player) {
          return communitiesSvc.addMember(player, toCommunity);
        });
    }

    function createGame(communityToAddTo) {
      return Games.newGame(communityToAddTo.$id)
        .then(function (game) {
          $state.go('game', {communityId: communityToAddTo.$id, gameId: game.$id}, {reload: true});
        });
    }

    function getCommunityGames(aCommunity) {
      aCommunity.games = Games.gamesOfCommunity(aCommunity.$id);
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
    prevPage: function () {
      if (this.currentPage === 0) {
        this.currentPage = this.community.games.length - this.pageSize;
        return;
      }
      this.currentPage -= this.pageSize;
    },
    nextPage: function () {
      this.currentPage = (this.currentPage + this.pageSize) % this.community.games.length;
    }
  };
}());
