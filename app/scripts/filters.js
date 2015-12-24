/* Filters */
(function () {
  'use strict';

  angular.module('pokerManager.filters', [])
    .filter('percentage', PercentageFilter);

  PercentageFilter.$inject = ['$filter'];
  function PercentageFilter($filter) {
    return function (input, decimals) {
      return $filter('number')(input * 100, decimals) + '%';
    };
  }
}());
