/**
 * Created by idanen on 21/12/2015.
 */
(function () {
  'use strict';

  angular
    .module('pokerManager.services')
    .service('Stats', Stats);

  function Stats() {
    this.name = 'Stats';
  }

  Stats.prototype = {
    average: function (anArray, fieldNameToSum) {
      var sum = anArray.reduce(function (accumulated, current) {
        return accumulated + current[fieldNameToSum];
      }, 0);

      return sum / anArray.length;
    },
    standardDeviation: function (anArray, fieldNameToSum) {
      var avgSquareDiff, squareDiffs,
          avg = this.average(anArray, fieldNameToSum);
      squareDiffs = anArray.map(function (item) {
        var diff = item[fieldNameToSum] - avg;
        return diff * diff;
      });

      avgSquareDiff = this.average(squareDiffs);

      return Math.sqrt(avgSquareDiff);
    }
  };
}());
