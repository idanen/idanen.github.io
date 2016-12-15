(function () {
  'use strict';

  /**
   * Game controller
   */
  angular.module('pokerManager')
    .controller('GameCtrl', GameController);

  GameController.$inject = ['$element', '$analytics', 'Games', 'playersGames', 'Players', 'userService', '$state'];
  function GameController($element, $analytics, gamesSvc, playersGames, Players, userService, $state) {
    this.$element = $element;
    this.$analytics = $analytics;
    this.playersGames = playersGames;
    this.playersSvc = Players;
    this.gamesSvc = gamesSvc;
    this.userService = userService;
    this.game = this.gamesSvc.getGame(this.gameId);
    this.playersInGame = playersGames.getPlayersInGame(this.gameId);
    this.attendingPlayers = playersGames.getApprovalsForGame(this.gameId);
    this.$state = $state;

    this.guests = 0;

    this.game.$loaded()
      .then(() => {
        if (!this.game.chipValue) {
          this.game.chipValue = 1;
        }
        if (!this.game.defaultBuyin) {
          this.game.defaultBuyin = 50;
        }
        if (!this.game.hostingCosts) {
          this.game.hostingCosts = 10;
        }
        if (!this.game.allowedGuests) {
          this.game.allowedGuests = 1;
        }
      });

    this.attendingPlayers.$loaded()
      .then(this.buildAttendanceCounts.bind(this));
  }

  GameController.prototype = {
    $onChanges: function (changes) {
      if (changes.gameId && changes.gameId.previousValue !== this.gameId) {
        this.game = this.gamesSvc.getGame(this.gameId);
      }
    },
    $postLink: function () {
      this.$element.find('.game-approve-panel').on('tap', 'paper-button', this.changeAttendance.bind(this));
    },

    changeAttendance: function (evt) {
      let currentUser = this.userService.getCurrentUser(),
          attendance;

      if (currentUser) {
        this.playersSvc.getPlayer(currentUser.playerId, true)
          .then(player => {
            let selectedBtn = angular.element(evt.target).closest('paper-button');
            attendance = selectedBtn.length && selectedBtn[0].dataset.answer;
            this.playersGames.changePlayerApproval({
              gameId: this.gameId,
              playerId: currentUser.playerId,
              player,
              attendance: attendance || 'no',
              guests: this.guests
            })
              .then(attendingPlayers => {
                this.guests = 0;

                if (this.attendingPlayers && _.isFunction(this.attendingPlayers.$destroy)) {
                  this.attendingPlayers.$destroy();
                  this.attendingPlayers = null;
                }

                this.attendingPlayers = attendingPlayers;
                this.attendingPlayers.$loaded()
                  .then(this.buildAttendanceCounts.bind(this));
              });
          });
      }
    },

    buildAttendanceCounts: function () {
      this.attendanceCount = this.attendingPlayers.reduce((attendanceCount, attending) => {
        attendanceCount[attending.attendance] += 1;

        return attendanceCount;
      }, {
        yes: 0,
        maybe: 0,
        no: 0
      });
    },

    initGame: function () {
      this.playersGames.removeAllPlayersFromGame(this.gameId);
      this.game.location = '';
      this.game.date = Date.now();
      this.game.numberOfHands = 0;
      this.game.chipValue = 4;
      this.game.defaultBuyin = 50;
      this.game.maxBuyin = 400;
      this.game.hostingCosts = 10;
    },
    clearGame: function () {
      this.initGame();
    },
    deleteGame: function () {
      this.gamesSvc.deleteGame(this.gameId)
        .then(() => this.$state.go('^', {}, {location: 'replace'}));
    },
    buyin: function (player, rationalBuyin) {
      let calculatedBuyin = rationalBuyin * this.game.defaultBuyin;
      player.buyin += calculatedBuyin;
      // player.balance -= player.buyin;
      player.currentChipCount = parseInt(player.currentChipCount, 10) + calculatedBuyin * this.game.chipValue;
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playerResultUpdated(player);

      try {
        this.$analytics.eventTrack('Buyin', {category: 'Actions', label: player.displayName});
      } catch (err) {}
    },
    startGame: function () {
      let playersIds = this.attendingPlayers.reduce((ids, attending) => {
        if (attending.attendance !== 'no') {
          ids.push(attending.$id);
        }
        return ids;
      }, []);
      this.onGameStart({$event: playersIds});
      // _.forEach(this.playersInGame, player => this.buyin(player, 1));
    },
    cancelBuyin: function (player, rationalBuyin) {
      let actualBuyin = rationalBuyin * this.game.defaultBuyin;
      player.buyin -= actualBuyin;
      // player.balance += player.buyin;
      player.currentChipCount = parseInt(player.currentChipCount, 10) - actualBuyin * this.game.chipValue;
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playerResultUpdated(player);
    },

    updatePlayersInGame: function (updated) {
      if (this.playersInGame && _.isFunction(this.playersInGame.$destroy)) {
        this.playersInGame.$destroy();
      }
      this.playersInGame = updated;
    },

    gameSettingsChanged: function (newSettings) {
      let chipValueUpdated = this.game.chipValue !== newSettings.chipValue;
      _.extend(this.game, newSettings);
      this.game.$save();
      if (chipValueUpdated) {
        this.gamesSvc.chipsValueUpdated(this.game);
      }
    },

    gameDetailsChanged: function (newDetails) {
      let dateChanged = this.game.date !== newDetails.date;
      _.extend(this.game, newDetails);
      this.game.$save();
      if (dateChanged) {
        this.gamesSvc.dateUpdated(this.game);
      }
    },

    cancelAddPlayer: function (player) {
      this.playersGames.removePlayerFromGame(player.$id, this.gameId);
    },

    buyout: function (player) {
      if (player.isPlaying) {
        player.isPlaying = false;
      }

      // Add payout to player's balance
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playerResultUpdated(player);
    },

    bust: function (player) {
      player.currentChipCount = 0;
      this.buyout(player);
    },

    comeBack: function (player) {
      if (!player.isPlaying) {
        player.isPlaying = true;
        player.currentChipCount = player.buyout * this.game.chipValue;
        this.playerResultUpdated(player);
      }
    },

    addOrSubtractChips: function (player, howMany, toAdd) {
      if (toAdd) {
        player.currentChipCount += howMany * this.game.defaultBuyin * this.game.chipValue;
      } else {
        player.currentChipCount -= howMany * this.game.defaultBuyin * this.game.chipValue;
      }
      this.chipCountUpdate(player);
    },

    chipCountUpdate: function (player) {
      player.buyout = player.currentChipCount / this.game.chipValue;
      this.playerResultUpdated(player);
    },

    totalBuyin: function () {
      return _.sumBy(this.playersInGame, 'buyin');
    },

    totalChips: function () {
      return _.sumBy(this.playersInGame, 'currentChipCount');
    },

    totalHosting: function () {
      if (!this.playersInGame) {
        return 0;
      }

      return _.reduce(this.playersInGame, (sum, player) => {
        sum += player.paidHosting ? this.game.hostingCosts : 0;
        return sum;
      }, 0);
    },

    toggleGameDate: function ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      this.game.dateOpen = !this.game.dateOpen;
    },

    isGameInProgress: function () {
      return this.playersInGame && _.some(this.playersInGame, 'isPlaying');
    },

    numberOfHandsUpdated: function (counter) {
      this.game.numberOfHands = counter || 0;
      this.game.$save();
    },

    playerResultUpdated: function (player) {
      // this.playersInGame.$save(player);
      return this.playersGames.updatePlayerResult(player, this.game, player);
    }
  };
}());
