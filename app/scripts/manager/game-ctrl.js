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

		vm.initGame();

		function initGame() {

			angular.element.extend( $scope.game, new Game() );
			delete $scope.game.id;

			// vm.game = new Game();

			// angular.element.extend( vm.game, ( angular.isDefined( $scope.game ) ) ?
			// 	$scope.game :
			// 	Game.create()
			// );

			// delete vm.game.id;

		}

		function clearGame() {
			// Reset is-playing state
			$scope.game.players.forEach( function( player ) {
				player.isPlaying = false;
				player.balance += ( player.buyout - player.buyin );
			} );
			$scope.game.players.splice( 0, $scope.game.players.length );
			
			// Reset game
			$scope.game = Game.create();
		}

		function buyin( player, rationalBuyin ) {
			var buyin = rationalBuyin * defaultBuyin;
			if ( !player.isPlaying ) {
				player.isPlaying = true;
				player.buyin = 0;
				player.currentChipCount = 0;
				player.paidHosting = false;
				$scope.game.players.push( player );
			}
			player.buyin += buyin;
			player.balance -= player.buyin;
			player.currentChipCount = parseInt( player.currentChipCount, 10 ) + ( buyin * chipValue );
			player.buyout = player.currentChipCount / chipValue;
			
			try {
				$analytics.eventTrack('Buyin', { category: 'Actions', label: player.name });
			} catch ( err ) {}
		}

		function startGame() {
			$scope.game.players.forEach( function ( player ) {
				vm.buyin( player, 1 );
			} );
		}

		function cancelBuyin( player, rationalBuyin ) {
			var buyin = rationalBuyin * defaultBuyin;
			player.buyin -= buyin;
			player.balance += player.buyin;
			player.currentChipCount = parseInt( player.currentChipCount, 10 ) - ( buyin * chipValue );
			player.buyout = player.currentChipCount / chipValue;
		}

		function cancelAddPlayer( player ) {
			// Remove from current game
			var index = $scope.game.players.indexOf( player );

			if ( index > -1 ) {
				$scope.game.players.splice( index, 1 );
				
				// Reset fields
				if ( player ) {
					player.isPlaying = false;
					player.balance += ( player.buyout - player.buyin );
					player.buyin = 0;
					player.buyout = 0;
					player.currentChipCount = 0;
					player.paidHosting = false;
				}
			}
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
			player.buyout = player.currentChipCount / chipValue;
			player.balance += player.buyout;
		}
	
		function comeBack( player ) {
			if ( !player.isPlaying ) {
				player.isPlaying = true;
			}

			// Add payout to player's balance
			player.balance -= player.buyout;
		}
		
		function chipCountUpdate( player ) {
			player.buyout = player.currentChipCount / chipValue;
		}

		function addOrSubtractChips( player, howMany, toAdd ) {
			if ( toAdd ) {
				player.currentChipCount += ( howMany * defaultBuyin );
			} else {
				player.currentChipCount -= ( howMany * defaultBuyin );
			}
			vm.chipCountUpdate( player );
		}
	
		function totalBuyin() {
			return utils.totalsCalc( $scope.game.players, 'buyin' );
		}
	
		function totalChips() {
			return utils.totalsCalc( $scope.game.players, 'currentChipCount' );
		}
		
		function totalHosting() {
			var sum = 0;
			for( var i = 0; i < $scope.game.players.length; ++i ) {
				sum += $scope.game.players[ i ].paidHosting ? 10 : 0;
			}
			return sum;
		}
	
		function toggleGameDate( $event ) {
			$event.preventDefault();
			$event.stopPropagation();
			
			$scope.game.dateOpen = !$scope.game.dateOpen;
		}

		function isGameInProgress() {
			return $scope.game.players.some( function ( player ) {
				return player.isPlaying;
			} );
		}

		function saveGame() {
			Game.save( $scope.game ).$promise.then( function gameSaveSuccess( data ) {
				if ( angular.isFunction( $scope.saveSuccessCallback ) ) {
					$scope.saveSuccessCallback( data );
				}
			}).catch( function gameSaveFail( err ) {
				if ( angular.isFunction( $scope.saveFailCallback ) ) {
					$scope.saveFailCallback( err );
				}
			} );
		}

		$scope.$watch( 'game.settings.chipValue', function ( newVal ) {
			chipValue = newVal;
		} );
		$scope.$watch( 'game.settings.defaultBuyin', function ( newVal ) {
			defaultBuyin = newVal;
		} );
	}
})();
