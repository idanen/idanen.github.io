(function () {
/**
 * The managed game's directive
 */
angular.module( 'pokerManager' ).
	directive( 'playerDetails', playerDetailsDirective );

	playerDetailsDirective.$inject = [ '$filter', '$timeout', 'Players', 'Stats' ];

	function playerDetailsDirective( $filter, $timeout, Players, stats ) {
		'use strict';

		return {
			restrict: 'AE',
			scope: {
				player: '='
			},
			controller: 'PlayerDetailsCtrl',
			templateUrl: '/app/partials/tmpls/player-details-tmpl.html',
			link: postLinkFn
		};

		function postLinkFn( scope, element, attrs, ctrl ) {
			var chartData = createData( scope.player ),
				chartHolder = angular.element('<div/>'),
				chartObj = createChartObject( scope.player.name, chartData ),
				refreshBtn = element.find( '.refresh-data-btn' );

			function refreshData() {
				scope.loading = false;

				// Calculate extra data
				scope.player.winningSessions = winningSessions( scope.player );
				scope.player.avgWinning = avgWinning( scope.player, true );

				chartData = createData( scope.player );

				chartHolder.highcharts().destroy();

				updateChartData( chartObj, chartData );

				// Defer the chart build so that it could take the parent's width (the parent is hidden until $digest will be done to update the ng-show)
				$timeout( function () {
					chartHolder.highcharts( chartObj );
				}, 0, false);
			}

			// Create a placeholder for the chart
			refreshBtn.after( chartHolder );
			chartHolder.attr( 'id', 'player-chart' );

			// Construct chart on next $digest loop so the chart container will fill width
			$timeout( function () {
				chartHolder.highcharts( chartObj );
			}, 0, false);

			if ( !scope.player.isNew ) {
				scope.player = Players.get( { playerId: scope.player.id }, refreshData );
			}

			refreshBtn.on( 'click', refreshData );

			scope.$on( '$destroy', function () {
				if ( chartHolder ) {
					chartHolder.highcharts().destroy();
					chartHolder.remove();
				}
				refreshBtn.off();
			} );
		}

		function createData( player ) {
			var chartData = {
					dates: [],
					profits: [],
					balances: []
				},
				sum = 0;

			if ( player.games ) {
				// Build data rows
				var idx = ( player.games.length > 20 ) ? player.games.length - 20 : 0;
				for ( ; idx < player.games.length; ++idx ) {
					var game = player.games[ idx ];
					if ( game.players.length ) {
						if ( angular.isNumber( game.date ) ) {
							chartData.dates.push( $filter( 'date' )( game.date, 'y-MM-dd' ) );
						} else {
							chartData.dates.push( game.date );
						}
						chartData.profits.push( game.players[ 0 ].buyout - game.players[ 0 ].buyin );
						chartData.balances.push( game.players[ 0 ].balance );
					}
				}
			}

			return chartData;
		}

		function winningSessions( player ) {
			var count = 0;
			if ( player.games && player.games.length ) {
				player.games.forEach( function ( game ) {
					if ( game && game.players && game.players.length && ( game.players[ 0 ].buyout - game.players[ 0 ].buyin ) >= 0 ) {
						count++;
					}
				} );
			}
			return count;
		}

		function avgWinning( player, bb ) {
			var sum = 0;
			if ( player.games && player.games.length ) {
				player.games.forEach( function ( game ) {
					if ( game && game.players && game.players.length ) {
						sum += ( ( game.players[ 0 ].buyout - game.players[ 0 ].buyin ) / ( bb ? 50 : 1 ) );
					}
				} );
			}
			return sum / ( player.games ? player.games.length || 1 : 1 );
		}

		function createChartObject( playerName, chartData ) {
			return {
				chart: {
				},
				title: {
					text: playerName + "'s performance"
				},
				xAxis: {
					categories: chartData.dates
				},
				tooltip: {
					formatter: function () {
						var s;
						if ( this.point.name ) { // the pie chart
							s = ''+
								this.point.name +': '+ this.y +' fruits';
						} else {
							s = ''+
								this.x  +': '+ this.y;
						}
						return s;
					}
				},
				series: [
					{
						type: 'column',
						name: playerName,
						data: chartData.profits
					},
					{
						type: 'spline',
						name: 'Balance',
						data: chartData.balances,
						marker: {
							lineWidth: 2,
							lineColor: Highcharts.getOptions().colors[ 3 ],
							fillColor: 'white'
						}
					}
				]
			};
		}

		function updateChartData( chartObj, newData ) {
			chartObj.xAxis.categories = newData.dates;
			chartObj.series[ 0 ].data = newData.profits;
			chartObj.series[ 1 ].data = newData.balances;
		}
	}
})();
