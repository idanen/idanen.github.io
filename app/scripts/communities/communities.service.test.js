(function () {
  'use strict';

  describe('communities.service test', () => {
    describe('mapping for picker', () => {
      let communitiesSvc;

      beforeEach(() => {
        module('pokerManager');
        module($provide => {
          $provide.value('$firebaseArray', () => []);
          $provide.value('$firebaseObject', () => ({}));
          $provide.value('userService', () => ({
            getCurrentUser: () => ({uid: 'user_id', displayName: 'Some User'})
          }));
        });
        inject(_communitiesSvc_ => {
          communitiesSvc = _communitiesSvc_;
        });
      });

      it('should map communities object to community for picker', () => {
        const communitiesObj = {
          id1: 'community 1',
          id2: 'community 2',
          id3: 'community 3'
        };
        const expected = [
          {
            label: communitiesObj.id1,
            value: 'id1'
          },
          {
            label: communitiesObj.id2,
            value: 'id2'
          },
          {
            label: communitiesObj.id3,
            value: 'id3'
          }
        ];

        expect(communitiesSvc.mapCommunityForPicker(communitiesObj)).toEqual(expected);
      });

      it('should map an empty communities object to an empty array', () => {
        expect(communitiesSvc.mapCommunityForPicker({})).toEqual([]);
      });

      it('should map `undefined` object to an empty array', () => {
        expect(communitiesSvc.mapCommunityForPicker()).toEqual([]);
      });
    });
  });
}());