(function () {
/**
 * Stats controller
 */
angular.module( 'pokerManager' ).
	controller( 'PokerStatsCtrl', PokerStatsController );

	PokerStatsController.$inject = [ '$filter', 'Utils', 'Games', 'Players', 'playerModal' ];

	function PokerStatsController( $filter, utils, Games, Players, playerModal ) {
		'use strict';

		var vm = this;

		vm.today = new Date();
		vm.totalGames = 0;
		vm.dateOptions = {
				'year-format': "'yyyy'",
				'month-format': "'MM'",
				'day-format': "'dd'"
			};
		vm.filterOptions = {
			gamesCount: [ 0, 0.1, 0.25, 0.5, 0.75 ]
		};
		vm.filter = {
			name: '',
			gamesCount: vm.filterOptions.gamesCount[ 0 ]
		};

		vm.displayGames = {
				fromDate: vm.today.setMonth( vm.today.getMonth() - 1 ),
				fromDateOpen: false,
				toDate: vm.today.setMonth( vm.today.getMonth() + 1 ),
				toDateOpen: false,
				players: [],
				filtered: []
			};

		vm.init = init;
		vm.toggleDateRange = toggleDateRange;
		vm.loadGames = loadGames;
		vm.loadLastGame = loadLastGame;
		vm.loadLastMonthGames = loadLastMonthGames;
		vm.loadLastQuarterGames = loadLastQuarterGames;
		vm.loadLastYearGames = loadLastYearGames;
		vm.loadAllTimeGames = loadAllTimeGames;
		vm.statsAvgBuyin = statsAvgBuyin;
		vm.statsAvgBuyout = statsAvgBuyout;
		vm.statsAvgGameCount = statsAvgGameCount;
		vm.statsAvgWinnings = statsAvgWinnings;
		vm.statsAvgWinningsPerGame = statsAvgWinningsPerGame;
		vm.gamesCount = gamesCount;
		vm.openPlayerDetailsDialog = openPlayerDetailsDialog;
		vm.filterPlayers = filterPlayers;
		vm.playerPredicate = playerPredicate;

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

		function loadGamesBetweenDates(from, to, gamesCountOptionIdx) {
			vm.displayGames.fromDate = formatDate(from);
			vm.displayGames.toDate = formatDate(to);
			if (!isNaN(gamesCountOptionIdx)) {
				vm.filter.gamesCount = vm.filterOptions.gamesCount[gamesCountOptionIdx || 0];
			}
			vm.displayGames.players = getPlayers();
		}

		function loadLastGame() {
			var today = new Date();
			loadGamesBetweenDates(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3), today);
		}

		function loadLastMonthGames() {
			var today = new Date();
			loadGamesBetweenDates(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()), today);
		}

		function loadLastQuarterGames() {
			var today = new Date();
			loadGamesBetweenDates(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()), today);
		}

		function loadLastYearGames() {
			var today = new Date();
			loadGamesBetweenDates(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()), today);
		}
	
		function loadAllTimeGames() {
			vm.displayGames.fromDate = formatDate(new Date( 2000, 9, 1 ));
			vm.displayGames.toDate = formatDate(new Date());
			vm.filter.gamesCount = vm.filterOptions.gamesCount[ 1 ];
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
			vm.totalGames = utils.maxCalc( vm.displayGames.players, 'gamesCount' );
			return vm.totalGames;
		}

		function filterPlayers() {
			vm.displayGames.filtered = vm.displayGames.players.filter( function ( player ) {
				return player.gamesCount > Math.floor( vm.filter.gamesCount * vm.totalGames );
			} );
		}

		function playerPredicate( player ) {
			return ( new RegExp( vm.filter.name, 'gi' ).test( player.name ) && ( player.gamesCount > Math.floor( vm.filter.gamesCount * vm.totalGames ) ) );
		}

		function openPlayerDetailsDialog( player ) {
			playerModal.open( player )
				.then( function ( savedPlayer ) {
					/*
					 * Update the local instance if the player with the changeable fields from the modal
					 */
					player.name = savedPlayer.name;
					player.phone = savedPlayer.phone;
					player.email = savedPlayer.email;

					return Players.update( savedPlayer ).$promise;
				} );
		}
	}
})();