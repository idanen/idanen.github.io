(function () {
/**
 * Stats controller
 */
angular.module( 'pokerManager' ).
	controller( 'PokerStatsCtrl', pokerStatsController );

	pokerStatsController.$inject = [ '$modal', '$filter', 'Utils', 'Games', 'Players' ];

	function pokerStatsController( $modal, $filter, utils, Games, Players ) {
		'use strict';

		var vm = this;

		vm.today = new Date();
		vm.dateOptions = {
				'year-format': "'yyyy'",
				'month-format': "'MM'",
				'day-format': "'dd'"
			};
		
		vm.displayGames = {
				fromDate: vm.today.setMonth( vm.today.getMonth() - 1 ),
				fromDateOpen: false,
				toDate: vm.today.setMonth( vm.today.getMonth() + 1 ),
				toDateOpen: false,
				players: []
			};

		vm.init = init;
		vm.toggleDateRange = toggleDateRange;
		vm.loadGames = loadGames;
		vm.loadAllTimeGames = loadAllTimeGames;
		vm.statsAvgBuyin = statsAvgBuyin;
		vm.statsAvgBuyout = statsAvgBuyout;
		vm.statsAvgGameCount = statsAvgGameCount;
		vm.statsAvgWinnings = statsAvgWinnings;
		vm.statsAvgWinningsPerGame = statsAvgWinningsPerGame;
		vm.gamesCount = gamesCount;
		vm.openPlayerDetailsDialog = openPlayerDetailsDialog;

		function playerSaved( savedPlayer ) {
			// console.log('savedPlayer = ' + savedPlayer);
			var isNew = true,
				playerIdx, len,
				players = vm.displayGames.players;
			
			isNew = players.some( function ( player ) {
				return player.id === savedPlayer.id;
			} );
			
			if ( isNew ) {
				players.push( savedPlayer );
			} else {
				savedPlayer.buyin = players[ playerIdx ].buyin;
				savedPlayer.buyout = players[ playerIdx ].buyout;
				players[ playerIdx ] = savedPlayer;
			}
		}

		function formatDate( aDate ) {
			return $filter( 'date' )( aDate, 'y-MM-dd' );
		}

		function getPlayers() {
			return Games.players( { fromDate: formatDate( vm.displayGames.fromDate ), toDate: formatDate ( vm.displayGames.toDate ) } );
		}

		function init() {
			// Refresh view
			vm.displayGames.players = getPlayers();
		}
	
		function toggleDateRange( which, $event ) {
			$event.preventDefault();
			$event.stopPropagation();
			
			if (vm.displayGames[which + 'DateOpen']) {
				vm.displayGames[which + 'DateOpen'] = false;
			} else {
				vm.displayGames[which + 'DateOpen'] = true;
			}
		}
		
		function loadGames() {
			vm.displayGames.players = getPlayers();
		}
	
		function loadAllTimeGames() {
			vm.displayGames.fromDate = new Date( 2000, 9, 1 );
			vm.displayGames.toDate = new Date();
			vm.displayGames.players = getPlayers();
		}
		
		function statsAvgBuyin() {
			return utils.avgsCalc( vm.displayGames.players, 'buyin' );
		}

		function statsAvgBuyout() {
			return utils.avgsCalc( vm.displayGames.players, 'buyout' );
		}

		function statsAvgGameCount() {
			return utils.avgsCalc( vm.displayGames.players, 'gamesCount' );
		}
		
		function statsAvgWinnings() {
			var sum = 0;
			for( var i = 0; i < vm.displayGames.players.length; ++i ) {
				sum += ( vm.displayGames.players[ i ].buyout - vm.displayGames.players[ i ].buyin );
			}
			return sum;
		}
	
		function statsAvgWinningsPerGame() {
			var sum = 0;
			for( var i = 0; i < vm.displayGames.players.length; ++i ) {
				sum += ( vm.displayGames.players[ i ].buyout - vm.displayGames.players[ i ].buyin ) / vm.displayGames.players[ i ].gamesCount;
			}
			return sum / vm.displayGames.players.length;
		}

		function gamesCount() {
			return utils.maxCalc( vm.displayGames.players, 'gamesCount' );
		}

		function openPlayerDetailsDialog( player ) {
			var isNew = ( player === null );

			if ( isNew ) {
				player = {
					name: '',
					balance: 0,
					isPlaying: false,
					buyin: 0,
					currentChipCount: 0,
					email: '',
					phone:'',
					id: 0,
					createDate: $filter( 'date' )( vm.today, 'y-MM-dd' ),
					isNew: true
				};
			}
			var modalInstance = $modal.open( {
				templateUrl: './partials/modals/addNewPlayer.html',
				controller: 'ModalPlayerDetailsCtrl',
				resolve: {
					player: function() {
						return player;
					}
				}
			} );

			modalInstance.result.then( function ( savedPlayer ) {
				// If new -> update default values
				if ( isNew ) {
					savedPlayer.buyin = 0;
					savedPlayer.isPlaying = false;
				}
				
				player = savedPlayer;
				
				Players.update( player ).$promise.then( playerSaved );
			} );
		}
	}
})();