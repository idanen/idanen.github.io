(function () {
/**
 * Game Manager controller
 */
angular.module( 'pokerManager' ).
	controller( 'PokerManagerCtrl', PokerManagerController );

	PokerManagerController.$inject = [ '$scope', '$uibModal', '$analytics', 'toaster', 'Utils', 'Players', 'Games' ];

	function PokerManagerController( $scope, $uibModal, $analytics, toaster, utils, Players, Games ) {
		'use strict';

		var vm = this;

		vm.prefs = {
				playersOpen: false
			};
		vm.dateOptions = {
				'year-format': "'yyyy'",
				'month-format': "'MM'",
				'day-format': "'dd'"
			};
		vm.today = new Date();
		vm.serverMsg = [];
		vm.players = [];
		vm.game = Games.create();

		vm.init = init;
		vm.openPlayersControl = openPlayersControl;
		vm.closePlayersControl = closePlayersControl;
		vm.saveGameToLocalStorage = saveGameToLocalStorage;
		vm.loadLocalStorageGame = loadLocalStorageGame;
		vm.refreshPlayersList = refreshPlayersList;
		vm.clearCurrentGame = clearCurrentGame;
		vm.addServerMsg = addServerMsg;
		vm.closeServerMsg = closeServerMsg;
		vm.addPlayerToGame = addPlayerToGame;
		vm.gameSaved = gameSaved;
		vm.saveGameFailed = saveGameFailed;
		vm.openPlayerDetailsDialog = openPlayerDetailsDialog;

		vm.init();

		function playerSaved( savedPlayer ) {
			// console.log('savedPlayer = ' + savedPlayer);
			var isNew = true,
				playerIdx, len,
				players = vm.players;

			for ( playerIdx = 0, len = players.length; playerIdx < len; ++playerIdx ) {
				if ( players[ playerIdx ].id === savedPlayer.id) {
					isNew = false;
					break;
				}
			}

			if ( isNew ) {
				players.push( savedPlayer );
			} else {
				players[ playerIdx ] = savedPlayer;
			}
		}

		function openPlayersControl() {
			vm.prefs.playersOpen = !vm.prefs.playersOpen;
		}

		function closePlayersControl() {
			vm.prefs.playersOpen = false;
		}

		function saveGameToLocalStorage() {
			utils.saveLocal( 'game', vm.game );
		}

		function loadLocalStorageGame() {
			var oldChipValue = vm.game.settings.chipValue,
				newChipValue;

			function playerEntity( aPlayer ) {
				var found;
				found = vm.players.filter( function( player, i ) {
					return ( player.name === aPlayer.name );
				} );

				return found && found[0];
			}

			vm.game = utils.loadLocal( 'game' );
			newChipValue = parseInt( vm.game.settings.chipValue, 10 );
			// Players in game should be with same reference as players returned by the server
			for ( var i = 0; i < vm.game.players.length; ++i ) {
				var foundPlayer = playerEntity( vm.game.players[ i ] );

				if ( foundPlayer ) {
					// Copy fields from saved game
					var isPlaying = vm.game.players[ i ].isPlaying,
						buyin = vm.game.players[ i ].buyin,
						buyout = vm.game.players[ i ].buyout,
						currentChipCount = vm.game.players[ i ].currentChipCount * ( ( oldChipValue != newChipValue ) ? oldChipValue / newChipValue : 1 ),
						paidHosting = vm.game.players[ i ].paidHosting;

					// Assign reference
					vm.game.players[ i ] = foundPlayer;
					// Assign values from copied fields
					vm.game.players[ i ].isPlaying = true;
					vm.game.players[ i ].buyin = buyin;
					vm.game.players[ i ].buyout = buyout;
					vm.game.players[ i ].currentChipCount = currentChipCount;
					vm.game.players[ i ].paidHosting = paidHosting;
				}
			}
		}

		function init() {
			//Refresh view
			vm.players = Players.query( function () {
				if ( localStorage.getItem( 'game' ) !== null ) {
					vm.loadLocalStorageGame();
				}
			}, function ( err ) {
				console.log( err );
			} );
		}

		function refreshPlayersList() {
			vm.init();
		}

		function clearCurrentGame() {
			// Reset is-playing state
			vm.players.forEach( function( player ) {
				player.isPlaying = false;
			} );

			// Reset game
			vm.game = Games.create();

			// Save empty game as local
			vm.saveGameToLocalStorage();
		}

		function addServerMsg(msg) {
			vm.serverMsg.push(msg);
		}

		function closeServerMsg(index) {
			vm.serverMsg.splice(index, 1);
		}

		function addPlayerToGame( player ) {
			if ( !player.isPlaying ) {
				player.isPlaying = true;
				player.buyin = 0;
				player.buyout = 0;
				player.currentChipCount = 0;
				player.paidHosting = false;
				vm.game.players.push( player );
			}

			try {
				$analytics.eventTrack( 'Join Game', { category: 'Actions', label: player.name } );
			} catch (err) {}
		}

		function gameSaved( savedGame ) {
			vm.init();
			vm.clearCurrentGame();

			// vm.addServerMsg({
			// 	txt: 'Game saved successfully',
			// 	type: 'success'
			// });
			toaster.success( 'Game save successfully', 'Woo-Hoo!' );
		}

		function saveGameFailed( err ) {
			vm.addServerMsg({
				txt: 'Error saving Game',
				type: 'error'
			});
		}

		function openPlayerDetailsDialog( player ) {
			var isNew = ( typeof( player ) === 'undefined' || player === null );

			vm.closePlayersControl();

			if (isNew) {
				player = Players.create();
			}
			var modalInstance = $uibModal.open( {
				templateUrl: '/app/partials/modals/addNewPlayer.html',
				controller: 'ModalPlayerDetailsCtrl',
				resolve: {
					player: function() {
						return player;
					}
				}
			} );

			modalInstance.result.then( function( savedPlayer ) {
				// If new -> update default values
				if ( isNew ) {
					savedPlayer.buyin = 0;
					savedPlayer.isPlaying = false;
				// Update changed fields
				}

				player = savedPlayer;

				// Model.savePlayer( player );
				Players.update( player ).$promise.then( playerSaved );
			} );
		}

		$scope.$watch( function () {
			return vm.game;
		}, function ( newVal, oldVal ) {
			// When game is loaded the $watch is called even if the new and old values are the same - preventing it here by comparing them
			if ( !angular.equals( newVal, oldVal ) ) {
				vm.saveGameToLocalStorage();
			}
		}, true );

		$scope.$watch( function () {
			return vm.game.settings.chipValue;
		}, chipsValueChanged );

		function chipsValueChanged( current, previous ) {
			if ( !current ) {
				current = vm.game.settings.chipValue = 1;
			}
			vm.game.players.forEach( function updateChipsAndValue( player, idx ) {
				if ( player.currentChipCount ) {
					player.currentChipCount = player.currentChipCount * current / ( previous || 1 );
				} else {
					player.currentChipCount = ( player.buyin * current ) * current / ( previous || 1 );
				}
			} );
		}
	}
})();
