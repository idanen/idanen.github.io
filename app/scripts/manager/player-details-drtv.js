(function () {
/**
 * The managed game's directive
 */
angular.module( 'pokerManager' ).
	directive( 'playerDetails', playerDetailsDirective );

	playerDetailsDirective.$inject = [ '$filter', '$timeout', 'Players' ];

	function playerDetailsDirective( $filter, $timeout, Players ) {
		'use strict';

		return {
			restrict: 'AE',
			scope: {
				player: '='
			},
			controller: 'PlayerDetailsCtrl',
			controllerAs: 'pCtrl',
			bindToController: true,
			templateUrl: 'partials/tmpls/player-details-tmpl.html',
			link: postLinkFn
		};

		function postLinkFn( scope, element, attrs, ctrl ) {
			var chartData = createData( ctrl.player ),
				chartHolder = angular.element('<div/>'),
				chartObj = createChartObject( ctrl.player.name, chartData ),
				refreshBtn = element.find( '.refresh-data-btn' );

			function refreshData() {
				ctrl.loading = false;

				// Calculate extra data
                ctrl.player.gamesCount = ctrl.player.games ? Object.keys(ctrl.player.games).length : 0;
				ctrl.player.winningSessions = winningSessions( ctrl.player );
				ctrl.player.avgWinning = avgWinning( ctrl.player, true );

				chartData = createData( ctrl.player );

				var chart = chartHolder.highcharts();
                if (chart) {
                    chart.destroy();
                }

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

			if ( !ctrl.player.isNew ) {
				ctrl.player = Players.getPlayer( ctrl.player.id );
                refreshData();
			} else {
				ctrl.loading = false;
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
                prev = 0;

			if ( player.games ) {
				var iterations = 0;
                _.forEach(player.games, function (gameResult) {
                    iterations += 1;
                    if (!isNaN(gameResult.date)) {
                        chartData.dates.push( $filter( 'date' )( gameResult.date, 'y-MM-dd' ) );
                    } else {
                        chartData.dates.push( gameResult.date );
                    }
                    var profit = gameResult.buyout - gameResult.buyin;
                    chartData.profits.push( profit );
                    chartData.balances.push( profit );

                    if (iterations > 20) {
                        return false;
                    }
                });
                // Accumulate balance
                chartData.balances.map(function (balance, idx, arr) {
                    chartData.balances[idx] += (arr[idx - 1] || 0);
                });

                _.forEach(player.games, function (game) {
                    game.balance = prev + (game.buyout - game.buyin);
                    prev = game.balance;
                });

                player.games = _.sortByOrder(player.games, 'date', 'desc');
			}

			return chartData;
		}

		function winningSessions( player ) {
			var count = 0;
			if ( player.games ) {
				_.forEach(player.games, function ( game ) {
					if ( game.buyout >= game.buyin ) {
						count++;
					}
				});
			}
			return count;
		}

		function avgWinning( player, bb ) {
			var sum = 0,
                gamesCount = 0;
			if ( player.games ) {
				_.forEach(player.games, function ( game ) {
                    sum += ( ( game.buyout - game.buyin ) / ( bb ? 50 : 1 ) );
                    gamesCount += 1;
				});
			}
			return sum / (gamesCount || 1);
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
