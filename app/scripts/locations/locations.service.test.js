(function () {
  'use strict';

  describe('locations.service tests', function () {
    var locationSvc,
        $q,
        $rootScope,
        firebaseCommonMock = {
          getValue: jasmine.createSpy('getValue')
        };

    beforeEach(module('tmpls'));
    beforeEach(module('pokerManager'));
    beforeEach(function () {
      module($provide => {
        $provide.value('firebaseCommon', firebaseCommonMock);
        $provide.value('Ref', { child: angular.noop });
      });
      inject(function (_$q_, _$rootScope_, _locationsSvc_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        firebaseCommonMock.getValue.and.callFake(path => {
          const parts = path.split('/');
          return $q.resolve(`address of ${parts.pop()}`);
        });
        locationSvc = _locationsSvc_;
      });
    });

    it('should return address for a location name', function (done) {
      const locationName = 'aLocation';
      const communityId = 'community1';
      const expectedAddress = `address of ${locationName}`;
      locationSvc.getAddress(locationName, communityId)
        .then(actualAddress => {
          expect(actualAddress).toEqual(expectedAddress);
        })
        .catch(err => done(err))
        .finally(done);
      $rootScope.$digest();
    });

    it('should return an empty string for no location', function (done) {
      const locationName = '';
      const communityId = 'community1';
      const expectedAddress = '';

      locationSvc.getAddress(locationName, communityId)
        .then(actualAddress => {
          expect(actualAddress).toEqual(expectedAddress);
        })
        .catch(err => done(err))
        .finally(done);
      $rootScope.$digest();
    });
  });
}());
