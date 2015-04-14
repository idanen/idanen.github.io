/* Filters */

angular.module( 'pokerManager.filters', [] ).
  filter( 'interpolate', [ 'version', function ( version ) {
	'use strict';

    return function ( text ) {
      return String( text ).replace( /\%VERSION\%/mg, version );
    };
  } ] ).filter('percentage', ['$filter', function ($filter) {
	'use strict';

	return function ( input, decimals ) {
		return $filter( 'number' )( input * 100, decimals ) + '%';
	};
}]);
