(function () {
/**
 * Game controller
 */
angular.module( 'pokerManager' ).
	controller( 'GameCtrl', GameController );

	GameController.$inject = [ '$scope', '$analytics', '$routeParams', 'toaster', 'Games', 'Utils' ];

	function GameController( $scope, $analytics, $routeParams, toaster, Game, utils ) {
		'use strict';

		var vm = this,
			chipValue,
			defaultBuyin;

		vm.dateOptions = {
				'year-format': "'yyyy'",
				'month-format': "'MM'",
				'day-format': "'dd'"
			};

		vm.initGame = initGame;
		vm.clearGame = clearGame;
		vm.buyin = buyin;
		vm.startGame = startGame;
		vm.cancelBuyin = cancelBuyin;
		vm.cancelAddPlayer = cancelAddPlayer;
		vm.bust = bust;
		vm.buyout = buyout;
		vm.comeBack = comeBack;
		vm.chipCountUpdate = chipCountUpdate;
		vm.addOrSubtractChips = addOrSubtractChips;
		vm.totalBuyin = totalBuyin;
		vm.totalChips = totalChips;
		vm.totalHosting = totalHosting;
		vm.toggleGameDate = toggleGameDate;
		vm.isGameInProgress = isGameInProgress;
		vm.saveGame = saveGame;

		function initGame() {
			vm.game.players.splice(0, vm.game.players.length);
			vm.game.location = '';

			// vm.game = new Game();

			// angular.element.extend( vm.game, ( angular.isDefined( $scope.game ) ) ?
			// 	$scope.game :
			// 	Game.create()
			// );

			// delete vm.game.id;

		}

		function clearGame() {
			// Reset is-playing state
			vm.game.players.forEach( function( player ) {
				player.isPlaying = false;
				//player.balance += ( player.buyout - player.buyin );
			} );
			vm.game.players.splice( 0, vm.game.players.length );
			
			// Reset game
			vm.game = Game.create();
		}

		function buyin( player, rationalBuyin ) {
			var calculatedBuyin = rationalBuyin * vm.game.defaultBuyin;
			if ( !player.isPlaying ) {
				player.isPlaying = true;
				player.buyin = 0;
				player.currentChipCount = 0;
				player.paidHosting = false;
				vm.game.players.push( player );
			}
			player.buyin += calculatedBuyin;
			//player.balance -= player.buyin;
			player.currentChipCount = parseInt( player.currentChipCount, 10 ) + ( calculatedBuyin * vm.game.chipValue );
			player.buyout = player.currentChipCount / vm.game.chipValue;
			
			try {
				$analytics.eventTrack('Buyin', { category: 'Actions', label: player.name });
			} catch ( err ) {}
		}

		function startGame() {
			vm.game.players.forEach( function ( player ) {
				vm.buyin( player, 1 );
			} );
		}

		function cancelBuyin( player, rationalBuyin ) {
			var buyin = rationalBuyin * vm.game.defaultBuyin;
			player.buyin -= buyin;
			//player.balance += player.buyin;
			player.currentChipCount = parseInt( player.currentChipCount, 10 ) - ( buyin * vm.game.chipValue );
			player.buyout = player.currentChipCount / vm.game.chipValue;
		}

		function cancelAddPlayer( player ) {
			if ( player.id in vm.game.players ) {
				delete vm.game.players[ player.id ];
			}
			// Remove from current game
			//var index = vm.game.players.indexOf( player );
            //
			//if ( index > -1 ) {
			//	vm.game.players.splice( index, 1 );
			//
			//	// Reset fields
			//	if ( player ) {
			//		player.isPlaying = false;
			//		player.balance += ( player.buyout - player.buyin );
			//		player.buyin = 0;
			//		player.buyout = 0;
			//		player.currentChipCount = 0;
			//		player.paidHosting = false;
			//	}
			//}
		}

		function bust( player ) {
			player.currentChipCount = 0;
			vm.buyout( player );
		}

		function buyout( player ) {
			if ( player.isPlaying ) {
				player.isPlaying = false;
			}

			// Add payout to player's balance
			player.buyout = player.currentChipCount / vm.game.chipValue;
			//player.balance += player.buyout;
		}
	
		function comeBack( player ) {
			if ( !player.isPlaying ) {
				player.isPlaying = true;
			}

			// Add payout to player's balance
			//player.balance -= player.buyout;
		}
		
		function chipCountUpdate( player ) {
			player.buyout = player.currentChipCount / vm.game.chipValue;
		}

		function addOrSubtractChips( player, howMany, toAdd ) {
			if ( toAdd ) {
				player.currentChipCount += ( howMany * vm.game.defaultBuyin );
			} else {
				player.currentChipCount -= ( howMany * vm.game.defaultBuyin );
			}
			vm.chipCountUpdate( player );
		}
	
		function totalBuyin() {
			return utils.totalsCalc( vm.game.players, 'buyin' );
		}
	
		function totalChips() {
			return utils.totalsCalc( vm.game.players, 'currentChipCount' );
		}
		
		function totalHosting() {
			if (!vm.game.players) {
				return 0;
			}

			var sum = 0;
			for( var i = 0; i < vm.game.players.length; ++i ) {
				sum += vm.game.players[ i ].paidHosting ? 10 : 0;
			}
			return sum;
		}
	
		function toggleGameDate( $event ) {
			$event.preventDefault();
			$event.stopPropagation();
			
			vm.game.dateOpen = !vm.game.dateOpen;
		}

		function isGameInProgress() {
			return vm.players && vm.game.players.some( function ( player ) {
				return player.isPlaying;
			} );
		}

		function saveGame() {
			Game.save( vm.game ).$promise.then( function gameSaveSuccess( data ) {
				if ( angular.isFunction( $scope.saveSuccessCallback ) ) {
					$scope.saveSuccessCallback( data );
				}
			}).catch( function gameSaveFail( err ) {
				if ( angular.isFunction( $scope.saveFailCallback ) ) {
					$scope.saveFailCallback( err );
				}
			} );
		}

		$scope.$watch( 'game.chipValue', function ( newVal ) {
			chipValue = newVal;
		} );
		$scope.$watch( 'game.defaultBuyin', function ( newVal ) {
			defaultBuyin = newVal;
		} );
	}
})();
