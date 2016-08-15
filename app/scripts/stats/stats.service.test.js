(function () {
  'use strict';

  describe('stats.service tests', function () {
    var statsSvc,
        forAvg = [
          {
            notToSum: 100,
            toSum: 1
          },
          {
            notToSum: 200,
            toSum: 2
          },
          {
            notToSum: 300,
            toSum: 3
          }
        ],
        expectedAvg = 2;

    beforeEach(angular.mock.module('pokerManager'));

    beforeEach(function () {
      module();
      inject(function (Stats) {
        statsSvc = Stats;
      });
    });

    it('should calculate average', function () {
      var avg = statsSvc.average(forAvg, 'toSum');

      expect(avg).toEqual(expectedAvg);
    });
  });
}());
