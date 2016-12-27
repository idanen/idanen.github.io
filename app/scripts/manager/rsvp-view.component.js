(function () {
  'use strict';

  class RSVPController {
    static get $inject() {
      return ['$element', 'Games', 'Players', 'communitiesSvc', 'playersGames', '$filter', '$q'];
    }
    constructor($element, Games, Players, communitiesSvc, playersGames, $filter, $q) {
      this.$element = $element;
      this.gamesSvc = Games;
      this.playersSvc = Players;
      this.communitiesSvc = communitiesSvc;
      this.playersGames = playersGames;
      this.$filter = $filter;
      this.$q = $q;

      this.dateFormat = 'EEE, dd/MM/yyyy';

      this.attendanceMessage = '';
      this.guests = 0;
      // Need to wait for player details
      this.canChangeAttendance = false;
    }

    $onInit() {
      this.attendanceChoices = this.$element.find('input[name=attendanceChoice],.form-control');

      this.games = this.gamesSvc.gamesOfCommunity(this.communityId, 5);
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
      this.games.$loaded()
        .then(() => {
          if (this.games.length) {
            this.gameSelectionChanged(this.games[this.games.length - 1].$id);
          }
        });
      this.attendanceChoices.on('change input', () => this.changeAttendance());
    }

    $onDestroy() {
      if (this.games && _.isFunction(this.games.$destroy)) {
        this.games.$destroy();
      }
      if (this.currentPlayer && _.isFunction(this.currentPlayer.$destroy)) {
        this.currentPlayer.$destroy();
      }

      this.attendanceChoices.off();
    }

    gameSelectionChanged(selectedId) {
      this.selectedGame = _.find(this.games, {$id: selectedId});
      this.gameTitle = this.selectedGame.title;
      if (!this.gameTitle) {
        let gameDate = this.$filter('date')(this.selectedGame.date, this.dateFormat);
        this.gameTitle = `${gameDate} @ ${this.selectedGame.location}`;
      }
      Array.from(this.attendanceChoices).forEach(el => {
        el.checked = false;
        el.removeAttribute('checked');
      });

      if (this.attendingPlayers && _.isFunction(this.attendingPlayers.$destroy)) {
        this.attendingPlayers.$destroy();
      }
      this.attendingPlayers = this.playersGames.getApprovalsForGame(this.selectedGame.$id);
      let currentAttendancePromise = this.attendingPlayers.$loaded()
        .then(this.buildAttendanceCounts.bind(this));
      this.$q.all([this.currentPlayer.$loaded(), currentAttendancePromise])
        .then(this.setCurrentChoices.bind(this));
    }

    changeAttendance() {
      if (!this.canChangeAttendance) {
        return;
      }
      let chosenAttendance = this.$element.find('input[name=attendanceChoice]:checked').val();
      this.playersGames.changePlayerApproval({
        gameId: this.selectedGame.$id,
        playerId: this.currentPlayer.$id,
        player: this.currentPlayer,
        attendance: chosenAttendance || 'no',
        guests: this.guests,
        message: this.attendanceMessage
      })
        .then(this.buildAttendanceCounts.bind(this));
    }

    buildAttendanceCounts() {
      this.attendanceCount = _.groupBy(this.attendingPlayers, 'attendance');
      ['yes', 'maybe', 'no'].forEach(answer => {
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
      Array.from(this.attendanceChoices).forEach(el => {
        el.checked = false;
        el.removeAttribute('checked');
      });
      this.guests = 0;
      this.attendanceMessage = '';
      if (currentChoice) {
        this.$element[0].querySelector(`input[value=${currentChoice.attendance}]`).checked = true;
        this.guests = currentChoice.guests;
        this.attendanceMessage = currentChoice.message;
      }
    }

    _mapGamesForPicker() {
      this.gamesForPicker = this.games.map(game => {
        return {
          value: game.$id,
          label: game.title || this.$filter('date')(game.date, this.dateFormat),
          date: game.date
        };
      });
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
