(function () {
  'use strict';

  describe('PokerManagerCtrl test', () => {
    const playersGamesMock = {
            addPlayerToGame: jasmine.createSpy('addPlayerToGame'),
            addPlayersToGame: jasmine.createSpy('addPlayersToGame'),
            getPlayersInGame: jasmine.createSpy('getPlayersInGame')
          },
          community = {
            $id: 'communityId',
            name: 'Test Community'
          },
          game = {
            $id: 'gameId1',
            limitPlayers: 100,
            players: {
              player1: {
                $id: 'player1',
                displayName: 'Jack'
              },
              player2: {
                $id: 'player2',
                displayName: 'Jake'
              },
              player3: {
                $id: 'player3',
                displayName: 'John'
              }
            }
          };
    let ctrl;

    beforeEach(module('pokerManager'));
    beforeEach(() => {
      inject(($controller, $q) => {
        community.$loaded = () => $q.resolve();
        playersGamesMock.addPlayerToGame.and.returnValue($q.resolve(game.players));
        playersGamesMock.addPlayersToGame.and.returnValue($q.resolve(game.players));
        playersGamesMock.getPlayersInGame.and.returnValue($q.resolve(game.players));

        ctrl = $controller('PokerManagerCtrl', {
          playersGames: playersGamesMock,
          game,
          community
        });
      });
    });

    it('should add player when there\'s room for a player', () => {
      const playerToAdd = {
        player4: {
          $id: 'player4',
          displayName: 'joining the game'
        }
      };
      ctrl.addPlayerToGame(playerToAdd, game);

      expect(playersGamesMock.addPlayerToGame).toHaveBeenCalledWith(playerToAdd, game);
    });
  });
}());
