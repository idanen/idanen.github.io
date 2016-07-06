(function () {
  'use strict';

  /**
   * Game Manager controller
   */
  angular.module('pokerManager')
    .controller('PokerManagerCtrl', PokerManagerController);

  PokerManagerController.$inject = ['$scope', '$analytics', 'toaster', 'Utils', 'Players', 'playerModal', 'communitiesSvc', 'community', 'game', 'Games'];

  function PokerManagerController($scope, $analytics, toaster, utils, Players, playerModal, communitiesSvc, community, game, Games) {
    var vm = this;

    vm.community = community;
    vm.prefs = {
      playersOpen: false
    };
    vm.dateOptions = {
      'year-format': '\'yyyy\'',
      'month-format': '\'MM\'',
      'day-format': '\'dd\''
    };
    vm.today = new Date();
    vm.serverMsg = [];
    vm.players = [];
    // init game so not all methods fail before the game is loaded
    vm.game = {};
    // Binding the firebase instance to the scope. This assumes that the controller's name is `vm`
    Games.getGame(game.$id).$bindTo($scope, 'vm.game');

    vm.init = init;
    vm.openPlayersControl = openPlayersControl;
    vm.closePlayersControl = closePlayersControl;
    vm.saveGameToLocalStorage = saveGameToLocalStorage;
    vm.loadLocalStorageGame = loadLocalStorageGame;
    vm.refreshPlayersList = refreshPlayersList;
    vm.clearCurrentGame = clearCurrentGame;
    vm.addServerMsg = addServerMsg;
    vm.closeServerMsg = closeServerMsg;
    vm.addPlayerToGame = addPlayerToGame;
    vm.gameSaved = gameSaved;
    vm.saveGameFailed = saveGameFailed;
    vm.openPlayerDetailsDialog = openPlayerDetailsDialog;
    vm.chipsValueChanged = chipsValueChanged;

    vm.init();

    function openPlayersControl() {
      vm.prefs.playersOpen = !vm.prefs.playersOpen;
    }

    function closePlayersControl() {
      vm.prefs.playersOpen = false;
    }

    function saveGameToLocalStorage() {
      var copy = angular.extend({}, vm.game),
          key;
      for (key in copy) {
        if (copy.hasOwnProperty(key) && (/^\$/).test(key)) {
          delete copy[key];
        }
      }
      utils.saveLocal('game', copy);
    }

    function loadLocalStorageGame() {
      var oldChipValue = vm.game.chipValue,
          newChipValue,
      //  isPlaying,
          buyin, buyout, currentChipCount, paidHosting, i, foundPlayer;

      function playerEntity(aPlayer) {
        var found;
        found = vm.players.filter(function (player) {
          return player.name === aPlayer.name;
        });

        return found && found[0];
      }

      angular.extend(vm.game, utils.loadLocal('game'));
      newChipValue = parseInt(vm.game.chipValue, 10);
      // Players in game should be with same reference as players returned by the server
      for (i = 0; i < vm.game.players.length; ++i) {
        foundPlayer = playerEntity(vm.game.players[i]);

        if (foundPlayer) {
          // Copy fields from saved game
          // isPlaying = vm.game.players[ i ].isPlaying,
          buyin = vm.game.players[i].buyin;
          buyout = vm.game.players[i].buyout;
          currentChipCount = vm.game.players[i].currentChipCount * oldChipValue !== newChipValue ? oldChipValue / newChipValue : 1;
          paidHosting = vm.game.players[i].paidHosting;

          // Assign reference
          vm.game.players[i] = foundPlayer;
          // Assign values from copied fields
          vm.game.players[i].isPlaying = true;
          vm.game.players[i].buyin = buyin;
          vm.game.players[i].buyout = buyout;
          vm.game.players[i].currentChipCount = currentChipCount;
          vm.game.players[i].paidHosting = paidHosting;
        }
      }
    }

    function init() {
      // Refresh view
      vm.players = Players.playersOfCommunity(vm.community.$id);
    }

    function refreshPlayersList() {
      vm.init();
    }

    function clearCurrentGame() {
      // Reset is-playing state
      _.forEach(vm.players, function (player) {
        player.isPlaying = false;
      });

      // Reset game
      // vm.game = Games.create();
      vm.game.location = '';
      vm.game.date = Date.now();
      vm.game.numberOfHands = 0;
      vm.game.players = [];

      // Save empty game as local
      // vm.saveGameToLocalStorage();
    }

    function addServerMsg(msg) {
      vm.serverMsg.push(msg);
    }

    function closeServerMsg(index) {
      vm.serverMsg.splice(index, 1);
    }

    function addPlayerToGame(player) {
      var playerInGame = {};
      if (!vm.game.players) {
        vm.game.players = [];
      }
      if (!(player.$id in vm.game.players)) {
        player.isPlaying = true;
        playerInGame.$id = player.$id;
        playerInGame.name = player.name;
        playerInGame.isPlaying = true;
        playerInGame.buyin = 0;
        playerInGame.buyout = 0;
        playerInGame.currentChipCount = 0;
        playerInGame.communityId = community.$id;
        playerInGame.paidHosting = false;
        vm.game.players.push(playerInGame);
      }

      try {
        $analytics.eventTrack('Join Game', {category: 'Actions', label: player.name});
      } catch (err) {}
    }

    function gameSaved() {
      vm.init();
      vm.clearCurrentGame();

      // vm.addServerMsg({
      // 	txt: 'Game saved successfully',
      // 	type: 'success'
      // });
      toaster.success('Game save successfully', 'Woo-Hoo!');
    }

    function saveGameFailed(err) {
      vm.addServerMsg({
        txt: 'Error saving Game: ' + err,
        type: 'error'
      });
    }

    function openPlayerDetailsDialog(player) {
      vm.closePlayersControl();

      playerModal.open(player)
        .then(function (savedPlayer) {
          // If new -> update default values
          if (savedPlayer.isNew) {
            savedPlayer.buyin = 0;
            savedPlayer.isPlaying = false;
          }

          player = savedPlayer;

          return communitiesSvc.addMember(player, community);
        })
        .then(init);
    }

    $scope.$watch(function () {
      return vm.game;
    }, function (newVal, oldVal) {
      // When game is loaded the $watch is called even if the new and old values are the same - preventing it here by comparing them
      if (!angular.equals(newVal, oldVal)) {
        // vm.saveGameToLocalStorage();
        _.forEach(vm.game.players, function (gameResult) {
          Players.saveResult(gameResult, vm.game);
        });
        _.forEach(oldVal.players, function (gameResult) {
          if (!((gameResult.$id || gameResult.id) in vm.game.players)) {
            Players.deleteResult(gameResult, oldVal);
          }
        });

        if (newVal && oldVal && newVal.chipValue !== oldVal.chipValue) {
          chipsValueChanged(newVal.chipValue, oldVal.chipValue);
        }
      }
    }, true);

    // $scope.$watch( function () {
    //	return vm.game.chipValue;
    // }, chipsValueChanged );

    function chipsValueChanged(current, previous) {
      if (!current) {
        current = vm.game.chipValue = 1;
      }
      if (vm.game.players) {
        _.forEach(vm.game.players, function updateChipsAndValue(player) {
          if (player.currentChipCount) {
            player.currentChipCount = player.currentChipCount * current / (previous || 1);
          } else {
            player.currentChipCount = player.buyin * current * current / (previous || 1);
          }
        });
      }
    }
  }
}());
