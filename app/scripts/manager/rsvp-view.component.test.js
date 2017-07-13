(function () {
  'use strict';

  const emptyAttendance = {};

  const attendance = {
    player0: {
      displayName: 'friendly',
      guests: 0,
      attendance: 'yes'
    },
    player1: {
      displayName: 'player1name',
      guests: 0,
      attendance: 'maybe'
    },
    player2: {
      displayName: 'player2name',
      guests: 0,
      attendance: 'maybe'
    },
    player3: {
      displayName: 'player3name',
      guests: 0,
      attendance: 'no'
    },
    player4: {
      displayName: 'player4name',
      guests: 0,
      attendance: 'no'
    }
  };

  const attendanceWithGuests = {
    friendlyPlayer: {
      attendance: 'yes',
      displayName: 'friendly',
      guests: 2
    },
    alonePlayer: {
      attendance: 'yes',
      displayName: 'loner',
      guests: 0
    },
    noDecision: {
      displayName: 'confusing',
      attendance: 'maybe',
      guests: 2
    },
    player2: {
      displayName: 'player2name',
      attendance: 'maybe',
      guests: 1
    },
    player3: {
      displayName: 'player3name',
      attendance: 'no',
      guests: 0
    },
    player4: {
      displayName: 'player4name',
      attendance: 'no',
      guests: 0
    }
  };

  describe('rsvp-view-component test', () => {
    const $element = jQuery('<div></div>');
    const gamesSvcMock = jasmine.createSpyObj('gamesSvc', ['gamesOfCommunity']);
    const playersSvcMock = jasmine.createSpyObj('playersSvc', ['getPlayer']);
    const playersGamesMock = jasmine.createSpyObj('playersGames', ['changePlayerApproval', 'getApprovalsForGame']);
    const testPlayerId = 'testPlayerId';
    const currentPlayer = {
      $id: testPlayerId,
      displayName: 'Test Player'
    };
    let games;
    let ctrl, $rootScope;

    beforeEach(module('tmpls'));
    beforeEach(module('pokerManager'));
    beforeEach(inject(($componentController, _$rootScope_, $q) => {
      games = [
        {
          $id: 'gameId1',
          date: Date.now(),
          limitPlayers: 20,
          attending: {
            player1: {
              attendance: 'yes',
              displayName: 'Jack',
              guests: 1
            },
            player2: {
              attendance: 'yes',
              displayName: 'Jake',
              guests: 2
            },
            player3: {
              attendance: 'maybe',
              displayName: 'John'
            }
          }
        }
      ];
      currentPlayer.$loaded = () => $q.resolve();
      games[0].attending.$loaded = () => $q.resolve();
      gamesSvcMock.gamesOfCommunity.and.returnValue(games);
      playersSvcMock.getPlayer.and.returnValue(currentPlayer);
      playersGamesMock.getApprovalsForGame.and.returnValue(games[0].attending);
      playersGamesMock.changePlayerApproval.and.returnValue({then: () => {}});
      games.$watch = function (fn) {
        return $q.resolve().then(fn);
      };
      $rootScope = _$rootScope_;

      ctrl = $componentController('rsvpView', {
        Games: gamesSvcMock,
        Players: playersSvcMock,
        playersGames: playersGamesMock,
        gameLocationDialogSvc: jasmine.createSpyObj('gameLocationDialogSvc', ['open', 'close']),
        $element
      }, {
        currentUsr: {
          uid: 'userId',
          displayName: 'Test User',
          photoURL: 'http://link.to.users/image.png',
          playerId: testPlayerId
        },
        communityId: 'community1'
      });
      ctrl.$onInit();
    }));

    afterEach(() => {
      playersGamesMock.changePlayerApproval.calls.reset();
    });

    [
      buildAttendanceCase(emptyAttendance, 'empty case'),
      buildAttendanceCase(attendance, 'standard case'),
      buildAttendanceCase(attendanceWithGuests, 'guests case')
    ].forEach(attendance => {
      it(`should build attendance count properly for ${attendance.caseName}`, () => {
        ctrl.attendingPlayers = attendance.input;
        ctrl.buildAttendanceCounts();

        expect(ctrl.attendanceCount).toEqual(attendance.expected);
      });
    });

    it('should allow changing RSVP to "yes" if there\'s still room for players in the selected game', () => {
      ctrl.canChangeAttendance = true;
      ctrl.currentPlayer = currentPlayer;
      ctrl.gameSelectionChanged('gameId1');
      ctrl.buildAttendanceCounts();

      ctrl.changeAttendance('yes');

      expect(playersGamesMock.changePlayerApproval).toHaveBeenCalledWith({
        gameId: games[0].$id,
        playerId: testPlayerId,
        player: currentPlayer,
        attendance: 'yes',
        guests: ctrl.playerAttendance.guests,
        message: ctrl.playerAttendance.message
      });
    });

    it('should not allow changing RSVP to "yes" if there\'s no room for players in the selected game', () => {
      games[0].limitPlayers = 5;
      ctrl.canChangeAttendance = true;
      ctrl.currentPlayer = currentPlayer;
      ctrl.gameSelectionChanged('gameId1');
      ctrl.buildAttendanceCounts();

      ctrl.changeAttendance('yes');

      expect(playersGamesMock.changePlayerApproval).not.toHaveBeenCalled();
    });

    it('should have `gameFull` set to `false` when game is full', () => {
      ctrl.canChangeAttendance = true;
      ctrl.currentPlayer = currentPlayer;
      ctrl.gameSelectionChanged('gameId1');
      ctrl.buildAttendanceCounts();

      $rootScope.$digest();

      expect(ctrl.gameFull).toEqual(false);
    });

    it('should have `gameFull` set to `true` when game is full', () => {
      games[0].limitPlayers = 5;
      ctrl.canChangeAttendance = true;
      ctrl.currentPlayer = currentPlayer;
      ctrl.gameSelectionChanged('gameId1');
      ctrl.buildAttendanceCounts();

      $rootScope.$digest();

      expect(ctrl.gameFull).toEqual(true);
    });

    it('should have `gameFull` set to `false` limit players has an illegal value', () => {
      games[0].limitPlayers = '5';
      ctrl.canChangeAttendance = true;
      ctrl.currentPlayer = currentPlayer;
      ctrl.gameSelectionChanged('gameId1');
      ctrl.buildAttendanceCounts();

      $rootScope.$digest();

      expect(ctrl.gameFull).toEqual(false);
    });
  });

  function buildAttendanceCase(input, caseName) {
    const grouped = _.groupBy(input, 'attendance');
    const expected = {
      yes: grouped.yes || [],
      no: grouped.no || [],
      maybe: grouped.maybe || []
    };

    ['yes', 'no', 'maybe'].forEach(answer => {
      let guests = [];
      expected[answer].forEach(attendee => {
        guests = guests.concat(Array.from('a'.repeat(attendee.guests)).map((guest, i) => ({
          attendance: answer,
          displayName: `Guest ${i + 1} of ${attendee.displayName}`
        })));
      });
      expected[answer] = expected[answer].concat(guests);
    });

    return {
      input,
      caseName,
      expected
    };
  }
}());
