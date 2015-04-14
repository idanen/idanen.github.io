/**
 * The managed game's directive
 */
angular.module( 'pokerManager' ).
	directive( 'playerDetails', [ '$filter', '$timeout', 'Players', 'Model', function( $filter, $timeout, Players, Model ) {
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
			controller: [ '$scope', function ( $scope ) {
				$scope.isAdmin = function() {
					return ( window.location.pathname.indexOf( 'manage.html' ) > -1 );
				};
				
				/*
				$scope.isAdmin = function() {
					return $scope.admin;
				};
				*/
			} ],
			templateUrl: 'partials/tmpls/player-details-tmpl.html',
			link: function( scope, element, attrs ) {
				var chartData = createData( scope.player ),
					chartHolder = angular.element('<div/>'),
					chartObj = createChartObject( scope.player.name, chartData ),
					refreshBtn = element.find( '.refresh-data-btn' );

				function refreshData() {
					chartData = createData( scope.player );

					chartHolder.highcharts().destroy();

					updateChartData( chartObj, chartData );
					chartHolder.highcharts( chartObj );
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
		};
	} ] );