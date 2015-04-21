/* Services */

angular.module( 'pokerManager.services', [ 'ngResource' ] ).
	value( 'version', '0.1' ).
	provider( 'Utils', function utilsProvider() {
		'use strict';

		var utils = {
			totalsCalc: function ( anArray, fieldNameToSum ) {
				var sum = 0;
				for( var i = 0; i < anArray.length; ++i ) {
					sum += parseInt( anArray[ i ][ fieldNameToSum ] );
				}
				return sum;
			},
			avgsCalc: function ( anArray, fieldNameToSum ) {
				var sum = 0;
				for( var i = 0; i < anArray.length; ++i ) {
					sum += parseInt( anArray[ i ][ fieldNameToSum ] );
				}
				return ( sum / anArray.length );
			},
			maxCalc: function ( anArray, fieldNameToSum ) {
				var max = 0;
				for( var i = 0; i < anArray.length; ++i ) {
					max = Math.max( anArray[ i ][ fieldNameToSum ], max );
				}
				return max;
			},
			saveLocal: function ( key, content ) {
				if ( angular.isObject( content ) ) {
					localStorage.setItem( key, JSON.stringify( content ) );
				}
			},
			loadLocal: function ( key ) {
				return JSON.parse( localStorage.getItem( key ) );
			},
			saveToken: function ( toSave ) {
				localStorage.setItem( 'token', toSave );
			},
			getToken: function () {
				return localStorage.getItem( 'token' );
			}
		};

		this.getToken = utils.getToken;

		this.$get = [ function () {
			return utils;
		} ];
	} ).
	factory( 'Stats', [ function () {
		'use strict';

		var stats = {
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
						var sqrDiff = diff * diff;
						return sqrDiff;
					} );

					var avgSquareDiff = average( squareDiffs );

					var stdDev = Math.sqrt( avgSquareDiff );
					return stdDev;
				}
			};
		
		return stats;
	} ] );
