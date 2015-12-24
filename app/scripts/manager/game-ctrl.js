(function () {
  'use strict';

  /**
   * Game controller
   */
  angular.module('pokerManager').
    controller('GameCtrl', GameController);

  GameController.$inject = ['$scope', '$analytics', 'Games'];

  function GameController($scope, $analytics, Game) {
    var vm = this,
        emptyGame = {
          location: '',
          date: Date.now(),
          numberOfHands: 0,
          chipValue: 4,
          defaultBuyin: 50,
          maxBuyin: 400,
          players: {}
        };

    vm.dateOptions = {
      'year-format': '\'yyyy\'',
      'month-format': '\'MM\'',
      'day-format': '\'dd\''
    };

    vm.initGame = initGame;
    vm.clearGame = clearGame;
    vm.buyin = buyin;
    vm.startGame = startGame;
    vm.cancelBuyin = cancelBuyin;
    vm.cancelAddPlayer = cancelAddPlayer;
    vm.bust = bust;
    vm.buyout = buyout;
    vm.comeBack = comeBack;
    vm.chipCountUpdate = chipCountUpdate;
    vm.addOrSubtractChips = addOrSubtractChips;
    vm.totalBuyin = totalBuyin;
    vm.totalChips = totalChips;
    vm.totalHosting = totalHosting;
    vm.toggleGameDate = toggleGameDate;
    vm.isGameInProgress = isGameInProgress;
    vm.saveGame = saveGame;
    vm.playersCount = playersCount;

    function initGame() {
      Object.keys(vm.game.players).forEach(function (playerId) {
        delete vm.game.players[playerId];
      });
      angular.extend(vm.game, emptyGame);

      // vm.game = new Game();

      // angular.element.extend( vm.game, ( angular.isDefined( $scope.game ) ) ?
      // 	$scope.game :
      // 	Game.create()
      // );

      // delete vm.game.id;
    }

    function clearGame() {
      // Reset is-playing state
      _.forEach(vm.game.players, function (player) {
        player.isPlaying = false;
        // player.balance += ( player.buyout - player.buyin );
      });
      Object.keys(vm.game.players).forEach(function (playerId) {
        delete vm.game.players[playerId];
      });
      angular.extend(vm.game, emptyGame);
    }

    function buyin(player, rationalBuyin) {
      var calculatedBuyin = rationalBuyin * vm.game.defaultBuyin;
      player.buyin += calculatedBuyin;
      // player.balance -= player.buyin;
      player.currentChipCount = parseInt(player.currentChipCount, 10) + calculatedBuyin * vm.game.chipValue;
      player.buyout = player.currentChipCount / vm.game.chipValue;

      try {
        $analytics.eventTrack('Buyin', {category: 'Actions', label: player.name});
      } catch (err) {}
    }

    function startGame() {
      _.forEach(vm.game.players, function (player) {
        vm.buyin(player, 1);
      });
    }

    function cancelBuyin(player, rationalBuyin) {
      var actualBuyin = rationalBuyin * vm.game.defaultBuyin;
      player.buyin -= actualBuyin;
      // player.balance += player.buyin;
      player.currentChipCount = parseInt(player.currentChipCount, 10) - actualBuyin * vm.game.chipValue;
      player.buyout = player.currentChipCount / vm.game.chipValue;
    }

    function cancelAddPlayer(player) {
      if (player.id in vm.game.players) {
        delete vm.game.players[player.id];
      }
      // Remove from current game
      // var index = vm.game.players.indexOf( player );
      //
      // if ( index > -1 ) {
      //	vm.game.players.splice( index, 1 );
      //
      //	// Reset fields
      //	if ( player ) {
      //		player.isPlaying = false;
      //		player.balance += ( player.buyout - player.buyin );
      //		player.buyin = 0;
      //		player.buyout = 0;
      //		player.currentChipCount = 0;
      //		player.paidHosting = false;
      //	}
      // }
    }

    function bust(player) {
      player.currentChipCount = 0;
      vm.buyout(player);
    }

    function buyout(player) {
      if (player.isPlaying) {
        player.isPlaying = false;
      }

      // Add payout to player's balance
      player.buyout = player.currentChipCount / vm.game.chipValue;
      // player.balance += player.buyout;
    }

    function comeBack(player) {
      if (!player.isPlaying) {
        player.isPlaying = true;
      }

      // Add payout to player's balance
      // player.balance -= player.buyout;
    }

    function chipCountUpdate(player) {
      player.buyout = player.currentChipCount / vm.game.chipValue;
    }

    function addOrSubtractChips(player, howMany, toAdd) {
      if (toAdd) {
        player.currentChipCount += howMany * vm.game.defaultBuyin;
      } else {
        player.currentChipCount -= howMany * vm.game.defaultBuyin;
      }
      vm.chipCountUpdate(player);
    }

    function playersCount() {
      if (!vm.game.players) {
        return 0;
      }
      return Object.keys(vm.game.players).length;
    }

    function totalBuyin() {
      return _.sum(vm.game.players, 'buyin');
    }

    function totalChips() {
      return _.sum(vm.game.players, 'currentChipCount');
    }

    function totalHosting() {
      var sum = 0;
      if (!vm.game.players) {
        return 0;
      }

      _.forEach(vm.game.players, function (player) {
        sum += player.paidHosting ? 10 : 0;
      });
      return sum;
    }

    function toggleGameDate($event) {
      $event.preventDefault();
      $event.stopPropagation();

      vm.game.dateOpen = !vm.game.dateOpen;
    }

    function isGameInProgress() {
      return vm.game.players && _.some(vm.game.players, 'isPlaying');
    }

    function saveGame() {
      Game.save(vm.game).$promise.then(function gameSaveSuccess(data) {
        if (angular.isFunction($scope.saveSuccessCallback)) {
          vm.saveSuccessCallback(data);
        }
      }).catch(function gameSaveFail(err) {
        if (angular.isFunction($scope.saveFailCallback)) {
          vm.saveFailCallback(err);
        }
      });
    }
  }
}());
