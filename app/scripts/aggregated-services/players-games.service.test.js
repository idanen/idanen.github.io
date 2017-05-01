(function () {
  'use strict';

  describe('playersGames.service test', () => {
    let playersGames, $rootScope;

    beforeEach(module('tmpls'));
    beforeEach(module('pokerManager'));
    beforeEach(() => {
      module('global $q');
      module($provide => {
        $provide.value('$firebaseArray', () => []);
      });
      inject((_playersGames_, _$rootScope_) => {
        playersGames = _playersGames_;
        $rootScope = _$rootScope_;
      });
    });

    it('should throw error if trying to add players to a game with a limit', done => {
      const player = {};
      const game = {
        limitPlayers: 2,
        players: {
          player1: {
            displayName: 'Jake'
          },
          player2: {
            displayName: 'Jeff'
          }
        }
      };

      playersGames.addPlayerToGame(player, game)
        .then(() => {
          throw new Error('Should have rejected');
        })
        .catch(err => {
          expect(err.message).toEqual('Game is full');
          done();
        })
        .finally(done);

      $rootScope.$digest();
    });
  });
}());