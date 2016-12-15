(function () {
  'use strict';

  class AttendancePanelController {
    static get $inject() {
      return ['$element', 'playersGames', 'userService', 'Players', 'communitiesSvc'];
    }
    constructor($element, playersGames, userService, Players, communitiesSvc) {
      this.$element = $element;
      this.playersGames = playersGames;
      this.userService = userService;
      this.playersSvc = Players;
      this.communitiesSvc = communitiesSvc;

      this.attendingPlayers = playersGames.getApprovalsForGame(this.gameId);

      this.userService.onUserChange(currentUser => this.userChanged(currentUser));
    }

    $onInit() {
      this.attendingPlayers.$loaded()
        .then(this.buildAttendanceCounts.bind(this));
    }

    $postLink() {
      this.$element.find('.game-approve-panel').on('tap', 'paper-button', this.changeAttendance.bind(this));
    }

    $onChanges(changes) {
      if (changes && changes.gameId && changes.gameId.currentValue !== changes.gameId.previousValue) {
        if (this.attendingPlayers && _.isFunction(this.attendingPlayers.$destroy)) {
          this.attendingPlayers.$destroy();
        }

        this.attendingPlayers = this.playersGames.getApprovalsForGame(this.gameId);
      }
    }

    userChanged(currentUser) {
      this.currentUser = currentUser;
      this.updateCurrentPlayer();
      this.updateIsAdmin();
    }

    updateCurrentPlayer() {
      if (this.currentUser) {
        if (this.currentPlayer && _.isFunction(this.currentPlayer.$destroy)) {
          this.currentPlayer.$destroy();
        }

        this.currentPlayer = this.playersSvc.getPlayer(this.currentUser.playerId);
      } else {
        this.currentPlayer = null;
      }
    }

    updateIsAdmin() {
      if (this.currentUser) {
        this.communitiesSvc.isAdmin(this.currentUser.playerId, this.communityId)
          .then(isAdmin => {
            this.isAdmin = isAdmin;
          });
      } else {
        this.isAdmin = false;
      }
    }

    playerSelected(playerId) {
      if (this.playerForAttendance && _.isFunction(this.playerForAttendance.$destroy)) {
        this.playerForAttendance.$destroy();
      }
      this.playerForAttendance = this.playersSvc.getPlayer(playerId);
    }

    changeAttendance(evt) {
      this.playerForAttendance.$loaded()
        .then(() => {
          let selectedBtn = angular.element(evt.target).closest('paper-button'),
              attendance = selectedBtn.length && selectedBtn[0].dataset.answer;
          this.playersGames.changePlayerApproval({
            gameId: this.gameId,
            playerId: this.playerForAttendance.$id,
            player: this.playerForAttendance,
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

    buildAttendanceCounts() {
      this.attendanceCount = _.groupBy(this.attendingPlayers, 'attendance');
      this.onUpdate({$event: this.attendanceCount});
    }
  }

  angular.module('pokerManager')
    .component('attendancePanel', {
      controller: AttendancePanelController,
      bindings: {
        players: '<',
        gameId: '<',
        communityId: '<',
        onUpdate: '&'
      },
      templateUrl: 'scripts/manager/attendance-panel-tmpl.html'
    });
}());
