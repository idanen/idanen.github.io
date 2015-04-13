/* Directives */

angular.module( 'pokerManager.directives', [] ).
	directive( 'onGoingGame', [ function () {
		'use strict';

		return {
			restrict: 'EA',
			scope: {
				game: '=',
				saveSuccessCallback: '=?',
				saveFailCallback: '=?'
			},
			controller: 'GameCtrl',
			controllerAs: 'vm',
			templateUrl: 'partials/tmpls/on-going-game-tmpl.html',
			link: {
				pre: function ( scope, element, attrs ) {
					// scope.game = scope.$eval( attrs.onGoingGame );
				}
			}
		};
	} ] ).
	directive( 'playerCard', [ function () {
		'use strict';

		return {
			restrict: 'E',
			scope: {
				player: '='
			},
			templateUrl: 'partials/tmpls/player-card-tmpl.html',
			replace: 'true',
			require: '^onGoingGame',
			link: {
				pre: function ( scope, element, attrs, gameCtrl ) {
					scope.gameCtrl = gameCtrl;
				}
			}
		};
	} ] ).
	directive( 'showData', [ '$filter', '$timeout', 'Players', 'Model', function( $filter, $timeout, Players, Model ) {
		'use strict';

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

		return {
			restrict: 'AE',
			scope: {
				player: '='
			},
			link: function( scope, element, attrs ) {
				var chartData = createData( scope.player ),
					chartHolder = angular.element('<div/>'),
					chartObj = createChartObject( scope.player.name, chartData );

				function refreshData() {
					chartData = createData( scope.player );

					chartHolder.highcharts().destroy();

					updateChartData( chartObj, chartData );
					chartHolder.highcharts( chartObj );
				}
			
				// Create a placeholder for the chart
				element.after( chartHolder );
				chartHolder.attr( 'id', 'player-chart' );

				// Construct chart on next $digest loop so the chart container will fill width
				$timeout( function () {
					chartHolder.highcharts( chartObj );
				}, 0, false);

				if ( !scope.player.isNew ) {
					scope.player = Players.get( { playerId: scope.player.id }, refreshData );
				}
				
				element.click( refreshData );

				scope.$on( '$destroy', function () {
					if ( chartHolder ) {
						chartHolder.highcharts().destroy();
						chartHolder.remove();
					}
				} );
			}
		};
	} ] ).
  directive( 'appVersion', [ 'version', function( version ) {
	'use strict';

    return function( scope, elm, attrs ) {
      elm.text( version );
    };
  } ] );
