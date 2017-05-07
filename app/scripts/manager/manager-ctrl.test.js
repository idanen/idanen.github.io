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

    it('should map players for the players picker', () => {
      const aPlayer = {
        $id: '121212',
        displayName: 'Havier',
        games: {
          game1: {
            $id: 'game2',
            title: 'game 1',
            date: Date.now()
          },
          game2: {
            $id: 'game2',
            title: 'game 2',
            date: Date.now() - 1000 * 60 * 60 * 24
          }
        },
        phone: '0528008009',
        email: 'havier@gmail.com',
        balance: 231,
        aProperty: 'aValue'
      };
      const expected = {
        $id: '121212',
        displayName: 'Havier',
        phone: '0528008009',
        email: 'havier@gmail.com',
        balance: 231,
        gamesCount: 2
      };

      expect(ctrl._mapPlayerForPicker(aPlayer)).toEqual(expected);
    });
  });
}());
