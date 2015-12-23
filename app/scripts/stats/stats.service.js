/**
 * Created by idanen on 21/12/2015.
 */
(function () {
  'use strict';

  angular
    .module('pokerManager.services')
    .provider('Stats', StatsFactory);

  function StatsFactory() {
    this.$get = [function () {
      return new Stats();
    }];
  }

  function Stats() {
  }

  Stats.prototype = {
    average: function ( anArray, fieldNameToSum ) {
      var sum = anArray.reduce( function ( sum, current ) {
        return sum + current[ fieldNameToSum ];
      }, 0 );

      return sum / anArray.length;
    },
    standardDeviation: function ( anArray, fieldNameToSum ) {
      var avg = this.average( anArray, fieldNameToSum );
      var squareDiffs = anArray.map( function ( item ) {
        var diff = item[ fieldNameToSum ] - avg;
        return diff * diff;
      } );

      var avgSquareDiff = this.average( squareDiffs );

      return Math.sqrt( avgSquareDiff );
    }
  };
}());
