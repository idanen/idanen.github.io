(function () {
  'use strict';

  class RSVPController {
    static get $inject() {
      return ['$element', 'Games', 'Players', 'communitiesSvc', 'playersGames', '$filter', '$q', 'gameLocationDialogSvc'];
    }
    constructor($element, Games, Players, communitiesSvc, playersGames, $filter, $q, gameLocationDialogSvc) {
      this.$element = $element;
      this.gamesSvc = Games;
      this.playersSvc = Players;
      this.communitiesSvc = communitiesSvc;
      this.playersGames = playersGames;
      this.$filter = $filter;
      this.$q = $q;
      this.gameLocationDialogSvc = gameLocationDialogSvc;

      this.dateFormat = 'EEE, dd/MM/yyyy';

      this.availableAnswers = ['yes', 'maybe', 'no'];
      this.playerAttendance = {
        attendance: '',
        message: '',
        guests: 0
      };
      // Need to wait for player details
      this.canChangeAttendance = false;

      this.YESTERDAY = Date.now() - 1000 * 60 * 60 * 24;
    }

    $onInit() {
      this.attendanceInputs = this.$element.find('.form-control');

      this.games = this.gamesSvc.gamesOfCommunity(this.communityId, 15);
      this.games.$watch(this._mapGamesForPicker.bind(this));

      if (this.currentUser && this.currentUser.playerId) {
        this.currentPlayer = this.playersSvc.getPlayer(this.currentUser.playerId);
        this.currentPlayer.$loaded()
          .then(() => {
            this.canChangeAttendance = true;
          });
      } else {
        this.currentPlayer = null;
      }
    }

    $postLink() {
      this.attendanceInputs.on('input', () => this.changeAttendance(this.playerAttendance.attendance));
    }

    $onDestroy() {
      if (this.games && _.isFunction(this.games.$destroy)) {
        this.games.$destroy();
      }
      if (this.currentPlayer && _.isFunction(this.currentPlayer.$destroy)) {
        this.currentPlayer.$destroy();
      }

      this.attendanceInputs.off();
    }

    gameSelectionChanged(selectedId) {
      this.selectedGame = _.find(this.games, {$id: selectedId});
      this.gameTitle = this.selectedGame.title;
      if (!this.gameTitle) {
        let gameDate = this.$filter('date')(this.selectedGame.date, this.dateFormat);
        this.gameTitle = `${gameDate} @ ${this.selectedGame.location}`;
      }

      if (this.attendingPlayers && _.isFunction(this.attendingPlayers.$destroy)) {
        this.attendingPlayers.$destroy();
      }
      this.attendingPlayers = this.playersGames.getApprovalsForGame(this.selectedGame.$id);
      let currentAttendancePromise = this.attendingPlayers.$loaded()
        .then(this.buildAttendanceCounts.bind(this));
      this.$q.all([this.currentPlayer.$loaded(), currentAttendancePromise])
        .then(this.setCurrentChoices.bind(this));
    }

    changeAttendance(answer) {
      if (!this.canChangeAttendance) {
        return;
      }
      this.playerAttendance.attendance = answer;
      this.playersGames.changePlayerApproval({
        gameId: this.selectedGame.$id,
        playerId: this.currentPlayer.$id,
        player: this.currentPlayer,
        attendance: this.playerAttendance.attendance || 'no',
        guests: this.playerAttendance.guests,
        message: this.playerAttendance.message
      })
        .then(this.buildAttendanceCounts.bind(this));
    }

    buildAttendanceCounts() {
      if (!this.attendingPlayers) {
        this.attendingPlayers = this.playersGames.getApprovalsForGame(this.selectedGame.$id);
        return this.attendingPlayers.$loaded()
          .then(this.buildAttendanceCounts.bind(this));
      }
      this.attendanceCount = _.groupBy(this.attendingPlayers, 'attendance');
      this.availableAnswers.forEach(answer => {
        if (this.attendanceCount[answer]) {
          this.attendanceCount[answer].forEach(attendance => {
            if (attendance.guests) {
              for (let i = 0; i < attendance.guests; i++) {
                this.attendanceCount[answer].push({
                  displayName: `Guest ${i + 1} of ${attendance.displayName}`,
                  attendance: answer
                });
              }
            }
          });
        }
      });
    }

    setCurrentChoices() {
      let currentChoice = _.find(this.attendingPlayers, {$id: this.currentPlayer.$id});
      this.playerAttendance.guests = 0;
      this.playerAttendance.message = '';
      this.playerAttendance.attendance = '';
      if (currentChoice) {
        this.playerAttendance = _.pick(currentChoice, ['attendance', 'guests', 'message']);
      }
    }

    showOnMap() {
      this.gameLocationDialogSvc.open(this.selectedGame.address);
    }

    _mapGamesForPicker() {
      this.gamesForPicker = _.orderBy(this.games, ['date'], ['asc'])
        .filter(game => game.date > this.YESTERDAY);
      if (!this.selectedGame && this.gamesForPicker.length) {
        this.gameSelectionChanged(this.gamesForPicker[0].$id);
      }
    }

    _formatGameDate(game) {
      return this.$filter('date')(game.date, this.dateFormat);
    }
  }

  angular.module('pokerManager')
    .component('rsvpView', {
      controller: RSVPController,
      templateUrl: 'scripts/manager/rsvp-view-tmpl.html',
      bindings: {
        currentUser: '<',
        communityId: '<'
      }
    });
}());
