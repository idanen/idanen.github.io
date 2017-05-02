(function () {
  'use strict';

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
          limitPlayers: 100,
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
  });
}());
