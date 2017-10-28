(function () {
  'use strict';

  describe('players-svc', () => {
    let $q, $rootScope, playersSvc;

    beforeEach(module('tmpls'));
    beforeEach(module('pokerManager'));
    beforeEach(() => {
      module($provide => {
        $provide.value('$firebaseArray', () => []);
        $provide.value('$firebaseObject', () => ({
          $save: obj => Promise.resolve(obj),
          $loaded: () => Promise.resolve()
        }));
        $provide.value('firebaseCommon', () => ({
          getValue: () => Promise.resolve({uid: 'user_id', displayName: 'Some User'})
        }));
      });
      inject(function (_$q_, _$rootScope_, Players) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        playersSvc = Players;
      });
    });

    it('should create a new player with membership of type guest', () => {
      const communityId = 'community-1';
      const player = playersSvc.createPlayer(communityId);
      const expectedMembership = {
        [communityId]: {
          type: 'guest'
        }
      };

      expect(player.membership).toEqual(expectedMembership);
    });

    it('should create a new player with `guestOf` field to allow controlling security rules', () => {
      const communityId = 'community-1';
      const player = playersSvc.createPlayer(communityId);

      expect(player.guestOf).toEqual(communityId);
    });
  });
}());
