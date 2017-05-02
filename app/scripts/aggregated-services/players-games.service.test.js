(function () {
  'use strict';

  describe('playersGames.service test', () => {
    let playersGames, $rootScope;

    beforeEach(module('tmpls'));
    beforeEach(module('pokerManager'));
    beforeEach(() => {
      module($provide => {
        $provide.value('$firebaseArray', () => []);
      });
      inject((_playersGames_, _$rootScope_) => {
        playersGames = _playersGames_;
        $rootScope = _$rootScope_;
      });
    });
  });
}());